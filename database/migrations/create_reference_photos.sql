CREATE TABLE IF NOT EXISTS public.reference_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_path text,
  source text NOT NULL CHECK (source IN ('app_upload', 'migrated_profile', 'migrated_identity')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  quality_score double precision,
  analysis jsonb,
  approved_for_tryon boolean NOT NULL DEFAULT false,
  rejection_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reference_photos_user_image_url
  ON public.reference_photos (user_id, image_url);

CREATE INDEX IF NOT EXISTS idx_reference_photos_user_active
  ON public.reference_photos (user_id, is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reference_photos_user_approved
  ON public.reference_photos (user_id, approved_for_tryon, status);
