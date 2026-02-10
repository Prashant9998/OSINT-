"""
Google Safe Browsing OSINT Module
Phishing and malware URL detection
"""

import aiohttp
import asyncio
from typing import Optional, List
from models import SafeBrowsingData
from config import settings


async def check_safe_browsing(url: str) -> Optional[SafeBrowsingData]:
    """
    Check URL against Google Safe Browsing API
    """
    if not settings.GOOGLE_SAFE_BROWSING_KEY:
        return None
        
    try:
        api_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={settings.GOOGLE_SAFE_BROWSING_KEY}"
        
        payload = {
            "client": {
                "clientId": "osint-platform",
                "clientVersion": "1.0.0"
            },
            "threatInfo": {
                "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [
                    {"url": url}
                ]
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(api_url, json=payload, timeout=aiohttp.ClientTimeout(total=5)) as response:
                if response.status == 200:
                    data = await response.json()
                    matches = data.get('matches', [])
                    
                    return SafeBrowsingData(
                        url=url,
                        matches=matches,
                        is_safe=len(matches) == 0
                    )
                    
    except Exception as e:
        print(f"Safe Browsing error for {url}: {e}")
        return None
