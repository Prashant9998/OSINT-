"""
Data Models for OSINT Platform
Pydantic models for request validation, responses, and internal data structures
"""

from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# Enums
class ScanType(str, Enum):
    DOMAIN = "domain"
    EMAIL = "email"
    USERNAME = "username"
    PHONE = "phone"
    FULL = "full"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ModuleStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


# Request Models
class ScanRequest(BaseModel):
    """Request model for initiating a scan"""
    target: str = Field(..., description="Target domain, email, or username")
    scan_type: ScanType = Field(default=ScanType.DOMAIN, description="Type of scan to perform")
    modules: Optional[List[str]] = Field(default=None, description="Specific modules to run")
    deep_scan: bool = Field(default=False, description="Enable deep scanning (slower, more thorough)")
    
    @validator('target')
    def validate_target(cls, v):
        """Basic input validation"""
        if not v or len(v.strip()) == 0:
            raise ValueError("Target cannot be empty")
        if len(v) > 255:
            raise ValueError("Target too long")
        # Remove dangerous characters
        dangerous_chars = ['<', '>', '"', "'", ';', '&', '|', '`']
        if any(char in v for char in dangerous_chars):
            raise ValueError("Invalid characters in target")
        return v.strip().lower()


class APIKeyRequest(BaseModel):
    """Request model for API key validation"""
    api_key: str


# Domain OSINT Models
class WHOISData(BaseModel):
    """WHOIS information"""
    domain: str
    registrar: Optional[str] = None
    creation_date: Optional[str] = None
    expiration_date: Optional[str] = None
    updated_date: Optional[str] = None
    registrant_org: Optional[str] = None
    registrant_country: Optional[str] = None
    name_servers: List[str] = []
    status: List[str] = []
    domain_age_days: Optional[int] = None


class DNSRecord(BaseModel):
    """DNS record information"""
    record_type: str
    value: str
    ttl: Optional[int] = None


class DNSData(BaseModel):
    """Complete DNS information"""
    domain: str
    a_records: List[str] = []
    aaaa_records: List[str] = []
    mx_records: List[DNSRecord] = []
    txt_records: List[str] = []
    ns_records: List[str] = []
    cname_records: List[str] = []


class Subdomain(BaseModel):
    """Subdomain discovery result"""
    subdomain: str
    source: str = "crt.sh"
    first_seen: Optional[str] = None


class DomainIntelligence(BaseModel):
    """Complete domain intelligence"""
    domain: str
    whois_data: Optional[WHOISData] = None
    dns_data: Optional[DNSData] = None
    subdomains: List[Subdomain] = []
    subdomain_count: int = 0
    ip_addresses: List[str] = []
    insights: List[str] = []


# Technology Stack Models
class Technology(BaseModel):
    """Detected technology"""
    name: str
    category: str
    version: Optional[str] = None
    confidence: str = "high"  # high, medium, low
    security_note: Optional[str] = None


class TechnologyStack(BaseModel):
    """Complete technology stack fingerprint"""
    domain: str
    web_server: Optional[str] = None
    frameworks: List[Technology] = []
    cdn: Optional[str] = None
    analytics: List[str] = []
    security_headers: Dict[str, bool] = {}
    technologies: List[Technology] = []
    attack_surface_notes: List[str] = []


# GitHub OSINT Models
class GitHubRepository(BaseModel):
    """GitHub repository information"""
    name: str
    full_name: str
    url: str
    description: Optional[str] = None
    stars: int = 0
    last_updated: Optional[str] = None
    language: Optional[str] = None


class GitHubFinding(BaseModel):
    """Specific finding from GitHub"""
    repository: str
    file_path: str
    snippet: str
    finding_type: str  # "config", "api_key", "endpoint", "leak"
    risk_level: RiskLevel
    url: str


class GitHubIntelligence(BaseModel):
    """GitHub OSINT results"""
    target: str
    repositories: List[GitHubRepository] = []
    findings: List[GitHubFinding] = []
    total_repos_found: int = 0
    high_risk_findings: int = 0


# Email OSINT Models
class EmailIntelligence(BaseModel):
    """Email OSINT results"""
    email: str
    valid_format: bool
    mx_records: List[str] = []
    mx_valid: bool = False
    disposable: bool = False
    email_pattern: Optional[str] = None
    breach_found: bool = False
    breach_count: int = 0
    risk_assessment: str = "unknown"


# Username OSINT Models
class UsernamePlatform(BaseModel):
    """Platform where username was found"""
    platform: str
    url: str
    profile_found: bool
    last_activity: Optional[str] = None


class UsernameIntelligence(BaseModel):
    """Username OSINT results"""
    username: str
    platforms_found: List[UsernamePlatform] = []
    total_platforms: int = 0
    github_profile: Optional[str] = None
    insights: List[str] = []


# Phone OSINT Models
class PhoneIntelligence(BaseModel):
    """Phone number OSINT results"""
    phone: str
    valid: bool = False
    format_valid: bool = False
    international_number: Optional[str] = None
    local_number: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    country_prefix: Optional[str] = None
    location: Optional[str] = None
    carrier: Optional[str] = None
    line_type: Optional[str] = None
    observations: List[str] = []


