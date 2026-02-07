"""
GitHub OSINT Module
Search public GitHub repositories for exposed information
"""

import aiohttp
import asyncio
from typing import List, Optional
from models import GitHubRepository, GitHubFinding, GitHubIntelligence, RiskLevel
from config import settings
import base64
import re


class GitHubSearcher:
    """
    GitHub code and repository searcher using free API
    """
    
    def __init__(self, token: Optional[str] = None):
        self.base_url = "https://api.github.com"
        self.token = token or settings.GITHUB_TOKEN
        self.headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'OSINT-Platform/1.0'
        }
        
        if self.token:
            self.headers['Authorization'] = f'token {self.token}'
    
    async def search_repositories(self, query: str, max_results: int = 20) -> List[GitHubRepository]:
        """
        Search GitHub repositories
        """
        repositories = []
        
        try:
            url = f"{self.base_url}/search/repositories"
            params = {
                'q': query,
                'per_page': min(max_results, 30),
                'sort': 'updated'
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, params=params, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        for repo in data.get('items', [])[:max_results]:
                            repositories.append(GitHubRepository(
                                name=repo['name'],
                                full_name=repo['full_name'],
                                url=repo['html_url'],
                                description=repo.get('description'),
                                stars=repo.get('stargazers_count', 0),
                                last_updated=repo.get('updated_at'),
                                language=repo.get('language')
                            ))
        
        except Exception as e:
            print(f"GitHub repo search error: {e}")
        
        return repositories
    
    async def search_code(self, query: str, max_results: int = 30) -> List[dict]:
        """
        Search GitHub code
        """
        code_results = []
        
        try:
            url = f"{self.base_url}/search/code"
            params = {
                'q': query,
                'per_page': min(max_results, 30)
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, params=params, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status == 200:
                        data = await response.json()
                        code_results = data.get('items', [])[:max_results]
                    elif response.status == 403:
                        print("GitHub API rate limit reached - consider adding GITHUB_TOKEN")
        
        except Exception as e:
            print(f"GitHub code search error: {e}")
        
        return code_results
    
    async def analyze_code_snippet(self, item: dict) -> Optional[GitHubFinding]:
        """
        Analyze a code search result for sensitive information
        """
        try:
            repo = item['repository']['full_name']
            file_path = item['path']
            url = item['html_url']
            
            # Determine finding type and risk level
            file_lower = file_path.lower()
            
            # High-risk patterns
            if '.env' in file_lower:
                return GitHubFinding(
                    repository=repo,
                    file_path=file_path,
                    snippet="Environment configuration file",
                    finding_type="config",
                    risk_level=RiskLevel.HIGH,
                    url=url
                )
            
            if 'config' in file_lower and any(ext in file_lower for ext in ['.json', '.yaml', '.yml', '.xml']):
                return GitHubFinding(
                    repository=repo,
                    file_path=file_path,
                    snippet="Configuration file",
                    finding_type="config",
                    risk_level=RiskLevel.MEDIUM,
                    url=url
                )
            
            if 'api' in file_lower or 'endpoint' in file_lower:
                return GitHubFinding(
                    repository=repo,
                    file_path=file_path,
                    snippet="API endpoint definition",
                    finding_type="endpoint",
                    risk_level=RiskLevel.MEDIUM,
                    url=url
                )
            
            # Check for sensitive keywords in snippet
            sensitive_patterns = [
                ('api_key', 'api_key', RiskLevel.HIGH),
                ('apikey', 'api_key', RiskLevel.HIGH),
                ('password', 'leak', RiskLevel.CRITICAL),
                ('secret', 'leak', RiskLevel.HIGH),
                ('token', 'leak', RiskLevel.HIGH),
                ('credentials', 'leak', RiskLevel.HIGH),
            ]
            
            # Get text snippet if available
            text_matches = item.get('text_matches', [])
            snippet_text = ""
            if text_matches:
                snippet_text = text_matches[0].get('fragment', '')
            
            for pattern, finding_type, risk in sensitive_patterns:
                if pattern in file_lower or (snippet_text and pattern in snippet_text.lower()):
                    return GitHubFinding(
                        repository=repo,
                        file_path=file_path,
                        snippet=snippet_text[:200] if snippet_text else f"Potential {pattern} exposure",
                        finding_type=finding_type,
                        risk_level=risk,
                        url=url
                    )
        
        except Exception as e:
            print(f"Error analyzing code snippet: {e}")
        
        return None


async def gather_github_intelligence(target: str, deep_scan: bool = False) -> GitHubIntelligence:
    """
    Main function to gather GitHub OSINT
    """
    
    searcher = GitHubSearcher()
    
    # Search queries for the target domain
    search_queries = [
        target,
        f'"{target}"',
        f'{target} filename:.env',
        f'{target} filename:config',
        f'{target} extension:json',
        f'{target} extension:yaml',
        f'@{target}',  # For emails
    ]
    
    if deep_scan:
        search_queries.extend([
            f'{target} api_key',
            f'{target} password',
            f'{target} secret',
            f'{target} token',
        ])
    
    # Search repositories mentioning the target
    repositories = await searcher.search_repositories(target, max_results=20)
    
    # Search code
    all_findings = []
    
    for query in search_queries[:5]:  # Limit to avoid rate limiting
        code_results = await searcher.search_code(query, max_results=10)
        
        for item in code_results:
            finding = await searcher.analyze_code_snippet(item)
            if finding:
                all_findings.append(finding)
        
        # Rate limiting courtesy delay
        await asyncio.sleep(1)
    
    # Remove duplicates
    unique_findings = []
    seen_urls = set()
    
    for finding in all_findings:
        if finding.url not in seen_urls:
            seen_urls.add(finding.url)
            unique_findings.append(finding)
    
    # Count high-risk findings
    high_risk_count = sum(
        1 for f in unique_findings 
        if f.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]
    )
    
    return GitHubIntelligence(
        target=target,
        repositories=repositories,
        findings=unique_findings,
        total_repos_found=len(repositories),
        high_risk_findings=high_risk_count
    )
