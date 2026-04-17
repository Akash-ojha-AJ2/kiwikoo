# Email Authentication Setup Fix

## 🐛 Issues Fixed

### Problems Identified
1. **Redirect URLs not properly configured** - Email links may not work
2. **Missing site URL configuration** - Using localhost in production
3. **Email confirmation not working** - Users not receiving emails
4. **Password reset emails not sending** - Forgot password flow broken

## ✅ Fixes Applied

### 1. Improved Email Redirect URL Building

**Fixed in:**
- `src/app/(auth)/register/page.tsx`
- `src/app/forgot-password/page.tsx`
- `src/app/api/auth/resend-confirmation/route.ts`

**Changes:**
- Added proper site URL detection
- Added logging for debugging
- Improved error handling
- Better fallback URLs

### 2. Enhanced Resend Confirmation

**Fixed in:** `src/app/api/auth/resend-confirmation/route.ts`

**Changes:**
- Changed from `magiclink` to `signup` type (more reliable)
- Added fallback methods if primary fails
- Better error messages
- Proper redirect URL configuration

### 3. Added Test Endpoint

**New file:** `src/app/api/auth/test-email/route.ts`

**Purpose:** Test email configuration and sending

**Usage:**
```bash
POST /api/auth/test-email
Body: { "email": "test@example.com" }
```

## 🔧 Required Supabase Configuration

### 1. Email Settings

Go to **Supabase Dashboard** → **Authentication** → **Settings** → **Email Auth**:

1. **Enable Email Auth**: ✅ Enabled
2. **Enable Email Confirmations**: 
   - ✅ For production (recommended)
   - ❌ For development (can disable for faster testing)
3. **SMTP Settings** (if using custom SMTP):
   - Configure your SMTP provider
   - Or use Supabase's default email service

### 2. Redirect URLs

Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**:

**Add these redirect URLs:**

For Development:
```
http://localhost:3000/auth/confirm
http://localhost:3001/auth/confirm
```

For Production:
```
https://yourdomain.com/auth/confirm
https://yourdomain.vercel.app/auth/confirm
```

**Wildcard pattern** (recommended):
```
https://*.vercel.app/auth/confirm
```

### 3. Email Templates (Optional)

Go to **Supabase Dashboard** → **Authentication** → **Email Templates**:

You can customize:
- **Confirm signup** - Email confirmation template
- **Reset password** - Password reset template
- **Magic Link** - Magic link template

**Default templates work fine**, but you can customize branding.

## 📋 Environment Variables

Make sure these are set:

```env
# Required for email redirects
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Or for Vercel (auto-detected)
NEXT_PUBLIC_VERCEL_URL=your-app.vercel.app

# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🧪 Testing Email Functionality

### Test Email Sending

```bash
# Test email configuration
curl -X POST http://localhost:3000/api/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

### Test Registration Flow

1. Register a new user
2. Check email inbox (and spam folder)
3. Click confirmation link
4. Should redirect to `/login?confirmed=true`

### Test Password Reset

1. Go to `/forgot-password`
2. Enter email
3. Check email inbox
4. Click reset link
5. Should redirect to `/reset-password`

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check Supabase Email Settings:**
   - Go to Authentication → Settings → Email Auth
   - Verify email confirmations are enabled
   - Check SMTP configuration if using custom SMTP

2. **Check Redirect URLs:**
   - Verify URLs are added in Supabase dashboard
   - Check that URLs match your domain exactly

3. **Check Environment Variables:**
   - Verify `NEXT_PUBLIC_SITE_URL` is set correctly
   - Check Supabase URL and keys are correct

4. **Check Email Provider:**
   - Supabase free tier has email limits
   - Check Supabase dashboard for email delivery status
   - Verify email isn't in spam folder

### Redirect URLs Not Working

1. **Verify URL format:**
   - Must be exact match in Supabase settings
   - Include protocol (https://)
   - No trailing slashes

2. **Check Wildcard Patterns:**
   - Use `https://*.vercel.app/auth/confirm` for Vercel
   - Or add each domain individually

3. **Test in Browser:**
   - Click email link
   - Check browser console for errors
   - Verify redirect URL in email matches Supabase settings

### Email Confirmation Not Working

1. **Check User Status:**
   - Use `/api/auth/diagnose` endpoint
   - Check if `emailConfirmed` is false

2. **Resend Confirmation:**
   - Use `/api/auth/resend-confirmation` endpoint
   - Or use Supabase dashboard to resend

3. **Check Email Template:**
   - Verify email template includes correct redirect URL
   - Check email is not being blocked

## ✅ Verification Checklist

- [ ] Supabase email confirmations enabled
- [ ] Redirect URLs added to Supabase
- [ ] `NEXT_PUBLIC_SITE_URL` set in environment
- [ ] Test registration email received
- [ ] Test password reset email received
- [ ] Email links redirect correctly
- [ ] Users can confirm email and login

## 📝 Next Steps

1. **Configure Supabase:**
   - Add redirect URLs
   - Enable email confirmations
   - Configure SMTP (optional)

2. **Set Environment Variables:**
   - Add `NEXT_PUBLIC_SITE_URL` to production
   - Verify all Supabase keys are correct

3. **Test:**
   - Register a test user
   - Verify email received
   - Test confirmation flow
   - Test password reset

---

**Status**: ✅ Fixed
**Last Updated**: After email authentication fixes
