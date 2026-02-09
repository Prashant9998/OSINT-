"""
Configuration Management for OSINT Platform
Handles environment variables, API keys, and system settings
"""

from pydantic_settings import BaseSettings
from typing import Optional, List
import os


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    
    # Application Settings
    APP_NAME: str = "OSINT Reconnaissance Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG_MODE: bool = False
    
    # API Configuration
    API_PREFIX: str = "/api/v1"
    API_KEY: str = "osint-recon-key-2026"  # Change in production!
    
    # CORS Settings
    ALLOWED_ORIGINS: str = "*"  # Allow all origins in production, or set specific URLs
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 10
    RATE_LIMIT_PERIOD: int = 60  # seconds
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./osint_platform.db"
    
    # OSINT Module Settings
    OSINT_TIMEOUT: int = 30  # seconds per module
    MAX_SUBDOMAINS: int = 100
    MAX_GITHUB_RESULTS: int = 50
    
    # GitHub API (Optional - for higher rate limits)
    GITHUB_TOKEN: Optional[str] = None  # Set via environment variable
    
    # Security Settings
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/osint_platform.log"
    
    # Report Settings
    REPORTS_DIR: str = "reports"
    MAX_REPORT_AGE_DAYS: int = 7  # Auto-cleanup old reports
    
    # Ethical Safeguards
    ENABLE_ABUSE_DETECTION: bool = True
    MAX_SCANS_PER_TARGET_PER_DAY: int = 5
    BLOCKED_TARGETS: List[str] = [
        "localhost",
        "127.0.0.1",
        "*.gov",
        "*.mil"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()


# Create necessary directories
def init_directories():
    """Create required directories if they don't exist"""
    directories = [
        settings.REPORTS_DIR,
        os.path.dirname(settings.LOG_FILE),
        "data"
    ]
    
    for directory in directories:
        if directory and not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)


# Initialize on import
init_directories()
