# 🚀 Deploy to Production - Quick Guide

## ✅ Current Status

- ✅ All code committed to GitHub
- ✅ All fixes applied
- ✅ Build successful
- ✅ Ready for deployment

## 🚀 Deployment Options

### Option 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Sign in with your account

2. **Import/Deploy Project:**
   - Click "Add New Project"
   - Select your repository: `DridhaTeamHQ/Tria-pilot`
   - Configure:
     - **Framework Preset**: Next.js (auto-detected)
     - **Build Command**: `next build`
     - **Output Directory**: `.next` (default)
     - **Install Command**: `npm install`

3. **Add Environment Variables:**
   Add all required variables from your `.env.local`:
   ```
   DATABASE_URL=postgresql://...
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   OPENAI_API_KEY=...
   GEMINI_API_KEY=...
   ADMIN_SIGNUP_CODE=...
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live!

### Option 2: Vercel CLI

```bash
# 1. Login to Vercel
vercel login

# 2. Link project (if not already linked)
vercel link

# 3. Deploy to production
vercel --prod
```

### Option 3: GitHub Auto-Deploy

If your repo is already connected to Vercel:
- ✅ Push to `main` branch triggers auto-deployment
- ✅ Check deployment status at: https://vercel.com/dashboard

## 📋 Pre-Deployment Checklist

- [x] Code pushed to GitHub
- [x] Build tested locally (`npm run build` - ✅ Success)
- [x] All TypeScript errors fixed
- [x] All routes verified
- [ ] Environment variables set in Vercel
- [ ] Database connection verified
- [ ] Supabase project configured
- [ ] Domain configured (if using custom domain)

## 🔧 Required Environment Variables

Make sure these are set in Vercel:

### Database
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true
```

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
```

### AI Services
```
OPENAI_API_KEY=[YOUR_OPENAI_API_KEY]
GEMINI_API_KEY=[YOUR_GEMINI_API_KEY]
GEMINI_MODEL_VERSION=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

### Admin
```
ADMIN_SIGNUP_CODE=[YOUR_SECURE_ADMIN_CODE]
```

### Optional
```
NEXT_PUBLIC_SITE_URL=https://[YOUR_VERCEL_DOMAIN].vercel.app
SUPPORT_EMAIL=team@dridhatechnologies.com
MAX_TRYON_PER_MINUTE=2
MAX_TRYON_PER_HOUR=10
MAX_TRYON_PER_HOUR_PER_IP=15
```

## ✅ Post-Deployment Verification

After deployment, verify:

1. **Homepage loads**: `https://[your-domain].vercel.app`
2. **Login works**: `/login`
3. **Registration works**: `/register`
4. **Dashboard redirects**: `/dashboard`
5. **API routes respond**: `/api/auth/me`
6. **Onboarding works**: `/onboarding/influencer`
7. **Try-on works**: `/influencer/try-on`

## 🐛 Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify `DATABASE_URL` uses session mode (pgbouncer=true)
- Check Vercel build logs for specific errors

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure Supabase allows connections from Vercel IPs
- Check if database is paused (Supabase free tier)

### Authentication Issues
- Verify all Supabase environment variables are set
- Check Supabase Auth settings (email confirmation, redirect URLs)
- Ensure redirect URLs include your Vercel domain

## 📊 Recent Fixes Deployed

✅ Authentication system fixes
✅ Onboarding loop fixes
✅ Error handling improvements
✅ Auth data cleanup tools
✅ All validation errors fixed
✅ All routes verified

---

**Status**: ✅ Ready for Production
**Last Commit**: `8597b75` - Add auth data cleanup tools for fresh start
