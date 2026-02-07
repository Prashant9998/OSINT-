"""
Domain Intelligence Module
Comprehensive domain OSINT including WHOIS, DNS, and subdomain discovery
"""

import whois
import dns.resolver
import aiohttp
import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime
from models import WHOISData, DNSData, DNSRecord, Subdomain, DomainIntelligence
from config import settings
import socket
import ssl


async def get_whois_data(domain: str) -> Optional[WHOISData]:
    """
    Extract WHOIS information for a domain
    Uses python-whois library (free, no API key needed)
    """
    try:
        # Run WHOIS in thread pool (blocking operation)
        loop = asyncio.get_event_loop()
        whois_data = await loop.run_in_executor(None, whois.whois, domain)
        
        if not whois_data:
            return None
        
        # Calculate domain age
        domain_age_days = None
        creation_date = whois_data.creation_date
        if creation_date:
            if isinstance(creation_date, list):
                creation_date = creation_date[0]
            domain_age_days = (datetime.now() - creation_date).days
        
        # Parse expiration date
        expiration_date = whois_data.expiration_date
        if isinstance(expiration_date, list):
            expiration_date = expiration_date[0]
        
        # Parse updated date
        updated_date = whois_data.updated_date
        if isinstance(updated_date, list):
            updated_date = updated_date[0]
        
        # Parse name servers
        name_servers = whois_data.name_servers or []
        if isinstance(name_servers, str):
            name_servers = [name_servers]
        name_servers = [ns.lower() for ns in name_servers if ns]
        
        # Parse status
        status_list = whois_data.status or []
        if isinstance(status_list, str):
            status_list = [status_list]
        
        return WHOISData(
            domain=domain,
            registrar=whois_data.registrar,
            creation_date=creation_date.isoformat() if creation_date else None,
            expiration_date=expiration_date.isoformat() if expiration_date else None,
            updated_date=updated_date.isoformat() if updated_date else None,
            registrant_org=whois_data.org,
            registrant_country=whois_data.country,
            name_servers=name_servers,
            status=status_list,
            domain_age_days=domain_age_days
        )
    
    except Exception as e:
        print(f"WHOIS error for {domain}: {e}")
        return None


async def get_dns_records(domain: str) -> Optional[DNSData]:
    """
    Retrieve DNS records for a domain
    Uses dnspython library (free, no API key needed)
    """
    try:
        dns_data = DNSData(domain=domain)
        
        # Get A records (IPv4)
        try:
            answers = dns.resolver.resolve(domain, 'A')
            dns_data.a_records = [str(rdata) for rdata in answers]
        except Exception:
            pass
        
        # Get AAAA records (IPv6)
        try:
            answers = dns.resolver.resolve(domain, 'AAAA')
            dns_data.aaaa_records = [str(rdata) for rdata in answers]
        except Exception:
            pass
        
        # Get MX records (Mail)
        try:
            answers = dns.resolver.resolve(domain, 'MX')
            dns_data.mx_records = [
                DNSRecord(
                    record_type="MX",
                    value=str(rdata.exchange),
                    ttl=answers.rrset.ttl
                )
                for rdata in answers
            ]
        except Exception:
            pass
        
        # Get TXT records
        try:
            answers = dns.resolver.resolve(domain, 'TXT')
            dns_data.txt_records = [str(rdata) for rdata in answers]
        except Exception:
            pass
        
        # Get NS records (Name Servers)
        try:
            answers = dns.resolver.resolve(domain, 'NS')
            dns_data.ns_records = [str(rdata) for rdata in answers]
        except Exception:
            pass
        
        # Get CNAME records
        try:
            answers = dns.resolver.resolve(domain, 'CNAME')
            dns_data.cname_records = [str(rdata) for rdata in answers]
        except Exception:
            pass
        
        return dns_data
    
    except Exception as e:
        print(f"DNS error for {domain}: {e}")
        return None


async def discover_subdomains_crtsh(domain: str, max_results: int = 100) -> List[Subdomain]:
    """
    Discover subdomains using Certificate Transparency logs via crt.sh
    FREE public API, no authentication required
    """
    subdomains = []
    
    try:
        url = f"https://crt.sh/?q=%.{domain}&output=json"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Extract unique subdomains
                    seen_subdomains = set()
                    
                    for entry in data[:max_results]:
                        name_value = entry.get('name_value', '')
                        
                        # Split by newlines (sometimes multiple domains in one entry)
                        domains_in_entry = name_value.split('\n')
                        
                        for sub in domains_in_entry:
                            sub = sub.strip().lower()
                            
                            # Remove wildcards
                            sub = sub.replace('*.', '')
                            
                            # Only include if it's a subdomain of our target
                            if sub.endswith(domain) and sub not in seen_subdomains:
                                seen_subdomains.add(sub)
                                
                                subdomains.append(Subdomain(
                                    subdomain=sub,
                                    source="crt.sh",
                                    first_seen=entry.get('entry_timestamp')
                                ))
                    
                    # Limit results
                    return subdomains[:max_results]
    
    except Exception as e:
        print(f"Subdomain discovery error for {domain}: {e}")
    
    return subdomains


