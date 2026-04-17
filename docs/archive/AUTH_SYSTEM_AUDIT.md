# Authentication System Audit & Fix Plan

## 📋 DISCOVERY PHASE - Current State

### Auth Components Found

#### 1. Signup/Registration
- **Frontend**: `src/app/(auth)/register/page.tsx`
  - Flow: User selects role → enters email/password/name → calls Supabase `signUp()` → calls `/api/auth/register`
  - Creates Supabase Auth user (email not confirmed initially)
  - Creates Prisma user via API
  - Creates `influencer_applications` entry if INFLUENCER
  
- **Backend**: `src/app/api/auth/register/route.ts`
  - Creates Prisma user with profile
  - Creates influencer application if INFLUENCER

#### 2. Login
- **Frontend**: `src/app/(auth)/login/page.tsx`
  - Calls `/api/auth/login`
  
- **Backend**: `src/app/api/auth/login/route.ts`
  - Checks email confirmation status
  - Returns user or `requiresProfile: true`
  - Handles admin users

#### 3. Email Verification
- **Confirmation Route**: `src/app/auth/confirm/route.ts`
  - Handles `token_hash` and `type` from email link
  - Verifies OTP via Supabase
  - Signs out after signup confirmation (prevents loops)
  - Redirects to `/login?confirmed=true`

- **Resend**: `src/app/api/auth/resend-confirmation/route.ts`
  - Uses `generateLink` with signup type

#### 4. Password Reset
- **Request**: `src/app/forgot-password/page.tsx`
  - Calls `supabase.auth.resetPasswordForEmail()`
  
- **Reset**: `src/app/reset-password/page.tsx` + `src/app/api/auth/reset-password/route.ts`
  - Verifies token
  - Updates password

#### 5. Profile Completion
- **Page**: `src/app/complete-profile/page.tsx`
  - For users who exist in Supabase but not Prisma
  
- **API**: `src/app/api/auth/complete-profile/route.ts`
  - Creates Prisma user
  - Creates influencer application if INFLUENCER

#### 6. Onboarding
- **Influencer**: `src/app/onboarding/influencer/page.tsx` + `src/app/api/onboarding/influencer/route.ts`
  - Sets `onboardingCompleted: true` when all fields filled
  
- **Brand**: `src/app/onboarding/brand/page.tsx` + `src/app/api/onboarding/brand/route.ts`
  - Sets `onboardingCompleted: true` when all fields filled

#### 7. Admin Approval
- **Table**: `influencer_applications` in Supabase
  - Fields: `user_id`, `email`, `full_name`, `status` ('pending' | 'approved' | 'rejected')
  
- **Admin API**: `src/app/api/admin/influencers/route.ts`
  - GET: Lists all applications
  - PATCH: Updates status, sends email
  
- **Pending Page**: `src/app/influencer/pending/page.tsx`
  - Shows status, redirects to dashboard if approved

#### 8. Middleware
- **File**: `src/lib/middleware.ts`
  - Updates Supabase session
  - Approval gate for influencers (redirects to `/influencer/pending`)
  - Redirects authenticated users away from homepage

#### 9. Dashboard Routing
- **File**: `src/app/dashboard/page.tsx`
  - Checks: Admin → admin dashboard
  - Checks: User exists? → complete-profile
  - Checks: Onboarding? → onboarding page
  - Checks: Approval? → pending page
  - Redirects to role-specific dashboard

### State Model Mapping

| Intended Field | Actual Implementation | Location |
|---------------|----------------------|----------|
| `emailVerified` | `email_confirmed_at` (Supabase) | Supabase Auth |
| `onboardingCompleted` | `onboardingCompleted` (Prisma) | InfluencerProfile / BrandProfile |
| `approvalStatus` | `status` in `influencer_applications` | Supabase table |
| `role` | `role` enum (Prisma) | User model |

## 🔍 ISSUES IDENTIFIED

### 1. Registration Flow Gaps
- ❌ If Supabase signup succeeds but `/api/auth/register` fails, user stuck
- ❌ No check if user already exists in Supabase but not Prisma
- ✅ Handled: Shows warning and redirects to login

### 2. Email Verification Flow
- ⚠️ Login checks email confirmation but doesn't enforce consistently
- ⚠️ Dashboard doesn't check email verification before onboarding
- ✅ Email confirmation route works correctly

### 3. Onboarding Flow
- ⚠️ Dashboard redirects to onboarding, but onboarding page also checks completion (potential loop)
- ✅ Onboarding completion logic works

### 4. Approval Flow
- ⚠️ Multiple places check approval (middleware, dashboard, client components)
- ⚠️ Inconsistent: Some use `maybeSingle()`, some use `single()`
- ✅ Approval email sending works

### 5. Redirect Logic
- ⚠️ Dashboard has complex redirect chain that could loop
- ⚠️ Middleware approval gate might conflict with dashboard checks
- ⚠️ Complete-profile redirects to dashboard, which might redirect back

### 6. Admin Flow
- ✅ Admin signup via `/api/admin/grant` works
- ✅ Admin users bypass Prisma checks
- ⚠️ Admin email auto-confirmed but should still verify

## 🔧 FIXES NEEDED

### Priority 1: Fix Redirect Logic
1. Ensure dashboard checks are in correct order
2. Prevent redirect loops
3. Make redirects idempotent

### Priority 2: Email Verification Enforcement
1. Add email verification check in dashboard
2. Ensure login properly handles unverified users
3. Fix resend confirmation to work reliably

### Priority 3: Approval Flow Consistency
1. Standardize approval checks
2. Ensure approval email sends correctly
3. Fix pending page redirect logic

### Priority 4: Complete Flow Integration
1. Test end-to-end: signup → verify → login → onboarding → approval
2. Fix any dead ends
3. Add proper error handling
