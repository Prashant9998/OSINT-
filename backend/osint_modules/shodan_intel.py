"""
Shodan OSINT Module
Infrastructure intelligence using Shodan API
"""

import aiohttp
import asyncio
from typing import Optional, Dict, Any
from models import ShodanData
from config import settings


async def gather_shodan_intelligence(ip_address: str) -> Optional[ShodanData]:
    """
    Gather intelligence from Shodan for a given IP address
    """
    if not settings.SHODAN_API_KEY:
        return None
        
    try:
        url = f"https://api.shodan.io/shodan/host/{ip_address}?key={settings.SHODAN_API_KEY}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    return ShodanData(
                        ip=data.get('ip_str', ip_address),
                        ports=data.get('ports', []),
                        hostnames=data.get('hostnames', []),
                        tags=data.get('tags', []),
                        vulnerabilities=data.get('vulns', []),
                        os=data.get('os'),
                        isp=data.get('isp'),
                        city=data.get('city'),
                        country_name=data.get('country_name'),
                        last_update=data.get('last_update')
                    )
                elif response.status == 404:
                    return None  # IP not found in Shodan
                elif response.status == 401:
                    print("Invalid Shodan API Key")
                    return None
                    
    except Exception as e:
        print(f"Shodan error for {ip_address}: {e}")
        return None
