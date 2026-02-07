# 🎯 Next Steps - Deploy Your OSINT Platform

## ✅ What's Been Fixed

Your GitHub repository has been updated with all necessary deployment fixes:

1. ✅ **render.yaml** - Automated Render deployment
2. ✅ **CORS Configuration** - Fixed for production use
3. ✅ **Deployment Docs** - Step-by-step guides created
4. ✅ **Environment Templates** - Frontend configuration ready

## 🚀 Deploy Now (5 Minutes)

### Step 1: Deploy Backend to Render
1. Go to https://dashboard.render.com/
2. Click **"New"** → **"Blueprint"**
3. Connect your repo: `Prashant9998/OSINT-`
4. Render auto-detects `render.yaml` ✅
5. Click **"Apply"**
6. Wait 3-5 minutes for deployment
7. **Save your backend URL**: `https://osint-platform-api.onrender.com`

### Step 2: Deploy Frontend to Vercel
1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Import `Prashant9998/OSINT-`
4. Set **Root Directory**: `frontend`
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://osint-platform-api.onrender.com
   NEXT_PUBLIC_API_KEY=osint-recon-key-2026
   ```
6. Click **"Deploy"**
7. Wait 2-3 minutes

### Step 3: Update Backend CORS
1. Back to Render → Your service → Environment
2. Update `ALLOWED_ORIGINS`:
   ```
   https://your-app-name.vercel.app,http://localhost:3000
   ```
3. Redeploy (or wait for auto-redeploy)

### Step 4: Test! 🎉
1. Visit your Vercel URL
2. Enter target: `example.com`
3. Click **"INITIATE SCAN"**
4. ✅ Should work without errors!

## 📚 Full Documentation

- **Detailed Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)
- **Main README**: [README.md](./README.md)

## 🆘 Need Help?

**Common Issues:**

1. **"Failed to initiate scan"**
   - Check CORS includes your Vercel URL
   - Verify API key matches on both ends

2. **Render not responding**
   - Free tier sleeps - wait 30-60 seconds for wake up

3. **Build errors**
   - Check Render logs for details
   - Verify Python 3.11 in environment

---

**GitHub Repo**: https://github.com/Prashant9998/OSINT-

**Ready to deploy? Start with Step 1! 🚀**
