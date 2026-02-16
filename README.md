# 🔍 OSINT Reconnaissance Platform

> **Production-grade OSINT Information Gathering Platform for Ethical Hacking**

A comprehensive, ethical OSINT (Open Source Intelligence) reconnaissance platform built with FastAPI and Next.js. Perform passive intelligence gathering on domains, emails, and usernames using free public APIs and automated correlation analysis.

## 🚀 Quick Links

- ⚡ **[Quick Start](#local-development)** - Running locally in 5 minutes
- 🌐 **Live Demo**: [Coming Soon]
- 📚 **API Documentation**: [Swagger UI](https://osint-platform-api.onrender.com/api/docs) (once deployed)

---

## 🎯 Features

## 🏗️ Architecture

The platform follows a robust 5-layer architecture for comprehensive intelligence gathering:

### 1. Data Collection Layer
- **Domain Intelligence**: WHOIS, DNS, Subdomains (crt.sh)
- **Email Intelligence**: MX records, Breach checks (HIBP)
- **Phone Intelligence**: Number validation, Carrier lookup (Veriphone)
- **Infrastructure**: Shodan (Ports/Vulns), VirusTotal (Reputation)
- **Social**: User tracking across 14+ platforms

### 2. Data Processing Layer
- **Input Validation**: Strict sanitation and safety checks
- **Normalization**: Standardizing data formats (Pydantic models)
- **Error Handling**: Graceful failure recovery per module
- **Rate Limiting**: Preventing API abuse

### 3. Analysis Engine
- **Correlation**: Linking isolated data points (e.g., Domain -> IP -> Vulns)
- **Risk Scoring**: AI-powered assessment (0-100 scale)
- **Attack Surface Mapping**: Identifying critical exposure points
- **Threat Actor Perspective**: Simulating external reconnaissance

### 4. Visualization Dashboard
- **Real-time Updates**: Live scan progress tracking
- **Interactive Graphs**: Visualizing attack surface
- **Responsive UI**: Built with Next.js, TailwindCSS, and Framer Motion
- **Detailed Views**: Drill-down into specific modules

### 5. Report Generator
- **PDF Reports**: Professional executive summaries
- **Actionable Insights**: Generated security recommendations
- **Export Options**: JSON raw data and formatted PDF documents

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
- Uses `render.yaml` Blueprint for auto-deployment
- Recommended for production scaling

**Frontend (Vercel)**:
- Connects seamlessly with GitHub
- Automated CI/CD for Next.js

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
