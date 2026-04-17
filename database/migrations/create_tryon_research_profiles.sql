-- Admin-configurable per-preset web research profiles for try-on generation.
CREATE TABLE IF NOT EXISTS public.tryon_research_profiles (
  preset_id text PRIMARY KEY,
  mode text NOT NULL DEFAULT 'balanced' CHECK (mode IN ('off', 'low', 'balanced', 'deep')),
  timeout_ms integer NOT NULL DEFAULT 1800 CHECK (timeout_ms >= 600 AND timeout_ms <= 8000),
  max_snippets integer NOT NULL DEFAULT 3 CHECK (max_snippets >= 1 AND max_snippets <= 8),
  max_context_chars integer NOT NULL DEFAULT 760 CHECK (max_context_chars >= 180 AND max_context_chars <= 2000),
  focus_terms jsonb NOT NULL DEFAULT '[]'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  updated_by uuid NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tryon_research_profiles_enabled
  ON public.tryon_research_profiles (enabled);
