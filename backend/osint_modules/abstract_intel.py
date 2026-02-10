"""
Abstract OSINT Module
Data validation and geolocation
"""

import aiohttp
import asyncio
from typing import Optional, Dict, Any
from models import AbstractData
from config import settings


async def gather_abstract_intelligence(target: str, target_type: str = "ip") -> Optional[AbstractData]:
    """
    Gather intelligence from Abstract APIs.
    target_type can be 'ip', 'email', 'phone'
    """
    if not settings.ABSTRACT_API_KEY:
        return None
        
    try:
        data = AbstractData(target=target)
        key = settings.ABSTRACT_API_KEY
        
        async with aiohttp.ClientSession() as session:
            # IP Geolocation
            if target_type == "ip":
                url = f"https://ipgeolocation.abstractapi.com/v1/?api_key={key}&ip_address={target}"
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                    if response.status == 200:
                        data.geolocation = await response.json()
                        
            # Email Validation
            elif target_type == "email":
                url = f"https://emailvalidation.abstractapi.com/v1/?api_key={key}&email={target}"
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                    if response.status == 200:
                        data.email_validation = await response.json()
            
            # Phone Validation (requires knowing it's a phone number)
            elif target_type == "phone":
                url = f"https://phonevalidation.abstractapi.com/v1/?api_key={key}&phone={target}"
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                    if response.status == 200:
                        data.phone_validation = await response.json()
                        
        return data

    except Exception as e:
        print(f"Abstract API error for {target}: {e}")
        return None
