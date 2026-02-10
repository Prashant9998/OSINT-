"""
VirusTotal OSINT Module
Threat intelligence using VirusTotal API v3
"""

import aiohttp
import asyncio
import base64
from typing import Optional
from models import VirusTotalData
from config import settings


async def gather_virustotal_intelligence(target: str, is_ip: bool = False) -> Optional[VirusTotalData]:
    """
    Gather intelligence from VirusTotal
    """
    if not settings.VIRUSTOTAL_API_KEY:
        return None
        
    try:
        headers = {
            "x-apikey": settings.VIRUSTOTAL_API_KEY
        }
        
        # Determine endpoint and ID
        if is_ip:
            endpoint = f"ip_addresses/{target}"
        else:
            # Domains must be passed as is, URLs must be base64 encoded (we'll stick to domains for now)
            endpoint = f"domains/{target}"
            
        url = f"https://www.virustotal.com/api/v3/{endpoint}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=15)) as response:
                if response.status == 200:
                    data = await response.json()
                    attributes = data.get('data', {}).get('attributes', {})
                    stats = attributes.get('last_analysis_stats', {})
                    
                    return VirusTotalData(
                        target=target,
                        reputation=attributes.get('reputation', 0),
                        malicious_count=stats.get('malicious', 0),
                        suspicious_count=stats.get('suspicious', 0),
                        harmless_count=stats.get('harmless', 0),
                        total_engines=sum(stats.values()),
                        permalink=f"https://www.virustotal.com/gui/{'ip-address' if is_ip else 'domain'}/{target}",
                        categories=list(attributes.get('categories', {}).values())[:5],
                        last_analysis_date=attributes.get('last_analysis_date')
                    )
                elif response.status == 404:
                    return None
                elif response.status == 401:
                    print("Invalid VirusTotal API Key")
                    return None
                    
    except Exception as e:
        print(f"VirusTotal error for {target}: {e}")
        return None
