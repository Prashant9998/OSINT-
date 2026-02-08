# Username OSINT - Enhanced with Social Platforms

## ✨ New Features Added

### Added Social Media Platforms
- ✅ **Instagram** - Profile detection
- ✅ **Facebook** - Profile detection

### Total Platforms Now: 14

**Developer Platforms (8):**
1. GitHub (with detailed stats)
2. GitLab
3. Stack Overflow
4. Dev.to
5. CodePen
6. Replit
7. npm
8. PyPI

**Social Media Platforms (5):**
1. Instagram ⭐ NEW
2. Facebook ⭐ NEW
3. Reddit
4. Twitter
5. Medium

**Tech/News Platforms (1):**
1. Hacker News

---

## 🎯 Enhanced Intelligence Analysis

### New Insights Generated:

1. **Social Media Presence Analysis**
   - Detects active social media users
   - Identifies mixed professional/social footprints

2. **Platform Categorization**
   - Separates developer vs social platforms
   - Provides targeted security recommendations

### Example Output:

```json
{
  "username": "prashant9998",
  "total_platforms": 5,
  "platforms_found": [
    {
      "platform": "Instagram",
      "url": "https://instagram.com/prashant9998",
      "profile_found": true
    },
    {
      "platform": "Facebook",
      "url": "https://facebook.com/prashant9998",
      "profile_found": true
    },
    {
      "platform": "GitHub",
      "url": "https://github.com/prashant9998",
      "profile_found": true
    }
  ],
  "insights": [
    "✓ Username found on 5 platforms - significant digital footprint",
    "✓ Active GitHub profile (X repos, Y followers)",
    "📌 Active social media presence - public profiles may reveal personal information",
    "📌 Mixed digital footprint: both professional and social platforms found"
  ]
}
```

---

## 🧪 How to Test

### Using API:

```bash
# Test username scan
curl -X POST "http://localhost:8000/api/v1/scan" \
  -H "X-API-Key: osint-recon-key-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "target": "your_username",
    "scan_type": "username",
    "deep_scan": false
  }'
```

### Using Frontend:

1. Start backend: `cd backend && py main.py`
2. Start frontend: `cd frontend && npm run dev`
3. Visit: `http://localhost:3000`
4. Select **"Username"** scan type
5. Enter username (e.g., "prashant9998")
6. Click "INITIATE SCAN"

---

## 📊 What You'll See

The platform will check all 14 platforms and show:
- ✅ Platforms where profile exists
- ❌ Platforms where profile not found
- 📈 Total digital footprint score
- 🔍 Security insights and recommendations

---

## ⚠️ Important Notes

### Privacy & Ethics:
- Only checks **public profiles**
- No authentication required
- No private data accessed
- Respects platform rate limits

### Limitations:
- Some platforms (Instagram, Facebook) may block automated checks
- Results depend on username consistency across platforms
- Profile detection is based on HTTP status codes

---

## 🔧 Technical Details

### Detection Method:
```python
# For each platform:
1. Make HTTP GET request to profile URL
2. Check HTTP status code:
   - 200 = Profile found
   - 404 = Profile not found
   - Other = Uncertain
3. Return result
```

### Instagram & Facebook Notes:
- **Instagram**: May require login for some profiles (privacy settings)
- **Facebook**: Often redirects to login, may show false negatives

To improve accuracy for these platforms, you may need to add:
- Cookie-based authentication
- Selenium/Playwright for JavaScript rendering
- API access (requires developer accounts)

---

## 🚀 Future Enhancements

Consider adding:
- LinkedIn profile detection
- TikTok username search
- YouTube channel finder
- Discord user lookup
- Telegram username check
- Profile creation date scraping
- Last activity timestamps
- Profile picture extraction

Let me know if you want any of these features added!
