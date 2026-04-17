-- =====================================================



-- BRAND MESSAGING SYSTEM TABLES
-- Run this in Supabase SQL Editor
-- =====================================================

-- Conversations table (brand <-> influencer)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  unread_brand INT DEFAULT 0,
  unread_influencer INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_id, influencer_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products table (for brands)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10, 2),
  link TEXT,
  tags TEXT[], -- Array of tags
  audience VARCHAR(50), -- Men, Women, Unisex, Kids
  cover_image TEXT,
  images TEXT[], -- Array of image URLs
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ad Creatives table
CREATE TABLE IF NOT EXISTS public.ad_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  campaign_id UUID,
  title VARCHAR(255),
  prompt TEXT,
  image_url TEXT NOT NULL,
  platform VARCHAR(50), -- instagram, facebook, tiktok, etc
  status VARCHAR(50) DEFAULT 'generated', -- generated, approved, rejected
  rating INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  brief TEXT,
  strategy JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft', -- draft, active, completed
  budget DECIMAL(10, 2),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_brand ON public.conversations(brand_id);
CREATE INDEX IF NOT EXISTS idx_conversations_influencer ON public.conversations(influencer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_brand ON public.ad_creatives(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand ON public.campaigns(brand_id);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = brand_id OR auth.uid() = influencer_id);

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = brand_id OR auth.uid() = influencer_id);

CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = brand_id OR auth.uid() = influencer_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = conversation_id 
      AND (c.brand_id = auth.uid() OR c.influencer_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for products (brands only)
CREATE POLICY "Brands can manage own products" ON public.products
  FOR ALL USING (auth.uid() = brand_id);

CREATE POLICY "Everyone can view active products" ON public.products
  FOR SELECT USING (active = true);

-- RLS Policies for ad_creatives
CREATE POLICY "Brands can manage own creatives" ON public.ad_creatives
  FOR ALL USING (auth.uid() = brand_id);

-- RLS Policies for campaigns
CREATE POLICY "Brands can manage own campaigns" ON public.campaigns
  FOR ALL USING (auth.uid() = brand_id);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- SELECT * FROM public.conversations LIMIT 5;
-- SELECT * FROM public.messages LIMIT 5;
-- SELECT * FROM public.products LIMIT 5;
-- SELECT * FROM public.campaigns LIMIT 5;
