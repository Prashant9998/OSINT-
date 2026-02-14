"""
Google Dorking OSINT Module
Automated sensitive information discovery using Google Custom Search API
"""

import aiohttp
import asyncio
from typing import Optional, List, Dict, Any
from models import GoogleDorkingData, GoogleDork
from config import settings


async def gather_google_dorking(target: str, deep_scan: bool = False) -> Optional[GoogleDorkingData]:
    """
    Perform automated Google Dorking for the target
    """
    if not settings.GOOGLE_SEARCH_API_KEY or not settings.GOOGLE_SEARCH_CX:
        return None
        
    try:
        # Define dorks based on target type
        dorks = [
            f'site:{target} filetype:env',
            f'site:{target} filetype:log',
            f'site:{target} "index of /"',
            f'site:{target} inurl:config',
            f'site:{target} "api_key"',
            f'site:{target} "password"',
        ]
        
        if deep_scan:
            dorks.extend([
                f'site:{target} filetype:sql',
                f'site:{target} filetype:bak',
                f'site:{target} intitle:"Dashboard"',
                f'site:{target} intext:"connectionstring"',
            ])
            
        all_results = []
        dorks_applied = []
        
        async with aiohttp.ClientSession() as session:
            for dork in dorks:
                api_url = f"https://www.googleapis.com/customsearch/v1"
                params = {
                    "key": settings.GOOGLE_SEARCH_API_KEY,
                    "cx": settings.GOOGLE_SEARCH_CX,
                    "q": dork,
                    "num": 5
                }
                
                async with session.get(api_url, params=params, timeout=aiohttp.ClientTimeout(total=5)) as response:
                    if response.status == 200:
                        data = await response.json()
                        items = data.get('items', [])
                        
                        for item in items:
                            all_results.append(GoogleDork(
                                title=item.get('title', 'Unknown'),
                                link=item.get('link', ''),
                                snippet=item.get('snippet'),
                                display_link=item.get('displayLink')
                            ))
                        
                        dorks_applied.append(dork)
                        
                # Add a small delay between dorks to avoid rate limiting
                await asyncio.sleep(0.5)
                
                # Limit to first few dorks unless deep scan is on
                if not deep_scan and len(dorks_applied) >= 3:
                    break
        
        return GoogleDorkingData(
            target=target,
            results=all_results,
            total_results=len(all_results),
            dorks_applied=dorks_applied
        )
        
    except Exception as e:
        print(f"Google Dorking error for {target}: {e}")
        return None
