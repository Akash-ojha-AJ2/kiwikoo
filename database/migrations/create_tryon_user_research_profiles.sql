-- Influencer-owned per-preset research profile overrides.
CREATE TABLE IF NOT EXISTS public.tryon_user_research_profiles (
  user_id uuid NOT NULL,
  preset_id text NOT NULL,
  mode text NOT NULL DEFAULT 'balanced' CHECK (mode IN ('off', 'low', 'balanced', 'deep')),
  timeout_ms integer NOT NULL DEFAULT 1800 CHECK (timeout_ms >= 600 AND timeout_ms <= 8000),
  max_snippets integer NOT NULL DEFAULT 3 CHECK (max_snippets >= 1 AND max_snippets <= 8),
  max_context_chars integer NOT NULL DEFAULT 760 CHECK (max_context_chars >= 180 AND max_context_chars <= 2000),
  focus_terms jsonb NOT NULL DEFAULT '[]'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, preset_id)
);

CREATE INDEX IF NOT EXISTS idx_tryon_user_research_profiles_user_enabled
  ON public.tryon_user_research_profiles (user_id, enabled);
