"""
Technology Stack Fingerprinting Module
Detect web technologies, frameworks, and security headers
"""

import aiohttp
from bs4 import BeautifulSoup
import re
from typing import List, Dict, Optional
from models import Technology, TechnologyStack
import asyncio


async def fetch_url_content(url: str, timeout: int = 10) -> tuple[Optional[str], Optional[Dict[str, str]]]:
    """
    Fetch URL content and headers
    """
    if not url.startswith('http'):
        url = f'https://{url}'
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                url,
                timeout=aiohttp.ClientTimeout(total=timeout),
                allow_redirects=True,
                headers={'User-Agent': 'Mozilla/5.0 (OSINT Security Scanner)'}
            ) as response:
                content = await response.text()
                headers = dict(response.headers)
                return content, headers
    
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None, None


def analyze_http_headers(headers: Dict[str, str]) -> Dict[str, any]:
    """
    Analyze HTTP headers for technology fingerprinting
    """
    findings = {
        'server': None,
        'technologies': [],
        'security_headers': {},
        'cdn': None
    }
    
    if not headers:
        return findings
    
    # Normalize header keys to lowercase
    headers_lower = {k.lower(): v for k, v in headers.items()}
    
    # Web Server Detection
    if 'server' in headers_lower:
        findings['server'] = headers_lower['server']
    
    # X-Powered-By
    if 'x-powered-by' in headers_lower:
        powered_by = headers_lower['x-powered-by']
        findings['technologies'].append(Technology(
            name=powered_by,
            category='Backend Framework',
            confidence='high',
            security_note='Server technology exposed in headers (information disclosure)'
        ))
    
    # ASP.NET Detection
    if 'x-aspnet-version' in headers_lower:
        version = headers_lower['x-aspnet-version']
        findings['technologies'].append(Technology(
            name=f'ASP.NET {version}',
            category='Web Framework',
            version=version,
            confidence='high',
            security_note='ASP.NET version exposed (potential vulnerability indicator)'
        ))
    
    # CDN Detection
    cdn_indicators = {
        'cf-ray': 'Cloudflare',
        'x-amz-cf-id': 'Amazon CloudFront',
        'x-cdn': 'Generic CDN',
        'x-cache': 'Caching Layer',
        'via': 'Proxy/CDN'
    }
    
    for header, cdn_name in cdn_indicators.items():
        if header in headers_lower:
            findings['cdn'] = cdn_name
            break
    
    # Security Headers Check
    security_headers = {
        'strict-transport-security': 'HSTS',
        'content-security-policy': 'CSP',
        'x-frame-options': 'X-Frame-Options',
        'x-content-type-options': 'X-Content-Type-Options',
        'x-xss-protection': 'X-XSS-Protection',
        'referrer-policy': 'Referrer-Policy',
        'permissions-policy': 'Permissions-Policy'
    }
    
    for header, name in security_headers.items():
        findings['security_headers'][name] = header in headers_lower
    
    return findings


def analyze_html_content(html: str) -> List[Technology]:
    """
    Analyze HTML content for framework and library detection
    """
    technologies = []
    
    if not html:
        return technologies
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # Meta tag analysis
    meta_generators = soup.find_all('meta', attrs={'name': 'generator'})
    for meta in meta_generators:
        content = meta.get('content', '')
        if content:
            technologies.append(Technology(
                name=content,
                category='CMS/Generator',
                confidence='high',
                security_note='Generator meta tag reveals system information'
            ))
    
    # JavaScript Framework Detection
    scripts = soup.find_all('script', src=True)
    
    framework_patterns = {
        'react': ('React', 'JavaScript Framework'),
        'vue': ('Vue.js', 'JavaScript Framework'),
        'angular': ('Angular', 'JavaScript Framework'),
        'jquery': ('jQuery', 'JavaScript Library'),
        'bootstrap': ('Bootstrap', 'CSS Framework'),
        'next': ('Next.js', 'React Framework'),
        'nuxt': ('Nuxt.js', 'Vue Framework'),
        'gatsby': ('Gatsby', 'Static Site Generator'),
        'webpack': ('Webpack', 'Build Tool'),
        'tailwind': ('TailwindCSS', 'CSS Framework')
    }
    
    for script in scripts:
        src = script.get('src', '').lower()
        for pattern, (name, category) in framework_patterns.items():
            if pattern in src:
                # Try to extract version
                version_match = re.search(r'(\d+\.\d+\.\d+)', src)
                version = version_match.group(1) if version_match else None
                
                technologies.append(Technology(
                    name=name,
                    category=category,
                    version=version,
                    confidence='high'
                ))
    
    # WordPress Detection
    if 'wp-content' in html or 'wp-includes' in html:
        technologies.append(Technology(
            name='WordPress',
            category='CMS',
            confidence='high',
            security_note='WordPress detected - ensure plugins and core are updated'
        ))
    
    # Drupal Detection
    if 'Drupal' in html or '/sites/default/' in html:
        technologies.append(Technology(
            name='Drupal',
            category='CMS',
            confidence='medium'
        ))
    
    # Django Detection
    if 'csrfmiddlewaretoken' in html:
        technologies.append(Technology(
            name='Django',
            category='Web Framework',
            confidence='high'
        ))
    
    # Laravel Detection
    if 'laravel_session' in html or 'XSRF-TOKEN' in html:
        technologies.append(Technology(
            name='Laravel',
            category='PHP Framework',
            confidence='medium'
        ))
    
    # Analytics Detection
    analytics_patterns = {
        'google-analytics.com': 'Google Analytics',
        'googletagmanager.com': 'Google Tag Manager',
        'mixpanel.com': 'Mixpanel',
        'hotjar.com': 'Hotjar',
        'segment.com': 'Segment'
    }
    
    for pattern, name in analytics_patterns.items():
        if pattern in html:
            technologies.append(Technology(
                name=name,
                category='Analytics',
                confidence='high'
            ))
    
    return technologies


