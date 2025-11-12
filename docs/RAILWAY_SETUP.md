# Railway Deployment Setup Guide

## ✅ Complete Environment Variable Configuration

### Issue: Chatbot showing "OpenAI API key not configured"

**Root Cause**: The `OPENAI_API_KEY` environment variable is not set in your Railway **UI Service** deployment.

---

## 🚀 Step-by-Step Fix

### 1. Find Your Railway Services

Go to https://railway.app and locate your two services:
- **UI Service** (Next.js frontend)
- **Engine Service** (Python backend)

### 2. Configure UI Service Environment Variables

Click on your **UI Service** → Go to **Variables** tab → Add these:

```bash
# ================================
# CRITICAL FOR CHATBOT
# ================================
OPENAI_API_KEY=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

# ================================
# SUPABASE
# ================================
NEXT_PUBLIC_SUPABASE_URL=https://eabligzfnqowxdkwavbd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhYmxpZ3pmbnFvd3hka3dhdmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MDg5ODYsImV4cCI6MjA3ODA4NDk4Nn0.WBY14CExSHFYlUf5YiqN466jVwZnvuPzFLKyXw2SpDY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhYmxpZ3pmbnFvd3hka3dhdmJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUwODk4NiwiZXhwIjoyMDc4MDg0OTg2fQ.bZjf0w5OMM-I3RtC3nIl7eg920MFJJG84vYeZGRO4Vw

# ================================
# ENGINE API URL
# ================================
# Replace with YOUR Railway engine service URL
ENGINE_URL=https://your-engine-service.up.railway.app

# ================================
# OPTIONAL AI SERVICES
# (Only needed if using these features)
# ================================
ELEVENLABS_API_KEY=sk_708522f02da45a93b187a691765e5545e8e1cf2726ff3228
RUNWAY_API_KEY=key_d68eb82ce8279e2501e226f80be3fcda2e7ee4b755951b51c2bd7b1e891a02e34adf882ec399a3af419064185af82d3551da5a3d96ad59c8b04f892df0906582

# ================================
# SECURITY
# ================================
ADMIN_API_KEY=88d665fe9df0f78896840dc8a65a13e96db06e01f7bd32ccd95453502c34ecc6
CRON_SECRET=bca54d63bf04e4a98a58808a327c0d63a5b40286524f18b54b74d8ecbae3b228
```

### 3. Configure Engine Service Environment Variables

Click on your **Engine Service** → Go to **Variables** tab → Add these:

```bash
# ================================
# AI SERVICE KEYS
# ================================
OPENAI_API_KEY=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
LUMA_API_KEY=luma-8267dbe3-8abe-4941-bd92-918156c3860f-00bfe487-abdb-4864-8ad4-622ac065f595
ELEVENLABS_API_KEY=sk_708522f02da45a93b187a691765e5545e8e1cf2726ff3228
RUNWAY_API_KEY=key_d68eb82ce8279e2501e226f80be3fcda2e7ee4b755951b51c2bd7b1e891a02e34adf882ec399a3af419064185af82d3551da5a3d96ad59c8b04f892df0906582

# ================================
# CORS
# ================================
# Replace with YOUR Railway UI service URL
ALLOWED_ORIGINS=https://your-ui-service.up.railway.app

# ================================
# OPTIONAL
# ================================
MOCK_MODE=false
VIDEO_PROVIDER=luma
AUDIO_PROVIDER=elevenlabs
TEXT_PROVIDER=openai
```

### 4. Redeploy Both Services

After adding environment variables:
1. Railway will automatically trigger a redeploy
2. Wait for both services to finish deploying (green checkmark)
3. This usually takes 2-5 minutes

---

## 🧪 Verify Setup

### Method 1: Health Check Endpoint

Visit this URL in your browser:
```
https://your-ui-service.up.railway.app/api/chat/health
```

**Expected Response (Success):**
```json
{
  "status": "healthy",
  "openai_configured": true,
  "key_length": 164,
  "key_prefix": "sk-proj",
  "environment": "production"
}
```

**Error Response (Not Configured):**
```json
{
  "status": "missing_api_key",
  "openai_configured": false,
  "key_length": 0,
  "key_prefix": "none",
  "environment": "production"
}
```

### Method 2: Test Chatbot

1. Go to your dashboard: `https://your-ui-service.up.railway.app/dashboard/chat`
2. Type a message: "Hello"
3. Should get a response from the AI assistant

---

## 📋 Checklist

Before testing, ensure:

- [ ] **UI Service** has `OPENAI_API_KEY` set
- [ ] **UI Service** has `ENGINE_URL` pointing to engine service
- [ ] **Engine Service** has all AI API keys set
- [ ] **Engine Service** has `ALLOWED_ORIGINS` with UI service URL
- [ ] Both services have been redeployed
- [ ] Health check endpoint returns `"openai_configured": true`

---

## 🐛 Common Issues

### Issue 1: Still shows "API key not configured"
**Solution**:
1. Check Railway Variables tab - make sure no typos
2. Verify the variable is `OPENAI_API_KEY` (exact case)
3. Click "Redeploy" button in Railway
4. Wait for deployment to complete (2-5 min)
5. Clear browser cache and try again

### Issue 2: Invalid API key error
**Solution**:
1. The API key might be expired
2. Go to https://platform.openai.com/api-keys
3. Create a new API key
4. Update `OPENAI_API_KEY` in Railway
5. Redeploy

### Issue 3: Chat returns 500 error
**Solution**:
1. Check Railway logs: Click service → Deployments → View Logs
2. Look for error messages
3. Common causes:
   - API key quota exceeded
   - Network connectivity issues
   - OpenAI service outage

---

## 💡 Pro Tips

### Tip 1: Use Railway's Secret References
Instead of copying keys multiple times, you can reference them:
```
# In UI Service
OPENAI_API_KEY=${{OPENAI_API_KEY}}
```

### Tip 2: Check Logs
To debug issues, view logs in Railway:
```
Service → Deployments → Latest Deployment → View Logs
```

Look for lines like:
```
Chat API called
OPENAI_API_KEY exists: true
OPENAI_API_KEY length: 164
```

### Tip 3: Test Locally First
Before deploying, test locally:
```bash
# Create .env.local file (already exists)
# Start dev server
pnpm dev

# Test at http://localhost:5000/dashboard/chat
```

---

## 📞 Quick Test Command

Run this in your terminal to test the health endpoint:

```bash
# Replace with your Railway UI service URL
curl https://your-ui-service.up.railway.app/api/chat/health
```

Expected output:
```json
{"status":"healthy","openai_configured":true, ...}
```

---

## ✅ Final Verification

Once everything is set up:

1. **Chatbot Test**:
   - Go to `/dashboard/chat`
   - Send message: "What is ROAS?"
   - Should get AI response about Return on Ad Spend

2. **Video Generation Test**:
   - Go to `/dashboard/studio`
   - Create a video ad
   - Should work without errors

3. **Campaign Test**:
   - Go to `/dashboard/campaigns`
   - Create a new campaign
   - Associate a video with it

---

## 🎯 Summary

**The KEY issue**: Railway doesn't automatically load `.env.local` files. You MUST manually add environment variables in the Railway dashboard.

**The CRITICAL variable for chat**: `OPENAI_API_KEY` must be added to the **UI Service** in Railway.

After adding it and redeploying, the chatbot will work! 🎉
