# Quick Start Guide

## 🚀 Deploy to Production

### Backend (Render.com)
1. Fork/clone this repository
2. Sign up at [Render.com](https://render.com)
3. Click "New" → "Blueprint"
4. Connect your repo
5. Set environment variables:
   - `API_KEY`: Your secure API key
   - `ALLOWED_ORIGINS`: Your frontend URL

### Frontend (Vercel)
1. Sign up at [Vercel.com](https://vercel.com)
2. Import this repository
3. Set root directory to `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL
   - `NEXT_PUBLIC_API_KEY`: Same as backend API_KEY

📖 **Full guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 💻 Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux

# Run server
uvicorn main:app --reload
```

Backend will run at: `http://localhost:8000`  
API docs: `http://localhost:8000/api/docs`

### Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
copy .env.local.example .env.local  # Windows
# cp .env.local.example .env.local  # macOS/Linux

# Edit .env.local and set:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Run development server
npm run dev
```

Frontend will run at: `http://localhost:3000`

---

## 🧪 Testing

### Test Backend
```bash
# Health check
curl http://localhost:8000/health

# API documentation
open http://localhost:8000/api/docs
```

### Test Frontend
1. Open browser to `http://localhost:3000`
2. Enter a target domain (e.g., `example.com`)
3. Click "INITIATE SCAN"
4. View results

---

## 📝 Environment Variables

### Backend (.env)
```env
API_KEY=your-secure-key-here
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000
DEBUG_MODE=True
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=your-secure-key-here
```

---

## 🎯 Quick Test Scan

Once running, try these test targets:
- **Domain**: `github.com`
- **Email**: `security@github.com`
- **Username**: `torvalds`

---

## 🆘 Troubleshooting

**Backend won't start?**
- Check Python version: `python --version` (need 3.10+)
- Verify all dependencies installed: `pip list`

**Frontend errors?**
- Check Node version: `node --version` (need 18+)
- Verify API URL in `.env.local` matches backend

**CORS errors?**
- Ensure backend `ALLOWED_ORIGINS` includes frontend URL
- Check browser console for specific error

---

## 📚 Next Steps

- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Check [ETHICS.md](./ETHICS.md) for ethical guidelines
- View API docs at `/api/docs` endpoint
