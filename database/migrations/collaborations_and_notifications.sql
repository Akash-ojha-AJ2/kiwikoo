-- Collaboration Requests Table
CREATE TABLE IF NOT EXISTS public.collaboration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  
  message TEXT,
  proposal_details JSONB DEFAULT '{}', -- budget, timeline, goals, notes
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
not able 
-- Indexes
CREATE INDEX IF NOT EXISTS idx_collab_brand ON public.collaboration_requests(brand_id);
CREATE INDEX IF NOT EXISTS idx_collab_influencer ON public.collaboration_requests(influencer_id);
CREATE INDEX IF NOT EXISTS idx_collab_status ON public.collaboration_requests(status);

-- RLS
ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON public.collaboration_requests
  FOR SELECT USING (auth.uid() = brand_id OR auth.uid() = influencer_id);

CREATE POLICY "Users can create requests" ON public.collaboration_requests
  FOR INSERT WITH CHECK (auth.uid() = brand_id OR auth.uid() = influencer_id);

CREATE POLICY "Users can update own requests" ON public.collaboration_requests
  FOR UPDATE USING (auth.uid() = brand_id OR auth.uid() = influencer_id);

-- Notifications Table (Simple version for now)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- collab_request, collab_accepted, etc
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true); -- Service role bypasses RLS anyway, but good for clarity
