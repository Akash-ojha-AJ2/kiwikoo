# TRIA Deployment Guide - Vercel + Supabase

## 🚀 Quick Deployment Steps

### Step 1: Prepare Your Repository
✅ Code is already pushed to: `DridhaTeam/Tria-Pilot`

### Step 2: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. **Click "Add New..." → "Project"**
4. **Import Repository**: Select `DridhaTeam/Tria-Pilot`
5. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npx prisma generate && npm run build`
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

### Step 3: Add Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

#### Database & Authentication (Supabase)
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true&connection_limit=1
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### AI Services
```
OPENAI_API_KEY=[YOUR_OPENAI_API_KEY]
GEMINI_API_KEY=[YOUR_GEMINI_API_KEY]
```

#### Optional
```
GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview
```

**Important**: 
- Use Supabase's **Connection Pooler URL** for `DATABASE_URL` (not direct connection)
- Add these for **Production**, **Preview**, and **Development** environments

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-5 minutes)
3. Your app will be live at: `your-project-name.vercel.app`

---

## 📋 Post-Deployment Checklist

- [ ] Test homepage loads
- [ ] Test login/register functionality
- [ ] Test database connections (create a product, favorite, etc.)
- [ ] Test API routes (try-on, ads, collaborations)
- [ ] Verify images load from Supabase Storage
- [ ] Check console for any errors

---

## 🔧 Troubleshooting

### Build Fails

**Error: Prisma Client not generated**
- **Solution**: Ensure build command includes `npx prisma generate && npm run build`

**Error: Environment variables missing**
- **Solution**: Double-check all environment variables are set in Vercel

### Database Connection Issues

**Error: Connection timeout**
- **Solution**: Use Supabase Connection Pooler URL (not direct connection)
- Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true&connection_limit=1`

**Error: Too many connections**
- **Solution**: Connection pooler handles this automatically

### API Routes Not Working

**Error: 500 Internal Server Error**
- **Solution**: Check Vercel Function Logs in dashboard
- Verify all API keys are correct
- Check Supabase service role key has proper permissions

### Images Not Loading

**Error: Images from Supabase Storage not showing**
- **Solution**: 
  1. Verify Supabase Storage buckets are public
  2. Check `next.config.ts` has correct remote patterns for Supabase
  3. Ensure image URLs are correct format

---

## 🌐 Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel automatically provisions SSL certificate

---

## 📊 Monitoring

### Vercel Analytics
- View deployment logs in Vercel Dashboard
- Monitor function execution times
- Check error rates

### Supabase Dashboard
- Monitor database connections
- Check API usage
- View storage usage

---

## 🔄 Continuous Deployment

Vercel automatically deploys on every push to `main` branch:
- **Production**: Deploys from `main` branch
- **Preview**: Deploys from pull requests and other branches

---

## 💰 Free Tier Limits

### Vercel Free Tier
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless functions (100 GB-hours/month)

### Supabase Free Tier
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 50,000 monthly active users
- ✅ 2 GB bandwidth

---

## 🚨 Important Notes

1. **Never commit `.env.local`** - All secrets should be in Vercel environment variables
2. **Use Connection Pooler** - Essential for serverless functions
3. **Monitor Usage** - Stay within free tier limits
4. **Backup Database** - Use Supabase dashboard to export data regularly

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## ✅ Deployment Complete!

Your TRIA app should now be live and accessible at your Vercel URL!

