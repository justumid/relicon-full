# Railway Deployment Guide

Deploy your full-stack application to Railway - both frontend and backend together!

## Why Railway?

- ✅ **$5 free credits/month** (enough for light usage)
- ✅ **One platform** for both services
- ✅ **Pay-as-you-go** pricing (cheaper than Render)
- ✅ **Fast deployments** with automatic builds
- ✅ **Easy environment management**

## Cost Estimate

- **Free tier**: $5/month in credits
- **After free credits**: ~$5-10/month for both services (usage-based)
- Much cheaper than Render's $14/month minimum

## Step-by-Step Deployment

### 1. Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Login"** → Sign in with GitHub
3. Authorize Railway to access your repositories

### 2. Create a New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `relicon-full`
4. Railway will detect it's a monorepo

### 3. Deploy Backend Service (Python FastAPI)

1. Railway will create a service automatically
2. Click on the service → **Settings**
3. Set **Root Directory**: `engine`
4. Set **Start Command**: `python server.py`
5. Click **Variables** tab

**Add these environment variables:**

```
OPENAI_API_KEY=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
LUMA_API_KEY=luma-8267dbe3-8abe-4941-bd92-918156c3860f-00bfe487-abdb-4864-8ad4-622ac065f595
ELEVENLABS_API_KEY=sk_708522f02da45a93b187a691765e5545e8e1cf2726ff3228
RUNWAY_API_KEY=key_d68eb82ce8279e2501e226f80be3fcda2e7ee4b755951b51c2bd7b1e891a02e34adf882ec399a3af419064185af82d3551da5a3d96ad59c8b04f892df0906582
MOCK_MODE=false
PORT=8000
```

6. Click **Deploy**
7. Wait for deployment to complete
8. Copy your backend URL (e.g., `https://relicon-backend-production.up.railway.app`)

### 4. Deploy Frontend Service (Next.js)

1. In your project, click **"New"** → **"Service"** → **"GitHub Repo"**
2. Select the same repository
3. Railway will create a second service
4. Click on the new service → **Settings**
5. Set **Root Directory**: `.` (leave blank or set to root)
6. Click **Variables** tab

**Add these environment variables:**

```
NEXT_PUBLIC_SUPABASE_URL=https://eabligzfnqowxdkwavbd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhYmxpZ3pmbnFvd3hka3dhdmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MDg5ODYsImV4cCI6MjA3ODA4NDk4Nn0.WBY14CExSHFYlUf5YiqN466jVwZnvuPzFLKyXw2SpDY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhYmxpZ3pmbnFvd3hka3dhdmJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUwODk4NiwiZXhwIjoyMDc4MDg0OTg2fQ.bZjf0w5OMM-I3RtC3nIl7eg920MFJJG84vYeZGRO4Vw
OPENAI_API_KEY=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
RUNWAY_API_KEY=key_d68eb82ce8279e2501e226f80be3fcda2e7ee4b755951b51c2bd7b1e891a02e34adf882ec399a3af419064185af82d3551da5a3d96ad59c8b04f892df0906582
ELEVENLABS_API_KEY=sk_708522f02da45a93b187a691765e5545e8e1cf2726ff3228
VIDEO_PROVIDER=luma
AUDIO_PROVIDER=elevenlabs
TEXT_PROVIDER=openai
MOCK_MODE=false
ADMIN_API_KEY=88d665fe9df0f78896840dc8a65a13e96db06e01f7bd32ccd95453502c34ecc6
CRON_SECRET=bca54d63bf04e4a98a58808a327c0d63a5b40286524f18b54b74d8ecbae3b228
```

**⚠️ IMPORTANT**: Add `ENGINE_URL` after backend deploys:
```
ENGINE_URL=<your-backend-url-from-step-3>
```

7. Click **Deploy**
8. Wait for deployment to complete

### 5. Update CORS Settings

After both services are deployed:

1. Go to **Backend service** → **Variables**
2. Add or update:
```
ALLOWED_ORIGINS=<your-frontend-url>
```

Example:
```
ALLOWED_ORIGINS=https://relicon-full-production.up.railway.app
```

3. Redeploy backend service

### 6. Generate Domain (Optional)

Railway provides domains automatically, but you can customize them:

1. Go to each service → **Settings**
2. Click **Generate Domain** or **Public Networking**
3. Your services will be accessible via Railway domains

### 7. Test Your Deployment

**Test Backend:**
```
https://your-backend-url.railway.app/health
```

Should return:
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "services": {...}
}
```

**Test Frontend:**
Visit your frontend URL and test the application

## Monitoring & Logs

- Click on each service to view real-time logs
- Monitor resource usage in the **Metrics** tab
- Set up alerts for high usage

## Cost Management

**Tips to stay within free tier:**

1. **Use sleep mode**: Services auto-sleep after inactivity (saves credits)
2. **Monitor usage**: Check Railway dashboard regularly
3. **Optimize**: Remove unused features that consume resources
4. **Set limits**: Configure spending limits in project settings

**Current setup estimated cost:**
- Free tier: $0/month (uses $5 free credits)
- Light usage: $2-5/month
- Medium usage: $5-10/month
- Heavy usage: $10-20/month

## Troubleshooting

### Build Fails

1. Check logs in Railway dashboard
2. Verify `requirements.txt` exists in `engine/` directory
3. Ensure `package.json` is in root directory

### Services Can't Communicate

1. Verify `ENGINE_URL` is set correctly in frontend
2. Check `ALLOWED_ORIGINS` in backend includes frontend URL
3. Ensure both services are deployed and running

### Environment Variables Not Working

1. Double-check variable names (case-sensitive)
2. Redeploy service after adding variables
3. Check for extra spaces or quotes in values

## Deployment Files Created

- `railway.json` - Frontend Railway configuration
- `nixpacks.toml` - Build configuration
- `engine/railway.json` - Backend Railway configuration
- `engine/Procfile` - Backend process definition
- `RAILWAY_DEPLOYMENT.md` - This guide

## Update Your Application

Railway auto-deploys on every push to main branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Railway will automatically rebuild and redeploy both services.

## Next Steps

1. ✅ Deploy both services following steps above
2. ✅ Configure custom domain (optional)
3. ✅ Set up monitoring and alerts
4. ✅ Test your application thoroughly
5. ✅ Share your deployed app!

## Support

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Project Logs: Available in Railway dashboard

---

**Your Railway deployment is ready! 🚂**

Estimated cost: **$0-10/month** (much better than $14/month on Render)
