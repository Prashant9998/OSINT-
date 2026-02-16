"""
Phone Intelligence Module
Uses Veriphone API to validate and gather intelligence on phone numbers
"""

import aiohttp
import asyncio
from typing import Optional, List, Dict, Any
from config import settings
from models import PhoneIntelligence


async def gather_phone_intelligence(phone_number: str) -> PhoneIntelligence:
    """
    Gather intelligence on a phone number using Veriphone API
    """
    
    result = PhoneIntelligence(phone=phone_number)
    
    if not settings.VERIPHONE_API_KEY:
        result.observations.append("Veriphone API key not configured")
        return result
        
    url = "https://api.veriphone.io/v2/verify"
    params = {
        "key": settings.VERIPHONE_API_KEY,
        "phone": phone_number
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, timeout=settings.OSINT_TIMEOUT) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if data.get("status") == "success":
                        result.valid = data.get("phone_valid", False)
                        result.format_valid = data.get("phone_valid", False)
                        result.international_number = data.get("international_number")
                        result.local_number = data.get("local_number")
                        result.country = data.get("country")
                        result.country_code = data.get("country_code")
                        result.country_prefix = data.get("country_prefix")
                        result.location = data.get("location")
                        result.carrier = data.get("carrier")
                        result.line_type = data.get("phone_type")
                        
                        if result.valid:
                            result.observations.append(f"Valid {result.line_type} number in {result.country}")
                            if result.carrier:
                                result.observations.append(f"Carrier: {result.carrier}")
                        else:
                            result.observations.append("Phone number reported as invalid by Veriphone")
                    else:
                        result.observations.append(f"Veriphone API error: {data.get('message', 'Unknown error')}")
                else:
                    result.observations.append(f"HTTP Error: {response.status}")
                    
    except asyncio.TimeoutError:
        result.observations.append("Request to Veriphone timed out")
    except Exception as e:
        result.observations.append(f"Error querying Veriphone: {str(e)}")
        
    return result
