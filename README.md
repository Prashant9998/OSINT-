# OSINT Reconnaissance Platform

🔍 **Professional OSINT Information Gathering Platform for Ethical Hacking**

A production-grade reconnaissance platform that automates passive OSINT (Open Source Intelligence) gathering using free, publicly available data sources. Built for ethical hackers, penetration testers, and security researchers.

---

## 🎯 Features

### Core OSINT Modules

1. **Domain Intelligence**
   - WHOIS data extraction
   - DNS record enumeration (A, AAAA, MX, TXT, NS, CNAME)
   - Subdomain discovery via Certificate Transparency (crt.sh)
   - Domain age and ownership analysis
   - SSL/TLS certificate inspection

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

5. **Username OSINT**
   - Cross-platform profile enumeration
   - GitHub, GitLab, Reddit, Twitter, Stack Overflow, etc.
   - Developer footprint analysis

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

## 📦 Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env
# Edit .env and set your API keys (optional)

# Run the server
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

---

## 🚀 Usage

### Quick Start

1. Start the backend API server
2. Start the frontend development server
3. Open `http://localhost:3000` in your browser
4. Enter a target (domain, email, or username)
5. Select scan type
6. Click "INITIATE SCAN"
7. View results with risk assessment and recommendations

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

# Check scan status
curl -X GET "http://localhost:8000/api/v1/scan/{scan_id}" \
  -H "X-API-Key: osint-recon-key-2026"
```

### API Documentation

Interactive API docs available at:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

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

All data is collected from:
- Public DNS records
- Certificate Transparency logs
- Public GitHub repositories
- WHOIS databases
- HTTP headers and HTML sources
- Public breach databases (metadata only)

**No private data, passwords, or unauthorized access is involved.**

### Your Responsibility

- Always obtain written permission before scanning
- Respect rate limits and robots.txt
- Follow responsible disclosure practices
- Comply with all applicable laws (CFAA, GDPR, etc.)

---

## 🔧 Configuration

### Backend Environment Variables

```env
# API Security
API_KEY=your-secret-api-key
SECRET_KEY=your-jwt-secret

# GitHub (Optional - for higher rate limits)
GITHUB_TOKEN=ghp_your_github_personal_access_token

# HaveIBeenPwned (Optional - for breach checking)
HIBP_API_KEY=your_hibp_api_key

# Rate Limiting
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_PERIOD=60
MAX_SCANS_PER_TARGET_PER_DAY=5

# OSINT Settings
MAX_SUBDOMAINS=100
MAX_GITHUB_RESULTS=50
OSINT_TIMEOUT=30
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🎨 UI Features

- **Cybersecurity Theme**: Dark mode with neon accents
- **Glitch Effects**: Animated headers and transitions
- **Real-time Progress**: Live scan status updates
- **Risk Visualization**: Color-coded risk levels
- **Export Functionality**: Download results as JSON
- **Responsive Design**: Works on desktop and mobile

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v --cov=.
```

### Frontend Tests
```bash
cd frontend
npm test
npm run lint
```

---

## 📊 Project Structure

```
OSINT/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration management
│   ├── models.py               # Pydantic models
│   ├── database.py             # Database setup
│   ├── security.py             # Security utilities
│   ├── osint_modules/          # OSINT modules
│   │   ├── domain_intel.py
│   │   ├── tech_fingerprint.py
│   │   ├── github_intel.py
│   │   ├── email_intel.py
│   │   └── username_intel.py
│   ├── intelligence/           # Correlation engine
│   │   └── correlator.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   └── components/
│   │       ├── ScanForm.tsx
│   │       ├── ScanProgress.tsx
│   │       └── ResultsDisplay.tsx
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## 🎓 Educational Value

This project demonstrates:
- **OSINT Methodology**: Real-world reconnaissance techniques
- **Async Programming**: FastAPI with concurrent API calls
- **Full-Stack Development**: API design + modern frontend
- **Security Best Practices**: Rate limiting, input validation, ethical safeguards
- **Data Correlation**: Intelligence synthesis across multiple sources

Perfect for:
- Cybersecurity students
- Ethical hacking portfolios
- Security researcher tool development
- Hackathon projects
- Penetration testing demonstrations

---

## 🤝 Contributing

Contributions welcome! Please ensure:
- All new features include tests
- Code follows existing style (Black for Python, Prettier for JS/TS)
- Ethical guidelines are maintained
- Documentation is updated

---

## 📝 License

This project is for **educational purposes only**. Use responsibly and legally.

---

## 🔗 Resources

- [OSINT Framework](https://osintframework.com/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Certificate Transparency](https://certificate.transparency.dev/)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)

---

## ⚡ Performance Tips

1. **Enable Deep Scan** only when needed (slower, more thorough)
2. **GitHub Token**: Add `GITHUB_TOKEN` to avoid rate limits
3. **Caching**: Results are cached for 1 hour
4. **Parallel Scans**: API supports concurrent requests (within rate limits)

---

## 🐛 Troubleshooting

### Backend Won't Start
- Check Python version (3.10+)
- Ensure all dependencies installed: `pip install -r requirements.txt`
- Verify `.env` file exists

### Frontend Connection Error
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify API key matches between frontend and backend

### Rate Limit Errors
- Wait 60 seconds between requests
- Max 10 requests per minute per IP
- Max 5 scans per target per day

---

## 🌟 Future Enhancements

- [ ] PDF report generation
- [ ] Historical scan tracking
- [ ] Email notifications
- [ ] Shodan integration
- [ ] Passive DNS lookups
- [ ] Social media OSINT
- [ ] Dark web monitoring
- [ ] Multi-user support

---

**Built with ❤️ for Ethical Hackers**

Remember: With great power comes great responsibility. Always hack ethically!
