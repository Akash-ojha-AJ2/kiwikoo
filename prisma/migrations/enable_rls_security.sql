-- Enable Row Level Security (RLS) on tables that need protection
-- OPTIMIZED VERSION - Fixes performance warnings
-- This migration enables RLS and creates policies for UserProfileImage, IdentityImage, TrackedLink, and LinkClick
-- 
-- Performance optimizations:
-- 1. Uses (select auth.jwt()) instead of auth.jwt() to avoid per-row re-evaluation
-- 2. Combines multiple permissive policies into single policies using OR logic
-- 
-- Note: These policies protect against direct PostgREST API access.
-- The Next.js API routes use Prisma with service role credentials, which bypass RLS.
-- However, enabling RLS prevents unauthorized access via Supabase's PostgREST API.

-- ============================================
-- 1. UserProfileImage
-- ============================================
ALTER TABLE "UserProfileImage" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Users can view own profile images" ON "UserProfileImage";
DROP POLICY IF EXISTS "Users can insert own profile images" ON "UserProfileImage";
DROP POLICY IF EXISTS "Users can update own profile images" ON "UserProfileImage";
DROP POLICY IF EXISTS "Users can delete own profile images" ON "UserProfileImage";

-- Policy: Users can only view their own profile images (optimized with subquery)
CREATE POLICY "Users can view own profile images"
  ON "UserProfileImage"
  FOR SELECT
  USING (
    "userId" IN (
      SELECT id FROM "User" 
      WHERE LOWER(TRIM(email)) = LOWER(TRIM(((select auth.jwt()) ->> 'email')))
    )
  );

-- Policy: Users can insert their own profile images (optimized)
CREATE POLICY "Users can insert own profile images"
  ON "UserProfileImage"
  FOR INSERT
  WITH CHECK (
    "userId" IN (
      SELECT id FROM "User" 
      WHERE LOWER(TRIM(email)) = LOWER(TRIM(((select auth.jwt()) ->> 'email')))
    )
  );

-- Policy: Users can update their own profile images (optimized)
CREATE POLICY "Users can update own profile images"
  ON "UserProfileImage"
  FOR UPDATE
  USING (
    "userId" IN (
      SELECT id FROM "User" 
      WHERE LOWER(TRIM(email)) = LOWER(TRIM(((select auth.jwt()) ->> 'email')))
    )
  );

-- Policy: Users can delete their own profile images (optimized)
CREATE POLICY "Users can delete own profile images"
  ON "UserProfileImage"
  FOR DELETE
  USING (
    "userId" IN (
      SELECT id FROM "User" 
      WHERE LOWER(TRIM(email)) = LOWER(TRIM(((select auth.jwt()) ->> 'email')))
    )
  );

-- ============================================
-- 2. IdentityImage
-- ============================================
ALTER TABLE "IdentityImage" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Influencers can view own identity images" ON "IdentityImage";
DROP POLICY IF EXISTS "Influencers can insert own identity images" ON "IdentityImage";
DROP POLICY IF EXISTS "Influencers can update own identity images" ON "IdentityImage";
DROP POLICY IF EXISTS "Influencers can delete own identity images" ON "IdentityImage";

-- Policy: Influencers can view their own identity images (optimized)
CREATE POLICY "Influencers can view own identity images"
  ON "IdentityImage"
  FOR SELECT
  USING (
    "influencerProfileId" IN (
      SELECT id FROM "InfluencerProfile"
      WHERE "userId" IN (
        SELECT id FROM "User" 
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(((select auth.jwt()) ->> 'email')))
      )
    )
  );

-- Policy: Influencers can insert their own identity images (optimized)
CREATE POLICY "Influencers can insert own identity images"
  ON "IdentityImage"
  FOR INSERT
  WITH CHECK (
    "influencerProfileId" IN (
      SELECT id FROM "InfluencerProfile"
      WHERE "userId" IN (
        SELECT id FROM "User" 
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(((select auth.jwt()) ->> 'email')))
      )
    )
  );

-- Policy: Influencers can update their own identity images (optimized)
CREATE POLICY "Influencers can update own identity images"
  ON "IdentityImage"
  FOR UPDATE
  USING (
    "influencerProfileId" IN (
      SELECT id FROM "InfluencerProfile"
      WHERE "userId" IN (
        SELECT id FROM "User" 
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(((select auth.jwt()) ->> 'email')))
      )
    )
  );

