"""
Username OSINT Module
Track username across platforms for developer intelligence
"""

import aiohttp
import asyncio
from typing import List
from models import UsernamePlatform, UsernameIntelligence


# Platform configurations
PLATFORMS = {
    # Developer Platforms
    'GitHub': 'https://github.com/{}',
    'GitLab': 'https://gitlab.com/{}',
    'Stack Overflow': 'https://stackoverflow.com/users/{}',
    'Dev.to': 'https://dev.to/{}',
    'CodePen': 'https://codepen.io/{}',
    'Replit': 'https://replit.com/@{}',
    'npm': 'https://npmjs.com/~{}',
    'PyPI': 'https://pypi.org/user/{}/',
    
    # Social Media Platforms
    'Instagram': 'https://instagram.com/{}',
    'Facebook': 'https://facebook.com/{}',
    'Reddit': 'https://reddit.com/user/{}',
    'Twitter': 'https://twitter.com/{}',
    'Medium': 'https://medium.com/@{}',
    
    # Tech/News Platforms
    'Hacker News': 'https://news.ycombinator.com/user?id={}',
}


async def check_platform(username: str, platform_name: str, url_pattern: str) -> UsernamePlatform:
    """
    Check if username exists on a specific platform
    """
    url = url_pattern.format(username)
    profile_found = False
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                url,
                timeout=aiohttp.ClientTimeout(total=8),
                allow_redirects=True,
                headers={'User-Agent': 'Mozilla/5.0 (OSINT Scanner)'}
            ) as response:
                # Profile exists if we get 200
                if response.status == 200:
                    profile_found = True
                # Some platforms return 404 for non-existent users
                elif response.status == 404:
                    profile_found = False
    
    except Exception as e:
        print(f"Error checking {platform_name} for {username}: {e}")
    
    return UsernamePlatform(
        platform=platform_name,
        url=url,
        profile_found=profile_found,
        last_activity=None  # Could be extended to scrape last activity
    )


async def get_github_profile_info(username: str) -> dict:
    """
    Get detailed GitHub profile information
    """
    github_info = {
        'url': None,
        'repos': 0,
        'followers': 0,
        'bio': None
    }
    
    try:
        url = f"https://api.github.com/users/{username}"
        headers = {'User-Agent': 'OSINT-Platform'}
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=5)) as response:
                if response.status == 200:
                    data = await response.json()
                    github_info = {
                        'url': data.get('html_url'),
                        'repos': data.get('public_repos', 0),
                        'followers': data.get('followers', 0),
                        'bio': data.get('bio')
                    }
    
    except Exception as e:
        print(f"Error fetching GitHub profile for {username}: {e}")
    
    return github_info


def generate_username_insights(platforms_found: List[UsernamePlatform], github_info: dict) -> List[str]:
    """
    Generate insights from username OSINT
    """
    insights = []
    
    found_count = sum(1 for p in platforms_found if p.profile_found)
    
    if found_count == 0:
        insights.append("⚠ Username not found on any tracked platforms")
    elif found_count == 1:
        insights.append(f"✓ Username found on {found_count} platform - limited digital footprint")
    elif found_count <= 3:
        insights.append(f"✓ Username found on {found_count} platforms - moderate digital footprint")
    else:
        insights.append(f"✓ Username found on {found_count} platforms - significant digital footprint")
    
    # GitHub-specific insights
    if github_info.get('url'):
        insights.append(f"✓ Active GitHub profile ({github_info['repos']} repos, {github_info['followers']} followers)")
        
        if github_info['repos'] > 50:
            insights.append("📌 Highly active developer - review public repos for data leaks")
        elif github_info['repos'] > 10:
            insights.append("📌 Active developer - check repos for exposed configs")
    
    # Platform-specific insights
    dev_platforms = ['GitHub', 'GitLab', 'Stack Overflow', 'Dev.to', 'CodePen', 'Replit', 'npm', 'PyPI']
    social_platforms = ['Instagram', 'Facebook', 'Reddit', 'Twitter', 'Medium']
    
    dev_count = sum(1 for p in platforms_found if p.profile_found and p.platform in dev_platforms)
    social_count = sum(1 for p in platforms_found if p.profile_found and p.platform in social_platforms)
    
    if dev_count >= 3:
        insights.append("📌 Developer present on multiple coding platforms - check for accidental leaks")
    
    if social_count >= 3:
        insights.append("📌 Active social media presence - public profiles may reveal personal information")
    
    if social_count >= 1 and dev_count >= 1:
        insights.append("📌 Mixed digital footprint: both professional and social platforms found")
    
    return insights


async def gather_username_intelligence(username: str) -> UsernameIntelligence:
    """
    Main function to gather username OSINT across platforms
    """
    
    username = username.strip().lower()
    
    # Check all platforms in parallel
    platform_tasks = [
        check_platform(username, platform_name, url_pattern)
        for platform_name, url_pattern in PLATFORMS.items()
    ]
    
    platforms_found = await asyncio.gather(*platform_tasks, return_exceptions=True)
    
    # Filter out exceptions
    platforms_found = [p for p in platforms_found if not isinstance(p, Exception)]
    
    # Get detailed GitHub info if profile exists
    github_info = {}
    github_platform = next((p for p in platforms_found if p.platform == 'GitHub' and p.profile_found), None)
    
    if github_platform:
        github_info = await get_github_profile_info(username)
    
    # Generate insights
    insights = generate_username_insights(platforms_found, github_info)
    
    return UsernameIntelligence(
        username=username,
        platforms_found=platforms_found,
        total_platforms=sum(1 for p in platforms_found if p.profile_found),
        github_profile=github_info.get('url'),
        insights=insights
    )
