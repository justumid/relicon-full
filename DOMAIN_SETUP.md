# Custom Domain Setup Guide - Namecheap to Railway

Connect your Namecheap domain to your Railway deployment.

## What You'll Set Up

- **Frontend**: `yourdomain.com` or `www.yourdomain.com`
- **Backend API**: `api.yourdomain.com`

Replace `yourdomain.com` with your actual domain throughout this guide.

## Step 1: Add Custom Domain in Railway - Backend First

### Backend Service (api.yourdomain.com)

1. Go to Railway dashboard
2. Click on your **Backend service** (Python/FastAPI)
3. Go to **Settings** tab
4. Scroll to **Networking** section
5. Click **+ Custom Domain**
6. Enter: `api.yourdomain.com`
7. Click **Add Domain**

Railway will show you DNS records to add. **Keep this page open!**

You'll see something like:
```
Type: CNAME
Name: api
Value: <your-service>.up.railway.app
```

### Frontend Service (yourdomain.com)

1. Click on your **Frontend service** (Next.js)
2. Go to **Settings** tab
3. Scroll to **Networking** section
4. Click **+ Custom Domain**
5. Enter your domain, either:
   - `yourdomain.com` (apex domain)
   - `www.yourdomain.com` (www subdomain)
6. Click **Add Domain**

Railway will show DNS records:

**For apex domain** (`yourdomain.com`):
```
Type: A
Name: @
Value: <Railway IP address>

Type: AAAA
Name: @
Value: <Railway IPv6 address>
```

**For www subdomain** (`www.yourdomain.com`):
```
Type: CNAME
Name: www
Value: <your-service>.up.railway.app
```

**Keep Railway pages open for the DNS values!**

## Step 2: Configure DNS in Namecheap

