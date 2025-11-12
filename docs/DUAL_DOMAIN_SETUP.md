# Dual Domain Setup Guide

## 🌐 Domain Structure
- **Main Site**: `https://relicon.co/` (landing page, marketing)
- **App Dashboard**: `https://app.relicon.co/` (login, dashboard, studio)
- **API**: `https://relicon-full-production-35cc.up.railway.app/api/`

## 🚀 Railway Setup

### 1. Add Custom Domains
In Railway dashboard → Settings → Domains:
1. Add: `relicon.co`
2. Add: `app.relicon.co`

### 2. DNS Configuration
In your domain registrar:

**For main domain:**
```
Type: CNAME
Name: @
Value: [Railway-CNAME-for-relicon.co]
```

**For app subdomain:**
```
Type: CNAME  
Name: app
Value: [Railway-CNAME-for-app.relicon.co]
```

### 3. Environment Variables
Update in Railway dashboard:
```bash
ALLOWED_ORIGINS=https://relicon.co,https://app.relicon.co,https://relicon-full-production-35cc.up.railway.app
```

## 📍 URL Routing Behavior

### Main Domain (`relicon.co`)
- `/` → Landing page
- `/about` → About page
- `/contact` → Contact page
- `/join-waitlist` → Waitlist page
- `/dashboard` → Redirects to `app.relicon.co/dashboard`
- `/login` → Redirects to `app.relicon.co/login`

### App Subdomain (`app.relicon.co`)
- `/` → Redirects to `/login`
- `/login` → Login page
- `/dashboard/*` → Dashboard pages
- `/dashboard/studio` → Creative Studio
- `/dashboard/ads` → Generated ads
- Other routes → Redirects to `/dashboard`

### API (`relicon-full-production-35cc.up.railway.app`)
- `/api/*` → Backend API endpoints
- `/api/health` → Health check

## ✅ Testing Checklist

### Main Domain
- [ ] `https://relicon.co/` shows landing page
- [ ] `https://relicon.co/about` shows about page
- [ ] `https://relicon.co/dashboard` redirects to app subdomain

### App Subdomain  
- [ ] `https://app.relicon.co/` redirects to login
- [ ] `https://app.relicon.co/login` shows login page
- [ ] `https://app.relicon.co/dashboard` shows dashboard

### API
- [ ] `https://relicon-full-production-35cc.up.railway.app/api/health` returns health status

## 🔧 Benefits
- Clean separation of marketing vs application
- Professional subdomain structure
- SEO-friendly main domain
- Easy to remember URLs
- Single Railway deployment
