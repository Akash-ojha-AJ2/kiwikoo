# Domain Setup Guide: kiwikoo.com with Vercel

## Quick Setup (Recommended: Use Vercel DNS)

### Step 1: Get Vercel Nameservers

In your Vercel dashboard:
1. Go to **Settings** → **Domains**
2. Click on `kiwikoo.com`
3. Select the **"Vercel DNS"** tab
4. Copy the nameservers:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`

### Step 2: Update Nameservers in GoDaddy

1. **Go to GoDaddy Domain Manager:**
   - Log in to GoDaddy
   - Go to **My Products** → **Domains**
   - Click on `kiwikoo.com`
   - Click **DNS** or **Manage DNS**

2. **Change Nameservers:**
   - Scroll down to **"Nameservers"** section
   - Click **"Change"** or **"Edit"**
   - Select **"Custom"** (not "GoDaddy Nameservers")
   - Enter the two Vercel nameservers:
     - `ns1.vercel-dns.com`
     - `ns2.vercel-dns.com`
   - Click **Save**

3. **Wait for Propagation:**
   - DNS changes can take 24-48 hours to fully propagate
   - Usually works within 1-2 hours
   - Vercel will automatically detect when nameservers are updated

### Step 3: Verify in Vercel

1. Go back to Vercel → **Settings** → **Domains**
2. Click on `kiwikoo.com`
3. Click **"Refresh"** button
4. Status should change from "Invalid Configuration" to "Valid Configuration" once nameservers propagate

---

## Alternative: Use DNS Records (Keep GoDaddy Nameservers)

If you prefer to keep GoDaddy's nameservers, you can add DNS records instead:

### For `www.kiwikoo.com`:

1. **In GoDaddy DNS Settings:**
   - Go to **DNS** → **DNS Records**
   - Click **"Add"** or **"Add Record"**

2. **Add CNAME Record:**
   - **Type:** CNAME
   - **Name:** `www`
   - **Value:** `cc0a6b0573f5a2bc.vercel-dns-017.com.` (copy from Vercel)
   - **TTL:** 600 (or default)
   - Click **Save**

### For `kiwikoo.com` (root domain):

Root domains (apex domains) cannot use CNAME records. You have two options:

**Option A: Use A Records (if Vercel provides them)**
- Check Vercel dashboard for A record IP addresses
- Add A records pointing to those IPs

**Option B: Use ALIAS/ANAME Record (if GoDaddy supports it)**
- Some DNS providers support ALIAS records for root domains
- Check if GoDaddy supports this

**Option C: Use Vercel DNS (Recommended)**
- This is why using Vercel DNS is recommended - it handles root domains automatically

---

## Troubleshooting

### Domain Still Shows "Invalid Configuration"

1. **Wait longer:** DNS propagation can take up to 48 hours
2. **Check nameservers:** Verify they're correctly set in GoDaddy
3. **Clear DNS cache:** 
   - Windows: `ipconfig /flushdns`
   - Mac/Linux: `sudo dscacheutil -flushcache`
4. **Use DNS checker:** Visit https://dnschecker.org to see global DNS propagation

### Domain Not Working After Setup

1. **Check SSL Certificate:** Vercel automatically provisions SSL certificates
2. **Verify Environment Variables:** Ensure `NEXT_PUBLIC_SITE_URL=https://kiwikoo.com` is set
3. **Check Vercel Deployment:** Make sure your latest deployment is live

### Both www and root domain

- `kiwikoo.com` (root) - Use Vercel DNS nameservers
- `www.kiwikoo.com` - Will automatically work once root domain is configured, or add CNAME record

---

## After Setup

Once your domain is configured:

1. **Update Environment Variables:**
   ```env
   NEXT_PUBLIC_SITE_URL=https://kiwikoo.com
   ```

2. **Test Your Domain:**
   - Visit `https://kiwikoo.com`
   - Visit `https://www.kiwikoo.com`
   - Both should work and redirect properly

3. **Verify SSL:**
   - Vercel automatically provides SSL certificates
   - Check that the padlock icon appears in your browser

---

## Quick Reference

**Vercel Nameservers:**
- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

**Vercel Dashboard:**
- Settings → Domains → kiwikoo.com

**GoDaddy:**
- My Products → Domains → kiwikoo.com → DNS → Nameservers
