"""
SecurityTrails OSINT Module
Historical DNS and subdomain discovery
"""

import aiohttp
import asyncio
from typing import Optional
from models import SecurityTrailsData
from config import settings


async def gather_securitytrails_intelligence(domain: str) -> Optional[SecurityTrailsData]:
    """
    Gather intelligence from SecurityTrails
    """
    if not settings.SECURITYTRAILS_API_KEY:
        return None
        
    try:
        headers = {
            "APIKEY": settings.SECURITYTRAILS_API_KEY
        }
        
        # 1. Get Subdomains
        url = f"https://api.securitytrails.com/v1/domain/{domain}/subdomains"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status == 200:
                    data = await response.json()
                    subdomains = data.get('subdomains', [])
                    
                    full_subdomains = [f"{sub}.{domain}" for sub in subdomains[:100]]
                    
                    # 2. Get DNS History count (rough estimate via history endpoint usually invalid on free tier for details, 
                    # but we can try to just return the subdomain data for now or check account usage)
                    # For this implementation, we focus on subdomains which is the main free feature.
                    
                    return SecurityTrailsData(
                        domain=domain,
                        subdomains=full_subdomains,
                        subdomain_count=len(subdomains),
                        history_records=0 # Placeholder as historical data is paid/limited
                    )
                elif response.status == 429:
                    print("SecurityTrails rate limit reached")
                    return None
                    
    except Exception as e:
        print(f"SecurityTrails error for {domain}: {e}")
        return None