def generate_attack_surface_notes(tech_stack: TechnologyStack) -> List[str]:
    """
    Generate security-focused attack surface notes
    """
    notes = []
    
    # Web server analysis
    if tech_stack.web_server:
        server_lower = tech_stack.web_server.lower()
        
        if 'apache' in server_lower:
            notes.append("📌 Apache server - Check for misconfigured .htaccess and directory listings")
        elif 'nginx' in server_lower:
            notes.append("📌 Nginx server - Review configuration for path traversal vulnerabilities")
        elif 'iis' in server_lower:
            notes.append("📌 IIS server - Check for outdated versions and default configurations")
    
    # Framework-specific notes
    framework_notes = {
        'wordpress': "⚠ WordPress detected - Common target for brute force, plugin vulnerabilities",
        'drupal': "⚠ Drupal detected - Check for known CVEs in core and modules",
        'django': "✓ Django framework - Generally secure, ensure DEBUG=False in production",
        'react': "✓ React - Client-side framework, check for sensitive data exposure in JS",
        'vue': "✓ Vue.js - Client-side framework, review API endpoints exposed"
    }
    
    for tech in tech_stack.technologies:
        tech_lower = tech.name.lower()
        for key, note in framework_notes.items():
            if key in tech_lower:
                notes.append(note)
    
    # Security headers analysis
    missing_headers = []
    for header, present in tech_stack.security_headers.items():
        if not present:
            missing_headers.append(header)
    
    if missing_headers:
        notes.append(f"⚠ Missing security headers: {', '.join(missing_headers)}")
        notes.append("→ Absence of security headers increases XSS, clickjacking, and MITM risks")
    else:
        notes.append("✓ Good security header implementation")
    
    # CDN analysis
    if tech_stack.cdn:
        notes.append(f"✓ Using CDN ({tech_stack.cdn}) - DDoS protection and caching in place")
    else:
        notes.append("⚠ No CDN detected - Direct server exposure to traffic")
    
    # Exposed technology versions
    versioned_techs = [t for t in tech_stack.technologies if t.version]
    if versioned_techs:
        notes.append(f"⚠ {len(versioned_techs)} technologies with exposed versions - verify if outdated")
    
    return notes


async def fingerprint_technology_stack(domain: str) -> TechnologyStack:
    """
    Main function to fingerprint technology stack
    """
    
    # Ensure domain has protocol
    if not domain.startswith('http'):
        https_url = f'https://{domain}'
        http_url = f'http://{domain}'
    else:
        https_url = domain
        http_url = domain.replace('https://', 'http://')
    
    # Try HTTPS first, fallback to HTTP
    html_content, headers = await fetch_url_content(https_url)
    
    if not html_content:
        html_content, headers = await fetch_url_content(http_url)
    
    # Analyze headers
    header_analysis = analyze_http_headers(headers or {})
    
    # Analyze HTML
    html_technologies = analyze_html_content(html_content or '')
    
    # Combine technologies
    all_technologies = header_analysis['technologies'] + html_technologies
    
    # Remove duplicates
    seen_names = set()
    unique_technologies = []
    for tech in all_technologies:
        if tech.name not in seen_names:
            seen_names.add(tech.name)
            unique_technologies.append(tech)
    
    # Build tech stack
    tech_stack = TechnologyStack(
        domain=domain,
        web_server=header_analysis['server'],
        frameworks=[t for t in unique_technologies if 'Framework' in t.category],
        cdn=header_analysis['cdn'],
        analytics=[t.name for t in unique_technologies if t.category == 'Analytics'],
        security_headers=header_analysis['security_headers'],
        technologies=unique_technologies
    )
    
    # Generate attack surface notes
    tech_stack.attack_surface_notes = generate_attack_surface_notes(tech_stack)
    
    return tech_stack