# Advanced OSINT Models

class ShodanData(BaseModel):
    """Shodan Host Information"""
    ip: str
    ports: List[int] = []
    hostnames: List[str] = []
    tags: List[str] = []
    vulnerabilities: List[str] = []
    os: Optional[str] = None
    isp: Optional[str] = None
    city: Optional[str] = None
    country_name: Optional[str] = None
    last_update: Optional[str] = None


class VirusTotalData(BaseModel):
    """VirusTotal Analysis"""
    target: str
    reputation: int = 0
    malicious_count: int = 0
    suspicious_count: int = 0
    harmless_count: int = 0
    total_engines: int = 0
    permalink: Optional[str] = None
    categories: List[str] = []
    last_analysis_date: Optional[int] = None


class HunterData(BaseModel):
    """Hunter.io Domain Search"""
    domain: str
    organization: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    emails: List[Dict[str, Any]] = []  # List of email objects
    pattern: Optional[str] = None
    score: int = 0


class SecurityTrailsData(BaseModel):
    """SecurityTrails DNS History"""
    domain: str
    subdomains: List[str] = []
    subdomain_count: int = 0
    history_records: int = 0


class URLScanData(BaseModel):
    """URLScan.io Analysis"""
    url: str
    result_url: Optional[str] = None
    screenshot_url: Optional[str] = None
    malicious: bool = False
    score: int = 0


class GreyNoiseData(BaseModel):
    """GreyNoise IP Context"""
    ip: str
    noise: bool = False
    riot: bool = False
    classification: Optional[str] = None
    name: Optional[str] = None
    link: Optional[str] = None
    last_seen: Optional[str] = None


class AbstractData(BaseModel):
    """Abstract API Enrichment"""
    target: str
    geolocation: Optional[Dict[str, Any]] = None
    phone_validation: Optional[Dict[str, Any]] = None
    email_validation: Optional[Dict[str, Any]] = None
    company_enrichment: Optional[Dict[str, Any]] = None


class SafeBrowsingData(BaseModel):
    """Google Safe Browsing"""
    url: str
    matches: List[Dict[str, Any]] = []
    is_safe: bool = True


class GoogleDork(BaseModel):
    """Specific Google search result (dork)"""
    title: str
    link: str
    snippet: Optional[str] = None
    display_link: Optional[str] = None


class GoogleDorkingData(BaseModel):
    """Google Dorking OSINT Results"""
    target: str
    results: List[GoogleDork] = []
    total_results: int = 0
    dorks_applied: List[str] = []


# Correlation and Risk Models
class AttackSurfaceItem(BaseModel):
    """Single attack surface component"""
    item_type: str  # "subdomain", "technology", "exposed_file", etc.
    name: str
    risk_level: RiskLevel
    description: str
    source_modules: List[str] = []


class CorrelatedIntelligence(BaseModel):
    """Correlated findings across modules"""
    target: str
    attack_surface: List[AttackSurfaceItem] = []
    risk_score: int = 0  # 0-100
    risk_level: RiskLevel = RiskLevel.LOW
    key_findings: List[str] = []
    recommendations: List[str] = []


# Scan Results Models
class ModuleResult(BaseModel):
    """Individual module result"""
    module_name: str
    status: ModuleStatus
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    execution_time: float = 0.0


class ScanResult(BaseModel):
    """Complete scan result"""
    scan_id: str
    target: str
    scan_type: ScanType
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    # Module Results
    domain_intel: Optional[DomainIntelligence] = None
    tech_stack: Optional[TechnologyStack] = None
    github_intel: Optional[GitHubIntelligence] = None
    email_intel: Optional[EmailIntelligence] = None
    username_intel: Optional[UsernameIntelligence] = None
    phone_intel: Optional[PhoneIntelligence] = None
    
    # Advanced OSINT Results
    shodan_data: Optional[ShodanData] = None
    virustotal_data: Optional[VirusTotalData] = None
    hunter_data: Optional[HunterData] = None
    securitytrails_data: Optional[SecurityTrailsData] = None
    urlscan_data: Optional[URLScanData] = None
    greynoise_data: Optional[GreyNoiseData] = None
    abstract_data: Optional[AbstractData] = None
    safebrowsing_data: Optional[SafeBrowsingData] = None
    google_dorking_data: Optional[GoogleDorkingData] = None
    
    # Correlation
    correlated_intel: Optional[CorrelatedIntelligence] = None
    
    # Metadata
    modules_executed: List[str] = []
    total_execution_time: float = 0.0
    report_available: bool = False


# Response Models
class ScanStatusResponse(BaseModel):
    """Response for scan status check"""
    scan_id: str
    status: str
    progress: int  # 0-100
    current_module: Optional[str] = None
    message: str


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str = "healthy"
    version: str
    timestamp: datetime
    modules_available: List[str] = []


class ErrorResponse(BaseModel):
    """Error response"""
    error: str
    detail: Optional[str] = None
    timestamp: datetime
