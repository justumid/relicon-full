# Relicon Full Deployment Guide

## 🎯 Final Setup
- **Main Site**: `https://relicon-full-production-35cc.up.railway.app/`
- **App Dashboard**: `https://app.relicon.co/`
- **API**: `https://relicon-full-production-35cc.up.railway.app/api/`

---

## 📋 Prerequisites

### 1. Accounts Required
- [Railway](https://railway.app) account
- [Supabase](https://supabase.com) account
- Domain registrar access (for `app.relicon.co`)

### 2. API Keys Needed
- OpenAI API key
- Luma AI API key
- ElevenLabs API key
- Supabase keys

---

## 🚀 Step 1: Railway Deployment

### Delete Existing Services
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Delete both existing services (frontend + backend)

### Create New Service
1. Click **"New Project"** → **"Deploy from GitHub repo"**
2. Select your `relicon-full` repository
3. Railway will auto-detect and start building

### Configure Build Settings
1. Go to **Settings** → **Build**
2. Set **Build Command**:
   ```bash
   pnpm install && pnpm build && cd engine && pip install -r requirements.txt
   ```
3. Set **Start Command**:
   ```bash
   cd engine && python static_server.py
   ```

---

## 🔧 Step 2: Environment Variables

### Copy All Variables to Railway
Go to **Variables** tab and add these:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://eabligzfnqowxdkwavbd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhYmxpZ3pmbnFvd3hka3dhdmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MDg5ODYsImV4cCI6MjA3ODA4NDk4Nn0.WBY14CExSHFYlUf5YiqN466jVwZnvuPzFLKyXw2SpDY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhYmxpZ3pmbnFvd3hka3dhdmJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUwODk4NiwiZXhwIjoyMDc4MDg0OTg2fQ.bZjf0w5OMM-I3RtC3nIl7eg920MFJJG84vYeZGRO4Vw

# AI Services
OPENAI_API_KEY=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
LUMA_API_KEY=luma-8267dbe3-8abe-4941-bd92-918156c3860f-00bfe487-abdb-4864-8ad4-622ac065f595
ELEVENLABS_API_KEY=sk_e4d9ceed2e508b771076992402568eadd829fa62ae1e0c38
RUNWAY_API_KEY=key_d68eb82ce8279e2501e226f80be3fcda2e7ee4b755951b51c2bd7b1e891a02e34adf882ec399a3af419064185af82d3551da5a3d96ad59c8b04f892df0906582

# Provider Configuration
VIDEO_PROVIDER=luma
AUDIO_PROVIDER=elevenlabs
TEXT_PROVIDER=openai
MOCK_MODE=false

# Security
ADMIN_API_KEY=88d665fe9df0f78896840dc8a65a13e96db06e01f7bd32ccd95453502c34ecc6
CRON_SECRET=bca54d63bf04e4a98a58808a327c0d63a5b40286524f18b54b74d8ecbae3b228

# CORS & API Configuration
ALLOWED_ORIGINS=https://relicon-full-production-35cc.up.railway.app,https://app.relicon.co
ENGINE_URL=https://relicon-full-production-35cc.up.railway.app/api
```

---

## 🌐 Step 3: Domain Configuration

### Add Custom Domain in Railway
1. Go to **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Enter: `app.relicon.co`
4. Copy the provided CNAME record

### Configure DNS
In your domain registrar (Namecheap, Cloudflare, etc.):

```
Type: CNAME
Name: app
Value: [Railway-provided-CNAME]
TTL: Auto or 300
```

**Example for Namecheap:**
1. Go to Domain List → Manage → Advanced DNS
2. Add Record:
   - Type: `CNAME Record`
   - Host: `app`
   - Value: `your-service.up.railway.app`

---

## 🔍 Step 4: Verification

### Test Main Domain
Visit: `https://relicon-full-production-35cc.up.railway.app/`
- Should show landing page
- Visiting `/dashboard` should redirect to `app.relicon.co`

### Test App Subdomain
Visit: `https://app.relicon.co/`
- Should redirect to login page
- Login and dashboard should work

### Test API
Visit: `https://relicon-full-production-35cc.up.railway.app/api/health`
- Should return: `{"status": "healthy"}`

---

## 🛠️ Step 5: Database Setup (If Needed)

### Supabase Tables
If tables don't exist, run in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  product_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id),
  filename TEXT NOT NULL,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📊 Step 6: Final Testing

### Complete Flow Test
1. **Landing Page**: `https://relicon-full-production-35cc.up.railway.app/`
2. **Login**: `https://app.relicon.co/login`
3. **Dashboard**: `https://app.relicon.co/dashboard`
4. **Studio**: `https://app.relicon.co/dashboard/studio`
5. **API Health**: `https://relicon-full-production-35cc.up.railway.app/api/health`

### Video Generation Test
1. Go to Creative Studio
2. Fill form with product details
3. Click "Create Ad"
4. Monitor progress
5. Download generated video

---

## 🚨 Troubleshooting

### Build Fails
- Check Railway logs in **Deployments** tab
- Ensure all environment variables are set
- Verify API keys are valid

### Domain Not Working
- Wait 5-10 minutes for DNS propagation
- Check CNAME record is correct
- Verify domain is added in Railway

### API Errors
- Check `ENGINE_URL` points to correct domain
- Verify CORS origins include both domains
- Test API health endpoint

### Video Generation Fails
- Check Luma AI API key and credits
- Verify OpenAI API key has GPT-4 access
- Check ElevenLabs API key and credits

---

## ✅ Success Checklist

- [ ] Railway service deployed successfully
- [ ] All environment variables configured
- [ ] Custom domain `app.relicon.co` working
- [ ] Main site redirects dashboard to app subdomain
- [ ] App subdomain serves login/dashboard
- [ ] API endpoints responding
- [ ] Database tables exist
- [ ] Video generation working
- [ ] All API keys valid and funded

---

## 📞 Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify all environment variables
3. Test API endpoints individually
4. Check domain DNS propagation

**Deployment Complete!** 🎉
