# IMMEDIATE ACTION REQUIRED - Vercel Setup

## Quick Fix (5 minutes)

The blank page is caused by missing `DATABASE_URL` environment variable.

### Step 1: Get Your Database Connection String
You need your PostgreSQL connection string. It should look like:
```
postgresql://username:password@host.region.postgres.vercel.app:5432/dbname
```

If you don't have this:
- Check Neon dashboard (if using Neon)
- Or your PostgreSQL provider's dashboard
- Or the `.env` file in your local development (DON'T SHARE THIS)

### Step 2: Add to Vercel

1. Open: https://vercel.com/dashboard
2. Click your **ZAD Premium Box Fit** project
3. Go to: **Settings** (top navigation)
4. Click: **Environment Variables** (left sidebar)
5. Click: **Add New**

### Step 3: Add DATABASE_URL

| Field | Value |
|-------|-------|
| **Name** | `DATABASE_URL` |
| **Value** | `postgresql://username:password@host:5432/dbname` |
| **Environment** | Check: `Production`, `Preview`, `Development` |

Then click **Add**

### Step 4: Add NEXTAUTH_SECRET (if not already set)

Click **Add New** again:

| Field | Value |
|-------|-------|
| **Name** | `NEXTAUTH_SECRET` |
| **Value** | Generate random: `openssl rand -base64 32` |
| **Environment** | Check: `Production`, `Preview`, `Development` |

Then click **Add**

### Step 5: Redeploy

1. Click **Deployments** (top navigation)
2. Find the most recent one (should show "Queued" or "Building")
3. Click the **three dots** → **Redeploy**
4. OR: Push to your Git repository (main/master branch) to trigger auto-deploy

### Step 6: Verify

1. Wait 2-3 minutes for deployment
2. Visit: https://zadfitt.com
3. You should see the full homepage

## If Still Blank

### Check Console (F12 → Console tab)
Look for any error messages starting with `[ZAD]`

### Common Issues

| Error Message | Solution |
|--------------|----------|
| `DATABASE_URL is missing` | Follow Step 3 above |
| `NEXTAUTH_SECRET is undefined` | Follow Step 4 above |
| `Invalid connection string` | Check the format is correct |
| `Connection timeout` | Database might not be accessible from Vercel (check firewall) |

## All Environment Variables Needed

If you want the full feature set, also add:

```
NEXTAUTH_URL=https://zadfitt.com
NEXT_PUBLIC_APP_URL=https://zadfitt.com

# Only if using Paymob payment:
PAYMOB_API_KEY=[your key]
PAYMOB_HMAC_SECRET=[your secret]
PAYMOB_IFRAME_ID=[your id]
PAYMOB_CARD_INTEGRATION_ID=[your id]
PAYMOB_WALLET_INTEGRATION_ID=[your id]
PAYMOB_VALU_INTEGRATION_ID=[your id]
```

## FAQ

**Q: Where do I get DATABASE_URL?**  
A: From your database provider (Neon, Supabase, AWS RDS, etc.) dashboard

**Q: Can I use the local .env values?**  
A: NO - use production database connection strings only

**Q: How long does redeployment take?**  
A: 2-5 minutes usually

**Q: Site still blank after redeployment?**  
A: Check browser console errors (F12 → Console), email support if needed

---

**This is the final fix needed!** ✅