1. Go to [namecheap.com](https://namecheap.com)
2. Sign in to your account
3. Go to **Domain List**
4. Click **Manage** next to your domain
5. Go to **Advanced DNS** tab

### Add DNS Records

Click **Add New Record** for each of these:

#### For Backend API (api.yourdomain.com)

| Type  | Host | Value | TTL |
|-------|------|-------|-----|
| CNAME | api  | `<your-backend-service>.up.railway.app` | Automatic |

**Example:**
```
Type: CNAME
Host: api
Value: relicon-backend-production.up.railway.app
TTL: Automatic
```

#### For Frontend

**Option A: Using Apex Domain** (`yourdomain.com`)

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A    | @    | `<Railway IP from Step 1>` | Automatic |
| AAAA | @    | `<Railway IPv6 from Step 1>` | Automatic |

**Option B: Using WWW Subdomain** (`www.yourdomain.com`)

| Type  | Host | Value | TTL |
|-------|------|-------|-----|
| CNAME | www  | `<your-frontend-service>.up.railway.app` | Automatic |

**Recommended: Set up both**
```
Type: A
Host: @
Value: <Railway IP>
TTL: Automatic

Type: CNAME
Host: www
Value: <your-frontend-service>.up.railway.app
TTL: Automatic
```

### Important: Remove Conflicting Records

In Namecheap Advanced DNS, remove or disable:
- Any existing **A records** for `@` or `www` (if using those)
- Any existing **CNAME records** for `api`, `@`, or `www`
- Default **URL Redirect Records** (if any)

Click **Save All Changes**

## Step 3: Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours** (usually 15-30 minutes)
- Railway will automatically provision SSL certificates once DNS is verified

**Check propagation:**
- Use [dnschecker.org](https://dnschecker.org)
- Enter your domain and subdomain to verify

## Step 4: Verify SSL Certificates in Railway

1. Go back to Railway dashboard
2. Check each service's **Settings** → **Networking**
3. You should see:
   ```
   ✓ api.yourdomain.com - SSL Active
   ✓ yourdomain.com - SSL Active
   ```

This can take 5-10 minutes after DNS propagates.

## Step 5: Update Environment Variables

### Update Backend CORS

1. Go to **Backend service** → **Variables**
2. Update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```
3. Save (auto-redeploys)

### Update Frontend API URL

1. Go to **Frontend service** → **Variables**
2. Update `ENGINE_URL`:
   ```
   ENGINE_URL=https://api.yourdomain.com
   ```
3. Add `ALLOWED_ORIGINS` if not present:
   ```
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```
4. Save (auto-redeploys)

## Step 6: Test Your Custom Domains

### Test Backend API
```bash
curl https://api.yourdomain.com/health
```

Should return:
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "services": {...}
}
```

### Test Frontend
Visit: `https://yourdomain.com` in your browser

Both should load with valid SSL (🔒 padlock icon).

## Troubleshooting

### Domain not resolving

**Check DNS propagation:**
```bash
nslookup api.yourdomain.com
nslookup yourdomain.com
```

**Verify DNS records in Namecheap:**
- Make sure records are saved
- Check for typos in CNAME values
- Ensure no conflicting records

### SSL Certificate not provisioning

**Wait longer:**
- Can take up to 24 hours
- Railway needs to verify domain ownership via DNS

**Check DNS:**
- Use [dnschecker.org](https://dnschecker.org)
- Ensure CNAME/A records are propagated globally

### "Not Secure" or SSL errors

**Railway hasn't provisioned SSL yet:**
- Wait for DNS to fully propagate
- Railway auto-provisions Let's Encrypt certificates
- Check Railway dashboard for SSL status

### CORS errors

**Update environment variables:**
- Check `ALLOWED_ORIGINS` in backend includes your domains
- Check `ENGINE_URL` in frontend points to `https://api.yourdomain.com`
- Redeploy both services after updating

### Railway shows "Domain verification failed"

**DNS not pointing correctly:**
- Double-check CNAME/A record values in Namecheap
- Make sure you copied Railway's values exactly
- Remove any trailing dots from DNS values
- Wait for DNS propagation (15-30 minutes)

## Common Namecheap DNS Settings

**Disable Namecheap's parking page:**
1. Go to Domain List → Manage
2. Uncheck "Parking Page" if enabled

**Disable URL forwarding:**
1. Go to Advanced DNS
2. Remove any "URL Redirect Record" entries

**Use Namecheap DNS (not third-party):**
1. Go to Domain → Nameservers
2. Select "Namecheap BasicDNS" or "Namecheap PremiumDNS"

## Final DNS Configuration Example

Here's what your Namecheap Advanced DNS should look like:

| Type  | Host | Value | TTL |
|-------|------|-------|-----|
| A     | @    | 147.185.221.23 (Railway IP) | Automatic |
| CNAME | www  | relicon-frontend-production.up.railway.app | Automatic |
| CNAME | api  | relicon-backend-production.up.railway.app | Automatic |

*(Replace with your actual Railway values)*

## Summary Checklist

- [ ] Add `api.yourdomain.com` custom domain in Railway Backend
- [ ] Add `yourdomain.com` custom domain in Railway Frontend
- [ ] Add CNAME record for `api` in Namecheap DNS
- [ ] Add A/CNAME records for `@`/`www` in Namecheap DNS
- [ ] Remove conflicting DNS records in Namecheap
- [ ] Wait for DNS propagation (15-30 minutes)
- [ ] Verify SSL certificates active in Railway
- [ ] Update `ALLOWED_ORIGINS` in Backend
- [ ] Update `ENGINE_URL` in Frontend
- [ ] Test `https://api.yourdomain.com/health`
- [ ] Test `https://yourdomain.com` in browser
- [ ] Verify SSL padlock appears in browser

## Need Help?

- Railway Docs: [docs.railway.app/deploy/deployments#custom-domains](https://docs.railway.app/deploy/deployments#custom-domains)
- Namecheap DNS Guide: [namecheap.com/support/knowledgebase/](https://www.namecheap.com/support/knowledgebase/)
- DNS Checker: [dnschecker.org](https://dnschecker.org)

---

**Your custom domain setup is complete!** 🎉

Frontend: `https://yourdomain.com`
Backend: `https://api.yourdomain.com`
