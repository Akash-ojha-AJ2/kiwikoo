-- ============================================================================
-- PROFILES TABLE DIAGNOSTIC & FIX SCRIPT
-- ============================================================================
-- Run this in Supabase SQL Editor (Dashboard → SQL → New Query)
-- 
-- This script will:
-- 1. Show the current profiles table structure
-- 2. Show all existing profiles with their values
-- 3. Fix any data issues (uppercase → lowercase conversion)
-- 4. Ensure the auto-creation trigger exists
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1: DIAGNOSTIC - Check table structure
-- ═══════════════════════════════════════════════════════════════════════════

-- Show column types and constraints
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2: DIAGNOSTIC - Check existing data
-- ═══════════════════════════════════════════════════════════════════════════

-- Show all profiles (look for invalid values)
SELECT 
    id, 
    email, 
    role, 
    onboarding_completed, 
    approval_status,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 20;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3: FIX DATA - Normalize role and approval_status to lowercase
-- ═══════════════════════════════════════════════════════════════════════════

-- Fix uppercase roles → lowercase
UPDATE public.profiles
SET role = LOWER(role)
WHERE role != LOWER(role);

-- Fix uppercase approval_status → lowercase
UPDATE public.profiles
SET approval_status = LOWER(approval_status)
WHERE approval_status IS NOT NULL 
AND approval_status != LOWER(approval_status);

-- Fix 'PENDING' → 'pending', 'APPROVED' → 'approved', etc.
UPDATE public.profiles
SET approval_status = 
    CASE approval_status
        WHEN 'PENDING' THEN 'pending'
        WHEN 'APPROVED' THEN 'approved'
        WHEN 'REJECTED' THEN 'rejected'
        WHEN 'NONE' THEN 'none'
        ELSE approval_status
    END
WHERE approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'NONE');

-- Fix NULL approval_status → 'none' for influencers, 'approved' for brands
UPDATE public.profiles
SET approval_status = 
    CASE role
        WHEN 'brand' THEN 'approved'
        WHEN 'BRAND' THEN 'approved'
        ELSE 'none'
    END
WHERE approval_status IS NULL;

-- Fix invalid roles (INFLUENCER → influencer, BRAND → brand)
UPDATE public.profiles
SET role = 
    CASE role
        WHEN 'INFLUENCER' THEN 'influencer'
        WHEN 'BRAND' THEN 'brand'
        WHEN 'ADMIN' THEN 'admin'
        ELSE role
    END
WHERE role IN ('INFLUENCER', 'BRAND', 'ADMIN');

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 4: VERIFY - Show fixed data
-- ═══════════════════════════════════════════════════════════════════════════

SELECT 
    id, 
    email, 
    role, 
    onboarding_completed, 
    approval_status,
    'Fixed' as status
FROM public.profiles
ORDER BY created_at DESC
LIMIT 20;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 5: ENSURE TRIGGER EXISTS (Profile auto-creation)
-- ═══════════════════════════════════════════════════════════════════════════

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, onboarding_completed, approval_status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'influencer')),
    false,
    CASE 
      WHEN LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'influencer')) = 'brand' THEN 'approved'
      ELSE 'none'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE! Check the output above.
-- 
-- Expected values after fix:
-- - role: 'influencer' | 'brand' | 'admin' (all lowercase)
-- - approval_status: 'none' | 'pending' | 'approved' | 'rejected' (all lowercase)
-- - onboarding_completed: true | false
-- ═══════════════════════════════════════════════════════════════════════════
