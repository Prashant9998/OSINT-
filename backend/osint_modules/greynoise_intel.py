"""
GreyNoise OSINT Module
Internet background noise and threat intelligence
"""

import aiohttp
import asyncio
from typing import Optional
from models import GreyNoiseData
from config import settings


async def gather_greynoise_intelligence(ip_address: str) -> Optional[GreyNoiseData]:
    """
    Gather intelligence from GreyNoise Community API
    """
    if not settings.GREYNOISE_API_KEY:
        return None
        
    try:
        # Community API endpoint
        url = f"https://api.greynoise.io/v3/community/{ip_address}"
        headers = {
            "key": settings.GREYNOISE_API_KEY
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    return GreyNoiseData(
                        ip=data.get('ip', ip_address),
                        noise=data.get('noise', False),
                        riot=data.get('riot', False),
                        classification=data.get('classification'),
                        name=data.get('name'),
                        link=data.get('link'),
                        last_seen=data.get('last_seen')
                    )
                elif response.status == 404:
                    # Not found means it's likely not noise (or just unknown)
                    return GreyNoiseData(ip=ip_address, noise=False, riot=False)
                    
    except Exception as e:
        print(f"GreyNoise error for {ip_address}: {e}")
        return None
