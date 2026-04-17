# RLS Security Fix - Migration Instructions

This migration enables Row Level Security (RLS) on four critical tables that were previously exposed:
- `UserProfileImage`
- `IdentityImage`
- `TrackedLink`
- `LinkClick`

## Why This Is Important

Without RLS enabled, anyone with the Supabase anon key could potentially read/write to these tables directly via PostgREST API, exposing sensitive user data.

## How to Apply

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `enable_rls_security.sql`
4. Paste and execute the SQL

### Option 2: Via Supabase CLI

```bash
# Make sure you're logged in
supabase login

# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Apply the migration
supabase db push --file prisma/migrations/enable_rls_security.sql
```

### Option 3: Via Prisma (Manual SQL Execution)

If you're using Prisma migrations, you can execute this SQL directly in your database:

```bash
# Using psql or your database client
psql $DATABASE_URL -f prisma/migrations/enable_rls_security.sql
```

## What the Migration Does

1. **Enables RLS** on all four tables
2. **Creates SELECT policies** that allow:
   - Users to view their own profile images
   - Influencers to view their own identity images
   - Influencers to view their own tracked links and clicks
   - Public read access for active tracked links (needed for redirects)
   - Public read access for link clicks (for analytics)
3. **Creates INSERT/UPDATE/DELETE policies** that restrict:
   - Users can only modify their own profile images
   - Influencers can only modify their own identity images
   - Influencers can only modify their own tracked links
   - Public can insert link clicks (for tracking)
   - Click records cannot be updated/deleted by users (immutable)

## Important Notes

- The Next.js API routes use Prisma with service role credentials, which **bypass RLS**. This migration protects against direct PostgREST API access.
- The policies use email matching from the JWT token to identify users.
- After applying, test that:
  - Users can still access their own data
  - Link redirects still work (public access is enabled)
  - Click tracking still works (public insert is enabled)

## Verification

After applying, you can verify in Supabase Dashboard:
1. Go to **Database** → **Policies**
2. You should see RLS enabled (green checkmark) for all four tables
3. You should see multiple policies created for each table

## Rollback (if needed)

If you need to rollback:

```sql
-- Drop all policies
DROP POLICY IF EXISTS "Users can view own profile images" ON "UserProfileImage";
DROP POLICY IF EXISTS "Users can insert own profile images" ON "UserProfileImage";
DROP POLICY IF EXISTS "Users can update own profile images" ON "UserProfileImage";
DROP POLICY IF EXISTS "Users can delete own profile images" ON "UserProfileImage";

DROP POLICY IF EXISTS "Influencers can view own identity images" ON "IdentityImage";
DROP POLICY IF EXISTS "Influencers can insert own identity images" ON "IdentityImage";
DROP POLICY IF EXISTS "Influencers can update own identity images" ON "IdentityImage";
DROP POLICY IF EXISTS "Influencers can delete own identity images" ON "IdentityImage";

DROP POLICY IF EXISTS "Influencers can view own tracked links" ON "TrackedLink";
DROP POLICY IF EXISTS "Public can read active tracked links by code" ON "TrackedLink";
DROP POLICY IF EXISTS "Influencers can insert own tracked links" ON "TrackedLink";
DROP POLICY IF EXISTS "Influencers can update own tracked links" ON "TrackedLink";
DROP POLICY IF EXISTS "Influencers can delete own tracked links" ON "TrackedLink";

DROP POLICY IF EXISTS "Influencers can view own link clicks" ON "LinkClick";
DROP POLICY IF EXISTS "Public can insert link clicks" ON "LinkClick";

-- Disable RLS (NOT recommended - only for testing)
-- ALTER TABLE "UserProfileImage" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "IdentityImage" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "TrackedLink" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "LinkClick" DISABLE ROW LEVEL SECURITY;
```

