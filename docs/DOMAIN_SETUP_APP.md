# App Subdomain Setup Guide

## Domain Structure
- **Main Site**: `https://relicon-full-production-35cc.up.railway.app/` (marketing, landing)
- **App Dashboard**: `https://app.relicon.co/` (login, dashboard, studio)
- **API**: `https://relicon-full-production-35cc.up.railway.app/api/` (backend)

## Railway Setup

### 1. Custom Domain Configuration
In Railway dashboard:
1. Go to your service settings
2. Add custom domain: `app.relicon.co`
3. Point your DNS to Railway's provided CNAME

### 2. DNS Configuration
In your domain registrar (Namecheap, etc.):
```
Type: CNAME
Name: app
Value: [Railway-provided-CNAME]
```

### 3. Environment Variables
Update in Railway dashboard:
```bash
ALLOWED_ORIGINS=https://relicon-full-production-35cc.up.railway.app,https://app.relicon.co
ENGINE_URL=https://relicon-full-production-35cc.up.railway.app/api
```

## URL Routing

### Main Domain (`relicon-full-production-35cc.up.railway.app`)
- `/` → Landing page
- `/about` → About page  
- `/contact` → Contact page
- `/dashboard` → Redirects to `app.relicon.co/dashboard`
- `/login` → Redirects to `app.relicon.co/login`

### App Subdomain (`app.relicon.co`)
- `/` → Redirects to `/login`
- `/login` → Login page
- `/dashboard/*` → Dashboard pages
- Other routes → Redirects to `/dashboard`

## Benefits
- Clean separation of marketing vs app
- Professional app subdomain
- SEO-friendly structure
- Easy to remember URLs
