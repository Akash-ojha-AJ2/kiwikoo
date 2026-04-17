-- =====================================================
-- BRAND CAMPAIGN SYSTEM
-- Run in Supabase SQL Editor. Extends campaigns, products;
-- adds campaign_audience, campaign_creatives.
-- =====================================================

-- 1. Extend campaigns with goal, budget type, analytics placeholders
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS goal VARCHAR(50),
  ADD COLUMN IF NOT EXISTS budget_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS daily_budget DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS total_budget DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS impressions BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conversions BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spend DECIMAL(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ctr DECIMAL(5, 4);

COMMENT ON COLUMN public.campaigns.goal IS 'sales | awareness | launch | traffic';
COMMENT ON COLUMN public.campaigns.budget_type IS 'daily | lifetime';

-- 2. Extend products with discount, stock, sku, try_on_compatible
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS discount DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS stock INT,
  ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
  ADD COLUMN IF NOT EXISTS tryon_image TEXT,
  ADD COLUMN IF NOT EXISTS try_on_compatible BOOLEAN DEFAULT false;

-- 3. Campaign audience (one row per campaign)
CREATE TABLE IF NOT EXISTS public.campaign_audience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  age_min INT,
  age_max INT,
  gender VARCHAR(50),
  location TEXT,
  interests JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_audience_campaign ON public.campaign_audience(campaign_id);

ALTER TABLE public.campaign_audience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands can manage audience of own campaigns" ON public.campaign_audience
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id AND c.brand_id = auth.uid()
    )
  );

-- 4. Campaign creatives (headline, description, CTA, assets)
CREATE TABLE IF NOT EXISTS public.campaign_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  headline VARCHAR(255),
  description TEXT,
  cta_text VARCHAR(100),
  creative_assets JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_creatives_campaign ON public.campaign_creatives(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_creatives_product ON public.campaign_creatives(product_id);

ALTER TABLE public.campaign_creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands can manage creatives of own campaigns" ON public.campaign_creatives
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id AND c.brand_id = auth.uid()
    )
  );
