"""
Email OSINT Module
Corporate email intelligence and validation
"""

import dns.resolver
import aiohttp
import re
from typing import List, Optional
from models import EmailIntelligence
import asyncio


async def validate_email_format(email: str) -> bool:
    """
    Validate email format using regex
    """
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_pattern, email))


async def get_mx_records(domain: str) -> tuple[List[str], bool]:
    """
    Get MX records for domain
    Returns (mx_servers, is_valid)
    """
    mx_servers = []
    
    try:
        answers = dns.resolver.resolve(domain, 'MX')
        mx_servers = [str(rdata.exchange).rstrip('.') for rdata in answers]
        return mx_servers, len(mx_servers) > 0
    
    except Exception as e:
        print(f"MX lookup error for {domain}: {e}")
        return [], False


async def detect_disposable_email(domain: str) -> bool:
    """
    Check if email domain is a known disposable email service
    """
    # Common disposable email domains
    disposable_domains = {
        'tempmail.com', 'guerrillamail.com', '10minutemail.com',
        'mailinator.com', 'trash-mail.com', 'throwaway.email',
        'temp-mail.org', 'getnada.com', 'maildrop.cc',
        'yopmail.com', 'fakeinbox.com'
    }
    
    return domain.lower() in disposable_domains


async def detect_email_pattern(email: str, domain: str) -> Optional[str]:
    """
    Detect corporate email pattern
    Common patterns: firstname.lastname, first.last, flast, firstlast, etc.
    """
    local_part = email.split('@')[0]
    
    patterns = {
        r'^[a-z]+\.[a-z]+$': 'firstname.lastname',
        r'^[a-z]\.[a-z]+$': 'f.lastname',
        r'^[a-z]+\.[a-z]$': 'firstname.l',
        r'^[a-z]+[a-z]+$': 'firstnamelastname',
        r'^[a-z][a-z]+$': 'flastname',
    }
    
    for pattern, description in patterns.items():
        if re.match(pattern, local_part.lower()):
            return description
    
    return "unknown"


async def check_breach_exposure(email: str) -> tuple[bool, int]:
    """
    Check if email appears in known data breaches
    Uses HaveIBeenPwned API (free, no passwords returned)
    
    NOTE: HIBP API requires User-Agent header and rate limiting
    This is metadata only - no passwords are returned
    """
    breach_found = False
    breach_count = 0
    
    try:
        # HaveIBeenPwned API v3 endpoint
        url = f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}"
        
        headers = {
            'User-Agent': 'OSINT-Platform-Educational',
            'hibp-api-key': settings.HIBP_API_KEY if hasattr(settings, 'HIBP_API_KEY') else ''
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status == 200:
                    breaches = await response.json()
                    breach_count = len(breaches)
                    breach_found = breach_count > 0
                elif response.status == 404:
                    # Not found in any breaches - good!
                    breach_found = False
                elif response.status == 401:
                    print("HIBP API key not configured - skipping breach check")
    
    except Exception as e:
        print(f"Breach check error for {email}: {e}")
    
    return breach_found, breach_count


async def assess_email_risk(email_intel: EmailIntelligence) -> str:
    """
    Assess overall email risk
    """
    risk_factors = []
    
    if not email_intel.valid_format:
        return "high"
    
    if not email_intel.mx_valid:
        risk_factors.append("No valid MX records")
    
    if email_intel.disposable:
        risk_factors.append("Disposable email service")
    
    if email_intel.breach_found:
        if email_intel.breach_count > 3:
            risk_factors.append(f"Found in {email_intel.breach_count} breaches")
        else:
            risk_factors.append("Found in data breach")
    
    if len(risk_factors) >= 2:
        return "high"
    elif len(risk_factors) == 1:
        return "medium"
    else:
        return "low"


async def gather_email_intelligence(email: str) -> EmailIntelligence:
    """
    Main function to gather email OSINT
    """
    
    email = email.lower().strip()
    
    # Validate format
    valid_format = await validate_email_format(email)
    
    if not valid_format:
        return EmailIntelligence(
            email=email,
            valid_format=False,
            mx_valid=False,
            risk_assessment="high"
        )
    
    # Extract domain
    domain = email.split('@')[1]
    
    # Run parallel checks
    results = await asyncio.gather(
        get_mx_records(domain),
        detect_disposable_email(domain),
        detect_email_pattern(email, domain),
        check_breach_exposure(email),
        return_exceptions=True
    )
    
    mx_servers, mx_valid = results[0] if not isinstance(results[0], Exception) else ([], False)
    disposable = results[1] if not isinstance(results[1], Exception) else False
    email_pattern = results[2] if not isinstance(results[2], Exception) else "unknown"
    breach_found, breach_count = results[3] if not isinstance(results[3], Exception) else (False, 0)
    
    # Build intelligence object
    email_intel = EmailIntelligence(
        email=email,
        valid_format=valid_format,
        mx_records=mx_servers,
        mx_valid=mx_valid,
        disposable=disposable,
        email_pattern=email_pattern,
        breach_found=breach_found,
        breach_count=breach_count
    )
    
    # Assess risk
    email_intel.risk_assessment = await assess_email_risk(email_intel)
    
    return email_intel
