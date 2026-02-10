"""
URLScan.io OSINT Module
Visual and DOM analysis of websites
"""

import aiohttp
import asyncio
from typing import Optional
from models import URLScanData
from config import settings


async def gather_urlscan_intelligence(target_url: str) -> Optional[URLScanData]:
    """
    Gather intelligence from URLScan.io
    """
    if not settings.URLSCAN_API_KEY:
        return None
        
    try:
        headers = {
            "API-Key": settings.URLSCAN_API_KEY,
            "Content-Type": "application/json"
        }
        
        # 1. Submit Scan
        submit_url = "https://urlscan.io/api/v1/scan/"
        payload = {
            "url": target_url,
            "public": "on"
        }
        
        async with aiohttp.ClientSession() as session:
            # Submit scan
            async with session.post(submit_url, headers=headers, json=payload, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status == 200:
                    data = await response.json()
                    result_url = data.get('result', '')
                    api_url = data.get('api', '')
                    
                    # We usually need to wait for the scan to finish, but for async efficiency 
                    # we might just return the result URL for the user to checking later,
                    # OR we can check if there's already a recent scan.
                    
                    # For now, let's try to search for an EXISTING scan to avoid waiting
                    pass
                elif response.status == 429:
                    print("URLScan rate limit reached")
            
            # 2. Search for existing scan (faster/better for OSINT lookup)
            search_url = f"https://urlscan.io/api/v1/search/?q=domain:{target_url.replace('https://', '').replace('http://', '').strip('/')}"
            
            async with session.get(search_url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status == 200:
                    data = await response.json()
                    results = data.get('results', [])
                    
                    if results:
                        last_scan = results[0]
                        task = last_scan.get('task', {})
                        page = last_scan.get('page', {})
                        stats = last_scan.get('stats', {})
                        
                        return URLScanData(
                            url=task.get('url', target_url),
                            result_url=last_scan.get('result'),
                            screenshot_url=last_scan.get('screenshot'),
                            malicious=stats.get('malicious', 0) > 0,
                            score=stats.get('uniqIPs', 0) # Just using unique IPs as a metric for now
                        )
                        
        return None

    except Exception as e:
        print(f"URLScan error for {target_url}: {e}")
        return None