async def get_ip_addresses(domain: str) -> List[str]:
    """
    Resolve domain to IP addresses
    """
    ip_addresses = []
    
    try:
        # IPv4
        loop = asyncio.get_event_loop()
        addr_info = await loop.run_in_executor(
            None,
            socket.getaddrinfo,
            domain,
            None,
            socket.AF_INET
        )
        
        for info in addr_info:
            ip = info[4][0]
            if ip not in ip_addresses:
                ip_addresses.append(ip)
    
    except Exception as e:
        print(f"IP resolution error for {domain}: {e}")
    
    return ip_addresses


async def analyze_domain_security(domain: str) -> List[str]:
    """
    Generate security insights about the domain
    """
    insights = []
    
    try:
        # Check HTTPS/SSL
        try:
            context = ssl.create_default_context()
            loop = asyncio.get_event_loop()
            
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            
            await loop.run_in_executor(None, sock.connect, (domain, 443))
            
            ssl_sock = context.wrap_socket(sock, server_hostname=domain)
            cert = ssl_sock.getpeercert()
            
            if cert:
                expiry = cert.get('notAfter')
                insights.append(f"✓ SSL certificate found, expires: {expiry}")
            
            ssl_sock.close()
            
        except Exception:
            insights.append("⚠ No valid SSL certificate detected")
        
        # Check for common security TXT records
        try:
            answers = dns.resolver.resolve(domain, 'TXT')
            txt_records = [str(rdata) for rdata in answers]
            
            has_spf = any('spf' in txt.lower() for txt in txt_records)
            has_dmarc = False
            
            try:
                dmarc_answers = dns.resolver.resolve(f'_dmarc.{domain}', 'TXT')
                has_dmarc = len(list(dmarc_answers)) > 0
            except:
                pass
            
            if has_spf:
                insights.append("✓ SPF record configured (email security)")
            else:
                insights.append("⚠ No SPF record found (email spoofing risk)")
            
            if has_dmarc:
                insights.append("✓ DMARC record configured (email authentication)")
            else:
                insights.append("⚠ No DMARC record found")
        
        except:
            pass
    
    except Exception as e:
        print(f"Security analysis error for {domain}: {e}")
    
    return insights


async def gather_domain_intelligence(domain: str, deep_scan: bool = False) -> DomainIntelligence:
    """
    Main function to gather complete domain intelligence
    Runs all checks in parallel for speed
    """
    
    # Clean domain input
    domain = domain.replace('http://', '').replace('https://', '')
    domain = domain.split('/')[0].split(':')[0].lower()
    
    # Run all OSINT tasks in parallel
    results = await asyncio.gather(
        get_whois_data(domain),
        get_dns_records(domain),
        discover_subdomains_crtsh(domain, max_results=settings.MAX_SUBDOMAINS),
        get_ip_addresses(domain),
        analyze_domain_security(domain),
        return_exceptions=True
    )
    
    whois_data = results[0] if not isinstance(results[0], Exception) else None
    dns_data = results[1] if not isinstance(results[1], Exception) else None
    subdomains = results[2] if not isinstance(results[2], Exception) else []
    ip_addresses = results[3] if not isinstance(results[3], Exception) else []
    insights = results[4] if not isinstance(results[4], Exception) else []
    
    # Additional insights
    if whois_data and whois_data.domain_age_days:
        age_years = whois_data.domain_age_days / 365
        if age_years < 1:
            insights.append(f"⚠ Domain is relatively new ({age_years:.1f} years old)")
        else:
            insights.append(f"✓ Domain is {age_years:.1f} years old (established)")
    
    if len(subdomains) > 20:
        insights.append(f"⚠ Large attack surface: {len(subdomains)} subdomains discovered")
    elif len(subdomains) > 0:
        insights.append(f"✓ {len(subdomains)} subdomains found via Certificate Transparency")
    
    return DomainIntelligence(
        domain=domain,
        whois_data=whois_data,
        dns_data=dns_data,
        subdomains=subdomains,
        subdomain_count=len(subdomains),
        ip_addresses=ip_addresses,
        insights=insights
    )
