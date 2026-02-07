"""
Intelligence Correlation Module
Correlate findings across OSINT modules to build attack surface map
"""

from typing import List, Optional
from models import (
    DomainIntelligence, TechnologyStack, GitHubIntelligence,
    EmailIntelligence, UsernameIntelligence,
    CorrelatedIntelligence, AttackSurfaceItem, RiskLevel
)


def calculate_risk_score(
    domain_intel: Optional[DomainIntelligence],
    tech_stack: Optional[TechnologyStack],
    github_intel: Optional[GitHubIntelligence],
    email_intel: Optional[EmailIntelligence],
    username_intel: Optional[UsernameIntelligence]
) -> tuple[int, RiskLevel]:
    """
    Calculate overall risk score (0-100) and risk level
    """
    
    risk_score = 0
    max_score = 100
    
    # Domain Intel Risk Factors (30 points)
    if domain_intel:
        # New domains are higher risk
        if domain_intel.whois_data and domain_intel.whois_data.domain_age_days:
            if domain_intel.whois_data.domain_age_days < 365:
                risk_score += 15  # New domain
            elif domain_intel.whois_data.domain_age_days < 730:
                risk_score += 8  # Less than 2 years
        
        # Large number of subdomains = larger attack surface
        if domain_intel.subdomain_count > 50:
            risk_score += 15
        elif domain_intel.subdomain_count > 20:
            risk_score += 10
        elif domain_intel.subdomain_count > 10:
            risk_score += 5
    
    # Technology Stack Risk Factors (25 points)
    if tech_stack:
        # Missing security headers
        missing_headers = sum(1 for present in tech_stack.security_headers.values() if not present)
        risk_score += min(missing_headers * 3, 12)
        
        # Exposed technology versions
        versioned_techs = sum(1 for t in tech_stack.technologies if t.version)
        risk_score += min(versioned_techs * 2, 8)
        
        # No CDN = direct exposure
        if not tech_stack.cdn:
            risk_score += 5
    
    # GitHub Intel Risk Factors (30 points)
    if github_intel:
        # High risk findings are critical
        risk_score += min(github_intel.high_risk_findings * 10, 20)
        
        # Any findings at all
        if len(github_intel.findings) > 0:
            risk_score += 5
        
        # Multiple repositories mentioning target
        if github_intel.total_repos_found > 5:
            risk_score += 5
    
    # Email Intel Risk Factors (10 points)
    if email_intel:
        if email_intel.risk_assessment == "high":
            risk_score += 10
        elif email_intel.risk_assessment == "medium":
            risk_score += 5
        
        if email_intel.breach_found:
            risk_score += 5
    
    # Username Intel Risk Factors (5 points)
    if username_intel:
        if username_intel.total_platforms > 5:
            risk_score += 3
        if username_intel.github_profile:
            risk_score += 2
    
    # Normalize to 0-100
    risk_score = min(risk_score, max_score)
    
    # Determine risk level
    if risk_score >= 70:
        risk_level = RiskLevel.CRITICAL
    elif risk_score >= 50:
        risk_level = RiskLevel.HIGH
    elif risk_score >= 30:
        risk_level = RiskLevel.MEDIUM
    else:
        risk_level = RiskLevel.LOW
    
    return risk_score, risk_level


def build_attack_surface(
    domain_intel: Optional[DomainIntelligence],
    tech_stack: Optional[TechnologyStack],
    github_intel: Optional[GitHubIntelligence]
) -> List[AttackSurfaceItem]:
    """
    Build comprehensive attack surface map
    """
    
    attack_surface = []
    
    # Subdomains
    if domain_intel and domain_intel.subdomains:
        for subdomain in domain_intel.subdomains[:20]:  # Top 20
            attack_surface.append(AttackSurfaceItem(
                item_type="subdomain",
                name=subdomain.subdomain,
                risk_level=RiskLevel.MEDIUM,
                description=f"Subdomain discovered via {subdomain.source}",
                source_modules=["domain_intel"]
            ))
    
    # Technology Stack
    if tech_stack:
        # Outdated or risky technologies
        for tech in tech_stack.technologies:
            if tech.security_note:
                risk = RiskLevel.MEDIUM if "exposed" in tech.security_note.lower() else RiskLevel.LOW
                attack_surface.append(AttackSurfaceItem(
                    item_type="technology",
                    name=tech.name,
                    risk_level=risk,
                    description=tech.security_note or f"{tech.category} detected",
                    source_modules=["tech_fingerprint"]
                ))
        
        # Missing security headers
        for header, present in tech_stack.security_headers.items():
            if not present:
                attack_surface.append(AttackSurfaceItem(
                    item_type="security_header",
                    name=f"Missing {header}",
                    risk_level=RiskLevel.MEDIUM,
                    description=f"Security header '{header}' not implemented",
                    source_modules=["tech_fingerprint"]
                ))
    
    # GitHub Findings
    if github_intel:
        for finding in github_intel.findings[:15]:  # Top 15
            attack_surface.append(AttackSurfaceItem(
                item_type="exposed_file",
                name=finding.file_path,
                risk_level=finding.risk_level,
                description=f"{finding.finding_type.upper()} found in {finding.repository}",
                source_modules=["github_intel"]
            ))
    
    # Sort by risk level
    risk_order = {
        RiskLevel.CRITICAL: 0,
        RiskLevel.HIGH: 1,
        RiskLevel.MEDIUM: 2,
        RiskLevel.LOW: 3
    }
    attack_surface.sort(key=lambda x: risk_order.get(x.risk_level, 3))
    
    return attack_surface


