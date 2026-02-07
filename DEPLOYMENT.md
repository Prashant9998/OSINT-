# 🚀 Deployment Guide - OSINT Platform

## Backend Deployment (Render.com)

### Option 1: Using render.yaml (Recommended)

1. **Connect Repository to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository: `Prashant9998/OSINT-`
   - Render will automatically detect `render.yaml`

2. **Configure Environment Variables**
   
   After deployment, go to your service settings and update:
   ```
   API_KEY=<your-secure-api-key>
   SECRET_KEY=<your-secure-secret-key>
   ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:3000
   ```

3. **Deploy**
   - Click "Apply"
   - Render will build and deploy automatically
   - Note your service URL: `https://osint-platform-api.onrender.com`

### Option 2: Manual Web Service

1. **Create New Web Service**
   - Dashboard → "New" → "Web Service"
   - Connect repository: `Prashant9998/OSINT-`
   - Configure:
     - **Name**: `osint-platform-api`
     - **Environment**: Python 3
     - **Region**: Oregon (or nearest)
     - **Branch**: `main`
     - **Root Directory**: Leave blank
     - **Build Command**: `cd backend && pip install -r requirements.txt`
     - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Environment Variables** (same as above)

3. **Deploy** → Click "Create Web Service"

---

## Frontend Deployment (Vercel)

### Deploy to Vercel

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import `Prashant9998/OSINT-`

2. **Configure Project**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`

3. **Environment Variables**
   
   Add in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://osint-platform-api.onrender.com
   NEXT_PUBLIC_API_KEY=osint-recon-key-2026
   ```

4. **Deploy** → Click "Deploy"

---

## Post-Deployment Setup

### Update Backend CORS

After frontend is deployed, update backend environment variable on Render:

```
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

Or keep it as `*` for testing (not recommended for production).

### API Key Synchronization

Ensure the API key matches on both backend and frontend:
- **Backend**: `API_KEY` environment variable
- **Frontend**: `NEXT_PUBLIC_API_KEY` environment variable

---

## Testing Your Deployment

### 1. Test Backend Health

```bash
curl https://osint-platform-api.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "..."
}
```

### 2. Test API Documentation

Visit: `https://osint-platform-api.onrender.com/api/docs`

### 3. Test Frontend

1. Visit your Vercel URL
2. Fill in scan form with a test domain (e.g., `example.com`)
3. Click "INITIATE SCAN"
4. Verify scan starts without errors

---

## Troubleshooting

### "Failed to initiate scan" Error

**Cause**: CORS or API connection issues

**Fix**:
1. Check backend CORS settings include your frontend URL
2. Verify API key matches on both ends
3. Check browser console for CORS errors

### Backend Not Responding

**Cause**: Render service sleeping (free tier)

**Fix**:
- Wait 30-60 seconds for service to wake up
- Or upgrade to paid tier for always-on service

### Build Failures

**Python Version Issues**:
```bash
# Ensure Render uses Python 3.11
# Add to render.yaml:
PYTHON_VERSION=3.11.0
```

**Missing Dependencies**:
```bash
# Check all dependencies in requirements.txt are installable
cd backend
pip install -r requirements.txt
```

---

## Production Checklist

- [ ] Change default API key to secure random value
- [ ] Set SECRET_KEY to random string (32+ characters)
- [ ] Configure ALLOWED_ORIGINS with specific frontend URL
- [ ] Set DEBUG_MODE=false
- [ ] Test all scan types (domain, email, username)
- [ ] Monitor Render logs for errors
- [ ] Set up custom domain (optional)

---

## Free Tier Limitations

**Render Free Tier**:
- Service sleeps after 15 minutes of inactivity
- 750 hours/month free
- Cold start: ~30 seconds

**Vercel Free Tier**:
- 100GB bandwidth/month
- Unlimited deployments
- Serverless functions: 100 execution hours/month

---

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:3000`

---

## Support

For issues, check:
- Render logs: Dashboard → Service → Logs
- Vercel logs: Dashboard → Deployments → Function logs
- Browser console: F12 → Console tab
