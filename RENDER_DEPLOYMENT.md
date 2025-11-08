# Render Deployment Guide

## Generated Secure Keys

Your secure keys have been generated:

- **ADMIN_API_KEY**: `88d665fe9df0f78896840dc8a65a13e96db06e01f7bd32ccd95453502c34ecc6`
- **CRON_SECRET**: `bca54d63bf04e4a98a58808a327c0d63a5b40286524f18b54b74d8ecbae3b228`

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2. Create Render Account

- Go to [render.com](https://render.com)
- Sign up with GitHub

### 3. Deploy Using Blueprint

1. Click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository: `relicon-full`
3. Render will detect `render.yaml`
4. Click **"Apply"**

### 4. Configure Environment Variables

Render will create two services. Add these environment variables:

#### Frontend Service (relicon-frontend)

Go to the service → Environment → Add Environment Variables:

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

**After backend deploys, update these:**
```
ALLOWED_ORIGINS=https://relicon-frontend.onrender.com
ENGINE_URL=https://relicon-backend.onrender.com
```

#### Backend Service (relicon-backend)

Go to the service → Environment → Add Environment Variables:

```
OPENAI_API_KEY=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
ELEVENLABS_API_KEY=sk_708522f02da45a93b187a691765e5545e8e1cf2726ff3228
RUNWAY_API_KEY=key_d68eb82ce8279e2501e226f80be3fcda2e7ee4b755951b51c2bd7b1e891a02e34adf882ec399a3af419064185af82d3551da5a3d96ad59c8b04f892df0906582
MOCK_MODE=false
```

```
LUMA_API_KEY=luma-8267dbe3-8abe-4941-bd92-918156c3860f-00bfe487-abdb-4864-8ad4-622ac065f595
```

**After frontend deploys, update this:**
```
ALLOWED_ORIGINS=https://relicon-frontend.onrender.com
```

### 5. Update URLs After Deployment

After both services are deployed, Render will give you URLs like:
- Frontend: `https://relicon-frontend.onrender.com`
- Backend: `https://relicon-backend.onrender.com`

**Update these environment variables:**

1. In **Frontend** service, update:
   - `ENGINE_URL` → Your backend URL
   - `ALLOWED_ORIGINS` → Your frontend URL

2. In **Backend** service, update:
   - `ALLOWED_ORIGINS` → Your frontend URL

3. Click **"Manual Deploy"** → **"Clear build cache & deploy"** for both services

### 6. Test Your Deployment

Visit your backend health endpoint:
```
https://relicon-backend.onrender.com/health
```

You should see:
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "services": {...}
}
```

Then visit your frontend URL to test the full application.

## Important Notes

- **Free Tier**: Services spin down after 15 minutes of inactivity
- **First Request**: May take 30-60 seconds after spin-down
- **Upgrade**: Consider paid tier ($7/month per service) for always-on
- **Missing Key**: You need to add a valid `LUMA_API_KEY` to the backend

## Troubleshooting

If deployment fails:
1. Check the logs in Render dashboard
2. Verify all environment variables are set
3. Ensure `render.yaml` is in the repository root
4. Check that `engine/requirements.txt` exists

## Files Created

- `render.yaml` - Render configuration
- `.env.render.frontend` - Frontend environment variables reference
- `.env.render.backend` - Backend environment variables reference
- `RENDER_DEPLOYMENT.md` - This guide

**⚠️ Do NOT commit the `.env.render.*` files to Git - they contain sensitive keys!**
