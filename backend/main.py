"""
FastAPI Main Application
OSINT Reconnaissance Platform API
"""

from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from datetime import datetime
import asyncio
import traceback
import os

# Import local modules
from config import settings
from models import (
    ScanRequest, ScanResult, ScanStatusResponse, 
    HealthCheckResponse, ErrorResponse, ScanType, ModuleStatus
)
from database import init_db, get_db, log_scan, update_scan_completion, check_rate_limit, check_abuse
from security import verify_api_key, get_client_ip, generate_scan_id, is_safe_target

# OSINT Modules
from osint_modules.domain_intel import gather_domain_intelligence
from osint_modules.tech_fingerprint import fingerprint_technology_stack
from osint_modules.github_intel import gather_github_intelligence
from osint_modules.email_intel import gather_email_intelligence
from osint_modules.username_intel import gather_username_intelligence

# Intelligence
from intelligence.correlator import correlate_intelligence

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Professional OSINT Reconnaissance Platform for Ethical Hacking",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for scan results (in production, use Redis or database)
scan_results_cache = {}


@app.on_event("startup")
async def startup_event():
    """Initialize database and resources on startup"""
    await init_db()
    print(f"✅ {settings.APP_NAME} v{settings.APP_VERSION} started successfully")
    print(f"📡 API available at: {settings.API_PREFIX}")


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "OSINT Reconnaissance Platform API",
        "version": settings.APP_VERSION,
        "status": "operational",
        "docs": "/api/docs",
        "endpoints": {
            "health": "/health",
            "scan": f"{settings.API_PREFIX}/scan",
            "status": f"{settings.API_PREFIX}/scan/{{scan_id}}"
        },
        "ethical_notice": "This platform performs ONLY passive OSINT reconnaissance using public data. Always obtain permission before scanning targets."
    }


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint"""
    return HealthCheckResponse(
        status="healthy",
        version=settings.APP_VERSION,
        timestamp=datetime.utcnow(),
        modules_available=[
            "domain_intel",
            "tech_fingerprint",
            "github_intel",
            "email_intel",
            "username_intel"
        ]
    )


@app.post(f"{settings.API_PREFIX}/scan")
@limiter.limit(f"{settings.RATE_LIMIT_REQUESTS}/{settings.RATE_LIMIT_PERIOD}second")
async def initiate_scan(
    request: Request,
    scan_request: ScanRequest,
    api_key: str = Depends(verify_api_key)
):
    """
    Initiate an OSINT scan
    
    Requires API key authentication via X-API-Key header
    """
    
    # Get client IP
    client_ip = get_client_ip(request)
    
    # Validate target safety
    is_safe, error_message = is_safe_target(scan_request.target, scan_request.scan_type.value)
    if not is_safe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Target validation failed: {error_message}"
        )
    
    # Check for abuse
    async for session in get_db():
        allowed, abuse_reason = await check_abuse(
            client_ip,
            scan_request.target,
            session,
            settings.MAX_SCANS_PER_TARGET_PER_DAY
        )
        
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded: {abuse_reason}"
            )
    
    # Generate scan ID
    scan_id = generate_scan_id(scan_request.target, datetime.utcnow())
    
    # Log scan initiation
    async for session in get_db():
        await log_scan(
            scan_id=scan_id,
            target=scan_request.target,
            scan_type=scan_request.scan_type.value,
            ip_address=client_ip,
            session=session
        )
    
    # Start async scan
    asyncio.create_task(
        execute_scan(scan_id, scan_request)
    )
    
    return {
        "scan_id": scan_id,
        "status": "initiated",
        "message": "Scan started. Use /scan/{scan_id} to check status.",
        "target": scan_request.target,
        "scan_type": scan_request.scan_type
    }


async def execute_scan(scan_id: str, scan_request: ScanRequest):
    """
    Execute the actual OSINT scan asynchronously
    """
    
    start_time = datetime.utcnow()
    modules_executed = []
    
    try:
        # Initialize result
        result = ScanResult(
            scan_id=scan_id,
            target=scan_request.target,
            scan_type=scan_request.scan_type,
            status="running",
            started_at=start_time
        )
        
        # Store in cache
        scan_results_cache[scan_id] = result
        
        # Determine which modules to run based on scan type
        if scan_request.scan_type == ScanType.DOMAIN:
            # Domain scan
            result.domain_intel = await gather_domain_intelligence(
                scan_request.target,
                deep_scan=scan_request.deep_scan
            )
            modules_executed.append("domain_intel")
            
            result.tech_stack = await fingerprint_technology_stack(scan_request.target)
            modules_executed.append("tech_fingerprint")
            
            result.github_intel = await gather_github_intelligence(
                scan_request.target,
                deep_scan=scan_request.deep_scan
            )
            modules_executed.append("github_intel")
        
        elif scan_request.scan_type == ScanType.EMAIL:
            # Email scan
            result.email_intel = await gather_email_intelligence(scan_request.target)
            modules_executed.append("email_intel")
            
            # Also get domain info
            domain = scan_request.target.split('@')[1]
            result.domain_intel = await gather_domain_intelligence(domain, deep_scan=False)
            modules_executed.append("domain_intel")
        
        elif scan_request.scan_type == ScanType.USERNAME:
            # Username scan
            result.username_intel = await gather_username_intelligence(scan_request.target)
            modules_executed.append("username_intel")
        
        elif scan_request.scan_type == ScanType.FULL:
            # Full scan - everything
            result.domain_intel = await gather_domain_intelligence(
                scan_request.target,
                deep_scan=scan_request.deep_scan
            )
            modules_executed.append("domain_intel")
            
            result.tech_stack = await fingerprint_technology_stack(scan_request.target)
            modules_executed.append("tech_fingerprint")
            
            result.github_intel = await gather_github_intelligence(
                scan_request.target,
                deep_scan=scan_request.deep_scan
            )
            modules_executed.append("github_intel")
        
        # Correlate intelligence
        result.correlated_intel = correlate_intelligence(
            target=scan_request.target,
            domain_intel=result.domain_intel,
            tech_stack=result.tech_stack,
            github_intel=result.github_intel,
            email_intel=result.email_intel,
            username_intel=result.username_intel
        )
        
        # Update result
        result.status = "completed"
        result.completed_at = datetime.utcnow()
        result.modules_executed = modules_executed
        result.total_execution_time = (result.completed_at - result.started_at).total_seconds()
        
        # Update cache
        scan_results_cache[scan_id] = result
        
        # Update database
        async for session in get_db():
            await update_scan_completion(
                scan_id=scan_id,
                status="completed",
                execution_time=result.total_execution_time,
                modules=modules_executed,
                risk_level=result.correlated_intel.risk_level.value if result.correlated_intel else "unknown",
                findings_count=len(result.correlated_intel.attack_surface) if result.correlated_intel else 0,
                session=session
            )
    
    except Exception as e:
        # Handle errors
        error_msg = f"Scan failed: {str(e)}"
        print(f"❌ Error in scan {scan_id}: {error_msg}")
        print(traceback.format_exc())
        
        if scan_id in scan_results_cache:
            result = scan_results_cache[scan_id]
            result.status = "failed"
            result.completed_at = datetime.utcnow()
            scan_results_cache[scan_id] = result
        
        # Update database
        async for session in get_db():
            await update_scan_completion(
                scan_id=scan_id,
                status="failed",
                execution_time=0,
                modules=modules_executed,
                risk_level="unknown",
                findings_count=0,
                session=session,
                error=error_msg
            )


@app.get(f"{settings.API_PREFIX}/scan/{{scan_id}}")
async def get_scan_result(
    scan_id: str,
    api_key: str = Depends(verify_api_key)
):
    """
    Get scan result by ID
    """
    
    if scan_id not in scan_results_cache:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    result = scan_results_cache[scan_id]
    
    return result


@app.get(f"{settings.API_PREFIX}/scan/{{scan_id}}/status")
async def get_scan_status(
    scan_id: str,
    api_key: str = Depends(verify_api_key)
):
    """
    Get scan status (lightweight endpoint)
    """
    
    if scan_id not in scan_results_cache:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    result = scan_results_cache[scan_id]
    
    # Calculate progress
    progress = 0
    if result.status == "completed":
        progress = 100
    elif result.status == "running":
        progress = len(result.modules_executed) * 20  # Rough estimate
    
    return ScanStatusResponse(
        scan_id=scan_id,
        status=result.status,
        progress=progress,
        current_module=result.modules_executed[-1] if result.modules_executed else None,
        message=f"Scan {result.status}"
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    print(f"❌ Unhandled exception: {exc}")
    print(traceback.format_exc())
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error="Internal server error",
            detail=str(exc) if settings.DEBUG_MODE else "An error occurred",
            timestamp=datetime.utcnow()
        ).dict()
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG_MODE
    )
