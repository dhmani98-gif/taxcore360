-- Migration: Add Lemon Squeezy webhook support tables and functions
-- Date: 2025-01-02

-- Add subscription_tier column to users table if not exists
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'Pay Per Form';

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
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

-- Create subscription_orders table for tracking Pay Per Form orders
CREATE TABLE IF NOT EXISTS public.subscription_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  order_id VARCHAR(255) NOT NULL,
  product_name VARCHAR(255),
  variant_name VARCHAR(255),
  tier VARCHAR(50),
  status VARCHAR(50),
  total DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
  -- Update or insert subscription record
  INSERT INTO public.subscriptions (user_id, form_credits, tier)
  VALUES (p_user_id, p_credits, 'Pay Per Form')
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    form_credits = public.subscriptions.form_credits + p_credits,
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
  -- Get current subscription info
  SELECT tier, employees_used INTO v_tier, v_current_employees
  FROM public.subscriptions
  WHERE user_id = p_user_id;

  -- Set max based on tier
  v_max_employees := CASE v_tier
    WHEN 'Pay Per Form' THEN 5
    WHEN 'Professional' THEN 50
    WHEN 'Enterprise' THEN 999999
    ELSE 5
  END;

  -- Check if can add
  IF v_current_employees >= v_max_employees THEN
    RETURN FALSE;
  END IF;

  -- Increment count
  UPDATE public.subscriptions
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
  -- Get current subscription info
  SELECT tier, vendors_used INTO v_tier, v_current_vendors
  FROM public.subscriptions
  WHERE user_id = p_user_id;

  -- Set max based on tier
  v_max_vendors := CASE v_tier
    WHEN 'Pay Per Form' THEN 3
    WHEN 'Professional' THEN 25
    WHEN 'Enterprise' THEN 999999
    ELSE 3
  END;

  -- Check if can add
  IF v_current_vendors >= v_max_vendors THEN
    RETURN FALSE;
  END IF;

  -- Increment count
  UPDATE public.subscriptions
  SET vendors_used = vendors_used + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id ON public.subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_lemon_id ON public.subscriptions(lemon_squeezy_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_user_id ON public.subscription_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_order_id ON public.subscription_orders(order_id);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own orders"
  ON public.subscription_orders
  FOR SELECT
  USING (user_id = auth.uid());

-- Service role can manage all (for webhook)
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage orders"
  ON public.subscription_orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.subscriptions TO service_role;
GRANT ALL ON public.subscription_orders TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;
