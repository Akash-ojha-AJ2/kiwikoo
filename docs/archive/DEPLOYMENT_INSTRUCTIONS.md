# 🚀 Production Deployment Instructions

## ✅ Pre-Deployment Checklist

- [x] Code pushed to GitHub
- [x] Build tested locally (`npm run build` - ✅ Success)
- [x] All TypeScript errors fixed
- [x] All routes verified

## 📋 Required Environment Variables

Set these in your Vercel project settings:

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

## 🚀 Deployment Steps

### Option 1: Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `DridhaTeamHQ/Tria-pilot`
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `prisma generate && next build` (already set)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install`
5. Add all environment variables (see above)
6. Click "Deploy"

### Option 2: Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## 🔍 Post-Deployment Verification

After deployment, verify:

1. **Homepage loads**: `https://[your-domain].vercel.app`
2. **Login works**: `/login`
3. **Registration works**: `/register`
4. **Dashboard redirects**: `/dashboard`
5. **API routes respond**: `/api/auth/me`

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

### API Errors
- Check API keys are valid (OpenAI, Gemini)
- Verify rate limits aren't exceeded
- Check Vercel function logs

## 📊 Monitoring

- **Vercel Dashboard**: Monitor deployments and function logs
- **Supabase Dashboard**: Monitor database and auth
- **Error Tracking**: Check Vercel logs for runtime errors

## ✅ Success Criteria

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ Homepage loads correctly
- ✅ Users can register and login
- ✅ Dashboard redirects work
- ✅ API endpoints respond correctly
- ✅ No console errors in browser

---

**Status**: Ready for Production Deployment
**Last Updated**: After successful build verification
