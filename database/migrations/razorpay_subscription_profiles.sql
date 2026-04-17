ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_provider TEXT,
ADD COLUMN IF NOT EXISTS subscription_role TEXT,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_plan_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_data JSONB DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_razorpay_customer_id
  ON public.profiles(razorpay_customer_id)
  WHERE razorpay_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_razorpay_subscription_id
  ON public.profiles(razorpay_subscription_id)
  WHERE razorpay_subscription_id IS NOT NULL;