-- Policy: Influencers can delete their own identity images (optimized)
CREATE POLICY "Influencers can delete own identity images"
  ON "IdentityImage"
  FOR DELETE
  USING (
    "influencerProfileId" IN (
      SELECT id FROM "InfluencerProfile"
      WHERE "userId" IN (
        SELECT id FROM "User" 
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(((select auth.jwt()) ->> 'email')))
      )
    )
  );

-- ============================================
-- 3. TrackedLink
-- ============================================
ALTER TABLE "TrackedLink" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Influencers can view own tracked links" ON "TrackedLink";
DROP POLICY IF EXISTS "Public can read active tracked links by code" ON "TrackedLink";
DROP POLICY IF EXISTS "TrackedLink select policy" ON "TrackedLink";
DROP POLICY IF EXISTS "Influencers can insert own tracked links" ON "TrackedLink";
DROP POLICY IF EXISTS "Influencers can update own tracked links" ON "TrackedLink";
DROP POLICY IF EXISTS "Influencers can delete own tracked links" ON "TrackedLink";

-- Combined SELECT policy: Influencers can view their own links OR public can read active links
-- This combines two policies into one to avoid multiple permissive policy warnings
CREATE POLICY "TrackedLink select policy"
  ON "TrackedLink"
  FOR SELECT
  USING (
    -- Influencers can view their own tracked links
    "influencerId" IN (
      SELECT id FROM "InfluencerProfile"
      WHERE "userId" IN (
        SELECT id FROM "User" 
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(((select auth.jwt()) ->> 'email')))
      )
    )
    OR
    -- Public can read active tracked links (for redirects)
    "isActive" = true
  );

-- Policy: Influencers can insert their own tracked links (optimized)
CREATE POLICY "Influencers can insert own tracked links"
  ON "TrackedLink"
  FOR INSERT
  WITH CHECK (
    "influencerId" IN (
      SELECT id FROM "InfluencerProfile"
      WHERE "userId" IN (
        SELECT id FROM "User" 
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(((select auth.jwt()) ->> 'email')))
      )
    )
  );

-- Policy: Influencers can update their own tracked links (optimized)
CREATE POLICY "Influencers can update own tracked links"
  ON "TrackedLink"
  FOR UPDATE
  USING (
    "influencerId" IN (
      SELECT id FROM "InfluencerProfile"
      WHERE "userId" IN (
        SELECT id FROM "User" 
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(((select auth.jwt()) ->> 'email')))
      )
    )
  );

-- Policy: Influencers can delete their own tracked links (optimized)
CREATE POLICY "Influencers can delete own tracked links"
  ON "TrackedLink"
  FOR DELETE
  USING (
    "influencerId" IN (
      SELECT id FROM "InfluencerProfile"
      WHERE "userId" IN (
        SELECT id FROM "User" 
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(((select auth.jwt()) ->> 'email')))
      )
    )
  );

-- ============================================
-- 4. LinkClick
-- ============================================
ALTER TABLE "LinkClick" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Influencers can view own link clicks" ON "LinkClick";
DROP POLICY IF EXISTS "Public can insert link clicks" ON "LinkClick";

-- Policy: Influencers can view clicks for their own tracked links (optimized)
CREATE POLICY "Influencers can view own link clicks"
  ON "LinkClick"
  FOR SELECT
  USING (
    "trackedLinkId" IN (
      SELECT id FROM "TrackedLink"
      WHERE "influencerId" IN (
        SELECT id FROM "InfluencerProfile"
        WHERE "userId" IN (
          SELECT id FROM "User" 
          WHERE LOWER(TRIM(email)) = LOWER(TRIM(((select auth.jwt()) ->> 'email')))
        )
      )
    )
  );

-- Policy: Public can insert link clicks (for tracking)
-- This allows the redirect functionality to record clicks via PostgREST API
-- Note: The Next.js API routes use Prisma/service role which bypasses RLS,
-- but this policy allows public PostgREST access if needed
CREATE POLICY "Public can insert link clicks"
  ON "LinkClick"
  FOR INSERT
  WITH CHECK (true);

-- Note: No UPDATE or DELETE policies for LinkClick
-- Click records should be immutable - only service role (via Prisma) can modify them