def generate_key_findings(
    domain_intel: Optional[DomainIntelligence],
    tech_stack: Optional[TechnologyStack],
    github_intel: Optional[GitHubIntelligence],
    email_intel: Optional[EmailIntelligence],
    username_intel: Optional[UsernameIntelligence]
) -> List[str]:
    """
    Generate key findings summary
    """
    
    findings = []
    
    # Domain findings
    if domain_intel:
        if domain_intel.subdomain_count > 0:
            findings.append(f"🔍 Discovered {domain_intel.subdomain_count} subdomains via Certificate Transparency")
        
        if domain_intel.whois_data:
            if domain_intel.whois_data.domain_age_days:
                age_years = domain_intel.whois_data.domain_age_days / 365
                findings.append(f"📅 Domain age: {age_years:.1f} years")
    
    # Tech stack findings
    if tech_stack:
        tech_count = len(tech_stack.technologies)
        findings.append(f"⚙️ Identified {tech_count} technologies")
        
        missing_headers = sum(1 for present in tech_stack.security_headers.values() if not present)
        if missing_headers > 0:
            findings.append(f"⚠️ {missing_headers} security headers missing")
    
    # GitHub findings
    if github_intel:
        if github_intel.high_risk_findings > 0:
            findings.append(f"🚨 {github_intel.high_risk_findings} high-risk findings in public GitHub repositories")
        
        if github_intel.total_repos_found > 0:
            findings.append(f"📦 {github_intel.total_repos_found} public repositories reference this target")
    
    # Email findings
    if email_intel and email_intel.valid_format:
        if email_intel.breach_found:
            findings.append(f"⚠️ Email found in {email_intel.breach_count} data breaches")
        else:
            findings.append(f"✅ Email not found in known breaches")
    
    # Username findings
    if username_intel:
        if username_intel.total_platforms > 0:
            findings.append(f"👤 Username found on {username_intel.total_platforms} platforms")
    
    return findings


def generate_recommendations(
    attack_surface: List[AttackSurfaceItem],
    risk_level: RiskLevel
) -> List[str]:
    """
    Generate security recommendations
    """
    
    recommendations = []
    
    # General recommendations based on risk level
    if risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]:
        recommendations.append("🎯 PRIORITY: Immediate security review required")
        recommendations.append("→ Review all high-risk findings and remediate critical exposures")
    
    # Specific recommendations based on attack surface
    has_github_exposure = any(item.item_type == "exposed_file" for item in attack_surface)
    has_missing_headers = any(item.item_type == "security_header" for item in attack_surface)
    has_many_subdomains = any(item.item_type == "subdomain" for item in attack_surface)
    
    if has_github_exposure:
        recommendations.append("📋 Review public GitHub repositories for sensitive data exposure")
        recommendations.append("→ Remove or rotate any exposed credentials immediately")
        recommendations.append("→ Implement pre-commit hooks to prevent future leaks")
    
    if has_missing_headers:
        recommendations.append("🔒 Implement missing security headers:")
        recommendations.append("   - Content-Security-Policy (CSP)")
        recommendations.append("   - X-Frame-Options (clickjacking protection)")
        recommendations.append("   - Strict-Transport-Security (HSTS)")
    
    if has_many_subdomains:
        recommendations.append("🌐 Large subdomain attack surface detected:")
        recommendations.append("→ Audit all subdomains for necessity")
        recommendations.append("→ Decommission unused subdomains")
        recommendations.append("→ Ensure all subdomains have same security posture as main domain")
    
    # General best practices
    recommendations.append("📊 Regular OSINT audits recommended (quarterly)")
    recommendations.append("🔍 Implement continuous monitoring for new exposures")
    
    return recommendations


def correlate_intelligence(
    target: str,
    domain_intel: Optional[DomainIntelligence] = None,
    tech_stack: Optional[TechnologyStack] = None,
    github_intel: Optional[GitHubIntelligence] = None,
    email_intel: Optional[EmailIntelligence] = None,
    username_intel: Optional[UsernameIntelligence] = None
) -> CorrelatedIntelligence:
    """
    Main function to correlate all intelligence
    """
    
    # Calculate risk
    risk_score, risk_level = calculate_risk_score(
        domain_intel, tech_stack, github_intel, email_intel, username_intel
    )
    
    # Build attack surface
    attack_surface = build_attack_surface(domain_intel, tech_stack, github_intel)
    
    # Generate findings
    key_findings = generate_key_findings(
        domain_intel, tech_stack, github_intel, email_intel, username_intel
    )
    
    # Generate recommendations
    recommendations = generate_recommendations(attack_surface, risk_level)
    
    return CorrelatedIntelligence(
        target=target,
        attack_surface=attack_surface,
        risk_score=risk_score,
        risk_level=risk_level,
        key_findings=key_findings,
        recommendations=recommendations
    )
