-- ============================================================================
-- PROFILE AUTO-CREATION TRIGGER
-- ============================================================================
-- This trigger automatically creates a profile in public.profiles when a new
-- user is created in auth.users. This solves the foreign key timing issue.
--
-- RUN THIS IN SUPABASE SQL EDITOR (Dashboard → SQL → New Query)
-- ============================================================================

-- 1. Create the function that will be called by the trigger
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

-- 2. Drop existing trigger if it exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;

-- ============================================================================
-- VERIFICATION: After running, test by creating a new user
-- The profile should be automatically created with:
-- - id: matches auth.users.id
-- - email: from auth signup
-- - role: from user_metadata (defaults to 'influencer')
-- - onboarding_completed: false
-- - approval_status: 'none' for influencer, 'approved' for brand
-- ============================================================================
