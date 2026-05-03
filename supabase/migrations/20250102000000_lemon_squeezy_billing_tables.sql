-- Migration: Add Lemon Squeezy billing tables (compatible with existing schema)
-- Date: 2025-01-02
-- Uses public.profiles (not public.users) and new table names to avoid conflicts

-- Add subscription_tier column to profiles table if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'Pay Per Form';

-- Create lemon_subscriptions table (new name to avoid conflict with existing subscriptions table)
CREATE TABLE IF NOT EXISTS public.lemon_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
  tier VARCHAR(50) NOT NULL DEFAULT 'Pay Per Form',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  lemon_squeezy_subscription_id VARCHAR(255),
  lemon_squeezy_customer_id VARCHAR(255),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  employees_used INTEGER DEFAULT 0,
  vendors_used INTEGER DEFAULT 0,
  form_credits INTEGER DEFAULT 0,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lemon_orders table for tracking Pay Per Form orders (new name to avoid conflict)
CREATE TABLE IF NOT EXISTS public.lemon_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
  order_id VARCHAR(255) NOT NULL,
  product_name VARCHAR(255),
  variant_name VARCHAR(255),
  tier VARCHAR(50),
  status VARCHAR(50),
  total DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint on user_id for upsert operations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lemon_subscriptions_user_id_key'
  ) THEN
    ALTER TABLE public.lemon_subscriptions ADD CONSTRAINT lemon_subscriptions_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Create function to add form credits
CREATE OR REPLACE FUNCTION public.add_form_credits(
  p_user_id UUID,
  p_credits INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.lemon_subscriptions (user_id, form_credits, tier)
  VALUES (p_user_id, p_credits, 'Pay Per Form')
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    form_credits = public.lemon_subscriptions.form_credits + p_credits,
    updated_at = NOW();
END;
$$;

-- Create function to increment employee count
CREATE OR REPLACE FUNCTION public.increment_employee_count(
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_employees INTEGER;
  v_current_employees INTEGER;
  v_tier VARCHAR(50);
BEGIN
  SELECT tier, employees_used INTO v_tier, v_current_employees
  FROM public.lemon_subscriptions
  WHERE user_id = p_user_id;

  v_max_employees := CASE v_tier
    WHEN 'Pay Per Form' THEN 5
    WHEN 'Professional' THEN 50
    WHEN 'Enterprise' THEN 999999
    ELSE 5
  END;

  IF v_current_employees >= v_max_employees THEN
    RETURN FALSE;
  END IF;

  UPDATE public.lemon_subscriptions
  SET employees_used = employees_used + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$;

-- Create function to increment vendor count
CREATE OR REPLACE FUNCTION public.increment_vendor_count(
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_vendors INTEGER;
  v_current_vendors INTEGER;
  v_tier VARCHAR(50);
BEGIN
  SELECT tier, vendors_used INTO v_tier, v_current_vendors
  FROM public.lemon_subscriptions
  WHERE user_id = p_user_id;

  v_max_vendors := CASE v_tier
    WHEN 'Pay Per Form' THEN 3
    WHEN 'Professional' THEN 25
    WHEN 'Enterprise' THEN 999999
    ELSE 3
  END;

  IF v_current_vendors >= v_max_vendors THEN
    RETURN FALSE;
  END IF;

  UPDATE public.lemon_subscriptions
  SET vendors_used = vendors_used + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lemon_subscriptions_user_id ON public.lemon_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_lemon_subscriptions_company_id ON public.lemon_subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_lemon_subscriptions_lemon_id ON public.lemon_subscriptions(lemon_squeezy_subscription_id);
CREATE INDEX IF NOT EXISTS idx_lemon_orders_user_id ON public.lemon_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_lemon_orders_company_id ON public.lemon_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_lemon_orders_order_id ON public.lemon_orders(order_id);

-- Enable RLS
ALTER TABLE public.lemon_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lemon_orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own lemon_subscription" ON public.lemon_subscriptions;
DROP POLICY IF EXISTS "Users can view own lemon_orders" ON public.lemon_orders;
DROP POLICY IF EXISTS "Users can view company lemon_subscriptions" ON public.lemon_subscriptions;
DROP POLICY IF EXISTS "Users can view company lemon_orders" ON public.lemon_orders;
DROP POLICY IF EXISTS "Service role can manage lemon_subscriptions" ON public.lemon_subscriptions;
DROP POLICY IF EXISTS "Service role can manage lemon_orders" ON public.lemon_orders;

-- Create RLS policies
CREATE POLICY "Users can view own lemon_subscription"
  ON public.lemon_subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own lemon_orders"
  ON public.lemon_orders
  FOR SELECT
  USING (user_id = auth.uid());

-- Company-based access policies
CREATE POLICY "Users can view company lemon_subscriptions"
  ON public.lemon_subscriptions
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view company lemon_orders"
  ON public.lemon_orders
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Service role can manage all (for webhook)
CREATE POLICY "Service role can manage lemon_subscriptions"
  ON public.lemon_subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage lemon_orders"
  ON public.lemon_orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.lemon_subscriptions TO service_role;
GRANT ALL ON public.lemon_orders TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;
