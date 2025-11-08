# How to Create and Configure Subdomains in Namecheap

A simple guide to setting up subdomains (like api.yourdomain.com) in Namecheap.

## What is a Subdomain?

- **Domain**: `yourdomain.com`
- **Subdomain**: `api.yourdomain.com`, `blog.yourdomain.com`, `admin.yourdomain.com`

The part before your main domain is the subdomain.

## Step-by-Step: Create Subdomain in Namecheap

### Step 1: Login to Namecheap

1. Go to [namecheap.com](https://namecheap.com)
2. Click **Sign In**
3. Enter your username and password

### Step 2: Access Domain Management

1. Click **Domain List** in the left sidebar
2. Find your domain in the list
3. Click **Manage** button next to your domain

### Step 3: Go to Advanced DNS

1. Click the **Advanced DNS** tab at the top
2. This is where you manage all DNS records

### Step 4: Create Subdomain DNS Record

1. Click **+ ADD NEW RECORD** button
2. You'll see a form with these fields:

#### For API Subdomain (Railway/External Service)

Fill in the form:

| Field | Value | Explanation |
|-------|-------|-------------|
| **Type** | CNAME Record | Select from dropdown |
| **Host** | `api` | The subdomain name (for api.yourdomain.com) |
| **Value** | `your-service.up.railway.app` | Where to point (from Railway) |
| **TTL** | Automatic | Leave as default |

**Example:**
```
Type: CNAME Record
Host: api
Value: relicon-backend-production.up.railway.app
TTL: Automatic
```

3. Click the **✓** (checkmark) or **Save** button

### Step 5: Save All Changes

1. Scroll to the bottom of the page
2. Click **SAVE ALL CHANGES** button (green button)
3. Wait for confirmation message

## Common Subdomain Examples

### Backend API Subdomain
```
Type: CNAME Record
Host: api
Value: your-backend-service.up.railway.app
TTL: Automatic
```
**Result**: `https://api.yourdomain.com`

### Admin Panel Subdomain
```
Type: CNAME Record
Host: admin
Value: your-admin-service.up.railway.app
TTL: Automatic
```
**Result**: `https://admin.yourdomain.com`

### Blog Subdomain
```
Type: CNAME Record
Host: blog
Value: your-blog-service.up.railway.app
TTL: Automatic
```
**Result**: `https://blog.yourdomain.com`

### App Subdomain
```
Type: CNAME Record
Host: app
Value: your-app-service.up.railway.app
TTL: Automatic
```
**Result**: `https://app.yourdomain.com`

## Understanding the Fields

### Type (Record Type)

**CNAME Record** - Used for subdomains pointing to another domain
- ✅ Use for: `api`, `blog`, `admin`, `www`
- Points to: Another domain/hostname
- Example: `api` → `service.railway.app`

**A Record** - Points directly to an IP address
- Use for: Root domain (`@`) or subdomains with IP
- Points to: IP address (like `147.185.221.23`)
- Example: `@` → `147.185.221.23`

### Host

The subdomain name (the part before your domain):
- `api` → creates `api.yourdomain.com`
- `www` → creates `www.yourdomain.com`
- `blog` → creates `blog.yourdomain.com`
- `@` → refers to root domain `yourdomain.com`

### Value

Where the subdomain should point to:
- For CNAME: Another domain (like `service.railway.app`)
- For A Record: An IP address (like `147.185.221.23`)

⚠️ **Important**: Don't add `http://` or `https://` - just the domain!

### TTL (Time To Live)

How long DNS servers cache this record:
- **Automatic** - Namecheap decides (recommended)
- **1 min** - Changes update faster (use during setup)
- **30 min** - Default
- **1 hour+** - Changes update slower (use after stable)

## Visual Guide: Namecheap Interface

When you click "+ ADD NEW RECORD", you'll see:

```
┌─────────────────────────────────────────────────────┐
│ Type ▼          Host          Value         TTL ▼   │
│ [CNAME Record]  [api]  [your-service.railway.app] [Automatic] ✓ │
└─────────────────────────────────────────────────────┘
```

Fill it like this for your API:
```
┌─────────────────────────────────────────────────────┐
│ CNAME Record    api    relicon-backend.up.railway.app   Automatic ✓ │
└─────────────────────────────────────────────────────┘
```

## After Adding the Subdomain

### 1. Verify the Record is Saved

In Advanced DNS, you should see your new record in the list:

```
Type          Host    Value                              TTL
─────────────────────────────────────────────────────────────
CNAME Record  api     relicon-backend.up.railway.app    Automatic
```

### 2. Wait for DNS Propagation

- **Minimum wait**: 5-10 minutes
- **Average wait**: 15-30 minutes
- **Maximum wait**: 24-48 hours (rare)

### 3. Check DNS Propagation

**Method 1: Online Tool**
1. Go to [dnschecker.org](https://dnschecker.org)
2. Enter: `api.yourdomain.com`
3. Select: `CNAME`
4. Click **Search**
5. Check if it shows your Railway URL globally

**Method 2: Command Line**

Mac/Linux:
```bash
nslookup api.yourdomain.com
```

Windows:
```bash
nslookup api.yourdomain.com
```

Should show:
```
api.yourdomain.com canonical name = your-service.up.railway.app
```

### 4. Test the Subdomain

Once propagated, test in browser:
```
https://api.yourdomain.com/health
```

## Editing an Existing Subdomain

1. Go to **Domain List** → **Manage** → **Advanced DNS**
2. Find the record you want to edit
3. Click the **pencil icon** (✏️) on the right
4. Update the **Value** or other fields
5. Click **✓** (checkmark)
6. Click **SAVE ALL CHANGES** at bottom

## Deleting a Subdomain

1. Go to **Domain List** → **Manage** → **Advanced DNS**
2. Find the record you want to delete
3. Click the **trash icon** (🗑️) on the right
4. Confirm deletion
5. Click **SAVE ALL CHANGES** at bottom

## Common Issues & Solutions

### Issue: "CNAME record conflicts with other records"

**Cause**: You can't have a CNAME and A record for the same host

**Solution**: Delete the conflicting A record first
1. Find the A record with same host name
2. Delete it (🗑️ icon)
3. Then add your CNAME record

### Issue: "Subdomain not resolving"

**Cause 1**: DNS not propagated yet
- **Solution**: Wait 15-30 minutes

**Cause 2**: Typo in Value field
- **Solution**: Double-check Railway URL is correct

**Cause 3**: Didn't save changes
- **Solution**: Click "SAVE ALL CHANGES" button

### Issue: "Too many redirects" or "SSL error"

**Cause**: Railway hasn't provisioned SSL yet

**Solution**:
1. Wait for DNS to propagate first
2. Then wait for Railway to provision SSL (5-10 min)
3. Check Railway dashboard for SSL status

### Issue: Value field shows error

**Cause**: Added `https://` or trailing slash

**Correct**: `your-service.railway.app`
**Wrong**: `https://your-service.railway.app/`

## Multiple Subdomains Example

Here's a complete DNS setup with multiple subdomains:

| Type  | Host  | Value | TTL |
|-------|-------|-------|-----|
| A     | @     | 147.185.221.23 | Automatic |
| CNAME | www   | relicon-frontend.up.railway.app | Automatic |
| CNAME | api   | relicon-backend.up.railway.app | Automatic |
| CNAME | admin | relicon-admin.up.railway.app | Automatic |
| CNAME | docs  | relicon-docs.up.railway.app | Automatic |

This creates:
- `yourdomain.com` → Frontend
- `www.yourdomain.com` → Frontend
- `api.yourdomain.com` → Backend API
- `admin.yourdomain.com` → Admin panel
- `docs.yourdomain.com` → Documentation

## Best Practices

### Naming Conventions

**Common subdomain names:**
- `api` - Backend API
- `www` - Main website
- `app` - Web application
- `admin` - Admin panel
- `blog` - Blog
- `docs` - Documentation
- `staging` - Staging environment
- `dev` - Development environment

### Security

- Use SSL/HTTPS (Railway provides this automatically)
- Don't use subdomains to hide admin panels (use authentication)
- Keep DNS records up to date

### Organization

- Document your subdomains (what each one is for)
- Use consistent naming across environments
- Clean up unused subdomains

## Quick Reference Card

**Creating API Subdomain for Railway:**
```
1. Namecheap → Domain List → Manage
2. Advanced DNS tab
3. + ADD NEW RECORD
4. Type: CNAME Record
5. Host: api
6. Value: <from-railway-dashboard>.up.railway.app
7. TTL: Automatic
8. Click ✓
9. SAVE ALL CHANGES
10. Wait 15-30 minutes
```

## Need Help?

- **Namecheap Support**: [namecheap.com/support](https://www.namecheap.com/support/)
- **DNS Checker**: [dnschecker.org](https://dnschecker.org)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)

---

**Your subdomain is ready!** 🎉

After DNS propagates, your subdomain will point to your Railway service with automatic SSL.
