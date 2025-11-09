# Railway Combined Deployment Setup

## Overview
This setup serves both frontend and backend from the engine domain: `https://relicon-full-production-35cc.up.railway.app`

## Steps

### 1. Delete Current Services
- Delete both existing Railway services (frontend and backend)

### 2. Create Single Service
1. Create new Railway service from GitHub repo
2. Use `railway-combined.json` configuration
3. Set environment variables from `.env.railway.combined`

### 3. Configure Build
Railway will automatically:
- Install Node.js dependencies (`pnpm install`)
- Build Next.js frontend (`pnpm build`)
- Install Python dependencies (`pip install -r requirements.txt`)
- Start combined server (`python engine/static_server.py`)

### 4. Environment Variables
Copy all variables from `.env.railway.combined` to Railway dashboard:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://eabligzfnqowxdkwavbd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=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
LUMA_API_KEY=luma-8267dbe3-8abe-4941-bd92-918156c3860f-00bfe487-abdb-4864-8ad4-622ac065f595
ELEVENLABS_API_KEY=sk_e4d9ceed2e508b771076992402568eadd829fa62ae1e0c38
ENGINE_URL=https://relicon-full-production-35cc.up.railway.app/api
```

### 5. URL Structure
- **Frontend**: `https://relicon-full-production-35cc.up.railway.app/`
- **Login**: `https://relicon-full-production-35cc.up.railway.app/login`
- **Dashboard**: `https://relicon-full-production-35cc.up.railway.app/dashboard`
- **API**: `https://relicon-full-production-35cc.up.railway.app/api/*`

### 6. Test Deployment
1. Visit: `https://relicon-full-production-35cc.up.railway.app/`
2. Check API: `https://relicon-full-production-35cc.up.railway.app/api/health`
3. Test login flow

## Benefits
- Single domain for everything
- Simplified deployment
- No CORS issues
- Better SEO and user experience
