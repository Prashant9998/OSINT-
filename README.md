# 🔍 OSINT Reconnaissance Platform

> **Production-grade OSINT Information Gathering Platform for Ethical Hacking**

A comprehensive, ethical OSINT (Open Source Intelligence) reconnaissance platform built with FastAPI and Next.js. Perform passive intelligence gathering on domains, emails, and usernames using free public APIs and automated correlation analysis.

## 🚀 Quick Links

- 📖 **[Deployment Guide](./DEPLOYMENT.md)** - Full production deployment instructions
- ⚡ **[Quick Start](./QUICKSTART.md)** - Running locally in 5 minutes
- 🌐 **Live Demo**: [Coming Soon]
- 📚 **API Documentation**: [Swagger UI](https://osint-platform-api.onrender.com/api/docs) (once deployed)

---

## 🎯 Features

### Core OSINT Modules

1. **Domain Intelligence**
   - WHOIS data extraction
   - DNS record enumeration (A, AAAA, MX, TXT, NS, CNAME)
   - Subdomain discovery via Certificate Transparency (crt.sh)
   - Domain age and ownership analysis
   - SSL/TLS certificate inspection @

2. **Technology Stack Fingerprinting**
   - HTTP header analysis
   - Web framework detection (React, Vue, WordPress, Django, etc.)
   - CDN identification (Cloudflare, Akamai, etc.)
   - Security header assessment
   - Analytics and tracking tool detection

3. **GitHub OSINT**
   - Public repository search
   - Configuration file discovery
   - Exposed secrets detection
   - API endpoint identification
   - Developer intelligence gathering

4. **Email Intelligence**
   - MX record validation
   - Email pattern detection
   - Data breach exposure check (via HaveIBeenPwned API)
   - Disposable email detection

5. **Username OSINT (Enhanced) ⭐**
   - **Cross-platform tracking across 14+ platforms**
   - **Social Media**: Instagram, Facebook, Twitter, Reddit, Medium
   - **Developer**: GitHub, GitLab, Stack Overflow, npm, PyPI
   - **Intelligence**: Digital footprint analysis & developer activity scoring

### Intelligence Correlation

- **Attack Surface Mapping**: Automatic correlation of findings across all modules
- **Risk Scoring**: AI-powered risk assessment (0-100 scale)
- **Actionable Intelligence**: Security recommendations based on discovered vulnerabilities
- **Threat Actor Perspective**: Insights from an attacker's viewpoint

---

## 🛠 Tech Stack

### Backend
- **FastAPI** - Async Python web framework
- **SQLAlchemy** - Database ORM
- **aiohttp** - Async HTTP client
- **python-whois** - WHOIS lookups
- **dnspython** - DNS queries
- **BeautifulSoup4** - HTML parsing

### Frontend
- **Next.js 14** - React framework with SSR
- **TailwindCSS** - Utility-first CSS
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **Recharts** - Data visualization

---

## 📦 Deployment

### Cloud Deployment (Recommended)

**Backend (Render)**:
- Follow [Render Deployment Guide](./render_deployment_guide.md)
- Uses `render.yaml` Blueprint for auto-deployment

**Frontend (Vercel)**:
- Follow [Vercel Deployment Guide](./vercel_deployment_guide.md)
- Connects seamlessly with GitHub

### Local Development

1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🚀 Usage

### API Usage

```bash
# Initiate a scan
curl -X POST "http://localhost:8000/api/v1/scan" \
  -H "X-API-Key: osint-recon-key-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "target": "example.com",
    "scan_type": "domain",
    "deep_scan": false
  }'
```

---

## ⚖️ Legal & Ethical Guidelines

### ⚠️ CRITICAL: Read Before Use

This platform is designed for **ETHICAL and LEGAL use ONLY**. By using this tool, you agree to:

✅ **Acceptable Use:**
- Security research on systems you own
- Authorized penetration testing
- Educational purposes
- Bug bounty programs with proper scope
- Defensive security posture assessment

❌ **Prohibited Use:**
- Scanning targets without explicit permission
- Stalking or harassment
- Unauthorized access attempts
- Violating computer fraud laws
- Privacy violations

### Data Sources
All data is collected from public sources (DNS, WHOIS, CT logs, public repos). **No private data, passwords, or unauthorized access is involved.**

---

## 🔧 Configuration

### Backend Environment Variables
```env
# API Security
API_KEY=your-secret-api-key
SECRET_KEY=your-jwt-secret

# GitHub (Optional - for higher rate limits)
GITHUB_TOKEN=ghp_your_github_personal_access_token

# Rate Limiting
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_PERIOD=60
```

### Frontend Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
# For Production:
# NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com
```

---

## 🌟 Future Enhancements

- [x] Social media OSINT (Instagram, Facebook added)
- [ ] PDF report generation
- [ ] Historical scan tracking
- [ ] Email notifications
- [ ] Shodan integration
- [ ] Passive DNS lookups
- [ ] Dark web monitoring
- [ ] Multi-user support

---

**Built with ❤️ for Ethical Hackers**

Remember: With great power comes great responsibility. Always hack ethically!
