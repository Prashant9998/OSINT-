"""
Security Module for OSINT Platform
API key authentication, input validation, and security utilities
"""

from fastapi import HTTPException, Security, Request, status
from fastapi.security import APIKeyHeader
from typing import Optional
import re
from config import settings
from datetime import datetime
import hashlib

# API Key Header
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(api_key: str = Security(api_key_header)) -> str:
    """
    Verify API key from request header
    """
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key is required. Include 'X-API-Key' header."
        )
    
    if api_key != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    return api_key


def sanitize_input(input_str: str) -> str:
    """
    Sanitize user input to prevent injection attacks
    """
    if not input_str:
        return ""
    
    # Remove dangerous characters
    dangerous_patterns = [
        r'<script[^>]*>.*?</script>',  # Script tags
        r'javascript:',  # JavaScript protocol
        r'on\w+\s*=',  # Event handlers
        r'<iframe',  # Iframes
        r'<object',  # Objects
        r'<embed',  # Embeds
    ]
    
    cleaned = input_str
    for pattern in dangerous_patterns:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE | re.DOTALL)
    
    # Remove control characters
    cleaned = ''.join(char for char in cleaned if ord(char) >= 32 or char in '\n\r\t')
    
    return cleaned.strip()


def validate_domain(domain: str) -> bool:
    """
    Validate domain name format
    """
    # Remove protocol if present
    domain = domain.replace('http://', '').replace('https://', '')
    domain = domain.split('/')[0]  # Remove path
    domain = domain.split(':')[0]  # Remove port
    
    # Basic domain regex
    domain_pattern = r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'
    
    if not re.match(domain_pattern, domain):
        return False
    
    # Check against blocked targets
    for blocked in settings.BLOCKED_TARGETS:
        if blocked.startswith('*.'):
            # Wildcard check
            if domain.endswith(blocked[1:]):
                return False
        elif domain == blocked:
            return False
    
    return True


def validate_email(email: str) -> bool:
    """
    Validate email format
    """
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_pattern, email))


def validate_username(username: str) -> bool:
    """
    Validate username format
    """
    # Username should be alphanumeric with underscores/hyphens
    username_pattern = r'^[a-zA-Z0-9_-]{3,30}$'
    return bool(re.match(username_pattern, username))


def get_client_ip(request: Request) -> str:
    """
    Get client IP address from request
    Handles proxy headers
    """
    # Check for forwarded IP (behind proxy)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    # Check for real IP header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fallback to direct client
    if request.client:
        return request.client.host
    
    return "unknown"


def generate_scan_id(target: str, timestamp: datetime) -> str:
    """
    Generate unique scan ID
    """
    unique_string = f"{target}-{timestamp.isoformat()}-{settings.SECRET_KEY}"
    return hashlib.sha256(unique_string.encode()).hexdigest()[:16]


def is_safe_target(target: str, scan_type: str) -> tuple[bool, Optional[str]]:
    """
    Comprehensive target safety check
    Returns (is_safe, error_message)
    """
    target = target.lower().strip()
    
    # Check for local/internal targets
    local_patterns = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '::1',
        '10.',  # Private IP
        '172.16.', '172.17.', '172.18.', '172.19.',  # Private IP ranges
        '172.20.', '172.21.', '172.22.', '172.23.',
        '172.24.', '172.25.', '172.26.', '172.27.',
        '172.28.', '172.29.', '172.30.', '172.31.',
        '192.168.',  # Private IP
    ]
    
    for pattern in local_patterns:
        if target.startswith(pattern) or pattern in target:
            return False, "Cannot scan local or internal targets"
    
    # Check for government/military domains
    sensitive_tlds = ['.gov', '.mil', '.edu']
    for tld in sensitive_tlds:
        if target.endswith(tld):
            return False, f"Scanning {tld} domains is not permitted"
    
    # Validate based on scan type
    if scan_type == "domain":
        if not validate_domain(target):
            return False, "Invalid domain format"
    elif scan_type == "email":
        if not validate_email(target):
            return False, "Invalid email format"
    elif scan_type == "username":
        if not validate_username(target):
            return False, "Invalid username format"
    
    return True, None


class SecurityHeaders:
    """
    Middleware to add security headers to responses
    """
    
    @staticmethod
    def add_security_headers(response):
        """Add security headers to response"""
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response
