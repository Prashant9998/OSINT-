"""
Database Module for OSINT Platform
Lightweight SQLite database for scan logs, abuse detection, and rate limiting
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
from typing import Optional, List
from config import settings

Base = declarative_base()


# Database Models
class ScanLog(Base):
    """Log of all scan requests"""
    __tablename__ = "scan_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(String(64), unique=True, index=True)
    target = Column(String(255), index=True)
    scan_type = Column(String(50))
    ip_address = Column(String(45))
    status = Column(String(50))
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    execution_time = Column(Float, nullable=True)
    modules_executed = Column(Text)  # JSON string
    risk_level = Column(String(20), nullable=True)
    findings_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)


class RateLimitLog(Base):
    """Rate limiting tracking"""
    __tablename__ = "rate_limit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(45), index=True)
    endpoint = Column(String(255))
    request_time = Column(DateTime, default=datetime.utcnow, index=True)
    blocked = Column(Boolean, default=False)


class AbuseLog(Base):
    """Abuse detection and prevention"""
    __tablename__ = "abuse_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(45), index=True)
    target = Column(String(255), index=True)
    scan_count = Column(Integer, default=1)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    blocked = Column(Boolean, default=False)
    block_reason = Column(Text, nullable=True)


# Database Engine
# Check for Railway/Heroku postgres:// URL and convert to postgresql+asyncpg://
database_url = settings.DATABASE_URL
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)

engine = create_async_engine(
    database_url,
    echo=settings.DEBUG_MODE,
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


# Database Functions
async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncSession:
    """Get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# Helper Functions
async def log_scan(
    scan_id: str,
    target: str,
    scan_type: str,
    ip_address: str,
    session: AsyncSession
):
    """Log a new scan request"""
    scan_log = ScanLog(
        scan_id=scan_id,
        target=target,
        scan_type=scan_type,
        ip_address=ip_address,
        status="started"
    )
    session.add(scan_log)
    await session.commit()
    return scan_log


async def update_scan_completion(
    scan_id: str,
    status: str,
    execution_time: float,
    modules: List[str],
    risk_level: str,
    findings_count: int,
    session: AsyncSession,
    error: Optional[str] = None
):
    """Update scan log when completed"""
    from sqlalchemy import select
    
    result = await session.execute(
        select(ScanLog).where(ScanLog.scan_id == scan_id)
    )
    scan_log = result.scalar_one_or_none()
    
    if scan_log:
        scan_log.status = status
        scan_log.completed_at = datetime.utcnow()
        scan_log.execution_time = execution_time
        scan_log.modules_executed = ",".join(modules)
        scan_log.risk_level = risk_level
        scan_log.findings_count = findings_count
        if error:
            scan_log.error_message = error
        await session.commit()


async def check_rate_limit(
    ip_address: str,
    endpoint: str,
    session: AsyncSession,
    max_requests: int = 10,
    time_window_seconds: int = 60
) -> bool:
    """Check if IP has exceeded rate limit"""
    from sqlalchemy import select, func
    
    time_threshold = datetime.utcnow() - timedelta(seconds=time_window_seconds)
    
    result = await session.execute(
        select(func.count(RateLimitLog.id))
        .where(
            RateLimitLog.ip_address == ip_address,
            RateLimitLog.endpoint == endpoint,
            RateLimitLog.request_time >= time_threshold
        )
    )
    
    count = result.scalar()
    
    # Log this request
    rate_log = RateLimitLog(
        ip_address=ip_address,
        endpoint=endpoint,
        blocked=(count >= max_requests)
    )
    session.add(rate_log)
    await session.commit()
    
    return count < max_requests


async def check_abuse(
    ip_address: str,
    target: str,
    session: AsyncSession,
    max_scans_per_day: int = 5
) -> tuple[bool, Optional[str]]:
    """Check for abusive behavior"""
    from sqlalchemy import select
    
    # Check if IP+Target combo has been scanned too many times today
    time_threshold = datetime.utcnow() - timedelta(days=1)
    
    result = await session.execute(
        select(AbuseLog)
        .where(
            AbuseLog.ip_address == ip_address,
            AbuseLog.target == target,
            AbuseLog.last_seen >= time_threshold
        )
    )
    
    abuse_log = result.scalar_one_or_none()
    
    if abuse_log:
        if abuse_log.blocked:
            return False, abuse_log.block_reason
        
        abuse_log.scan_count += 1
        abuse_log.last_seen = datetime.utcnow()
        
        if abuse_log.scan_count > max_scans_per_day:
            abuse_log.blocked = True
            abuse_log.block_reason = f"Exceeded {max_scans_per_day} scans per day for this target"
            await session.commit()
            return False, abuse_log.block_reason
    else:
        # Create new abuse log
        abuse_log = AbuseLog(
            ip_address=ip_address,
            target=target,
            scan_count=1
        )
        session.add(abuse_log)
    
    await session.commit()
    return True, None


async def cleanup_old_logs(days: int = 30):
    """Clean up old logs to prevent database bloat"""
    from sqlalchemy import delete
    
    async with AsyncSessionLocal() as session:
        time_threshold = datetime.utcnow() - timedelta(days=days)
        
        # Clean old rate limit logs
        await session.execute(
            delete(RateLimitLog).where(RateLimitLog.request_time < time_threshold)
        )
        
        # Clean old abuse logs that aren't blocked
        await session.execute(
            delete(AbuseLog).where(
                AbuseLog.last_seen < time_threshold,
                AbuseLog.blocked == False
            )
        )
        
        await session.commit()
