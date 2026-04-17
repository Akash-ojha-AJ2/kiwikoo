-- ============================================================================
-- ADD BRAND DATA COLUMN TO PROFILES
-- ============================================================================
-- Run this in Supabase SQL Editor (Dashboard → SQL → New Query)
-- This adds a JSONB column to store brand onboarding data
-- ============================================================================

-- Add brand_data column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS brand_data JSONB DEFAULT '{}'::jsonb;

-- Add influencer_data column for future use (optional)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS influencer_data JSONB DEFAULT '{}'::jsonb;

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('brand_data', 'influencer_data');

-- ============================================================================
-- DONE! The columns are now added.
-- Brand onboarding data will be stored in brand_data column.
-- ============================================================================
