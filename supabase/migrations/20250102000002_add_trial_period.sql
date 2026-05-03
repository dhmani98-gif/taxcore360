-- Migration: Add 14-day trial period support
-- Date: 2025-01-02

-- Add trial columns to lemon_subscriptions table
ALTER TABLE public.lemon_subscriptions 
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE;

-- Add trial columns to profiles table for quick access
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_trial_active BOOLEAN DEFAULT FALSE;

-- Create function to start trial for user
CREATE OR REPLACE FUNCTION public.start_user_trial(
  p_user_id UUID,
  p_tier VARCHAR DEFAULT 'Professional'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trial_ends TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate trial end date (14 days from now)
  v_trial_ends := NOW() + INTERVAL '14 days';
  
  -- Update profiles table
  UPDATE public.profiles
  SET 
    subscription_tier = p_tier,
    trial_ends_at = v_trial_ends,
    is_trial_active = TRUE,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Create subscription record
  INSERT INTO public.lemon_subscriptions (
    user_id,
    tier,
    status,
    is_trial,
    trial_started_at,
    trial_ends_at,
    current_period_start,
    current_period_end
  ) VALUES (
    p_user_id,
    p_tier,
    'trial',
    TRUE,
    NOW(),
    v_trial_ends,
    NOW(),
    v_trial_ends
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    tier = p_tier,
    status = 'trial',
    is_trial = TRUE,
    trial_started_at = NOW(),
    trial_ends_at = v_trial_ends,
    current_period_start = NOW(),
    current_period_end = v_trial_ends,
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$;

-- Create function to check if trial is still active
CREATE OR REPLACE FUNCTION public.is_trial_active(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trial_ends TIMESTAMP WITH TIME ZONE;
  v_is_trial BOOLEAN;
BEGIN
  SELECT trial_ends_at, is_trial 
  INTO v_trial_ends, v_is_trial
  FROM public.lemon_subscriptions
  WHERE user_id = p_user_id;
  
  -- Trial is active if it exists and hasn't expired
  IF v_is_trial AND v_trial_ends > NOW() THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Create function to convert trial to paid subscription
CREATE OR REPLACE FUNCTION public.convert_trial_to_paid(
  p_user_id UUID,
  p_lemon_subscription_id VARCHAR,
  p_lemon_customer_id VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update subscription record
  UPDATE public.lemon_subscriptions
  SET 
    status = 'active',
    is_trial = FALSE,
    lemon_squeezy_subscription_id = p_lemon_subscription_id,
    lemon_squeezy_customer_id = p_lemon_customer_id,
    trial_ends_at = NULL,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Update profiles
  UPDATE public.profiles
  SET 
    is_trial_active = FALSE,
    trial_ends_at = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- Create function to end expired trials (run this daily via cron)
CREATE OR REPLACE FUNCTION public.end_expired_trials()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Update subscriptions
  UPDATE public.lemon_subscriptions
  SET 
    status = 'expired',
    is_trial = FALSE,
    updated_at = NOW()
  WHERE is_trial = TRUE 
    AND trial_ends_at < NOW()
    AND status = 'trial';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Update profiles
  UPDATE public.profiles
  SET 
    is_trial_active = FALSE,
    trial_ends_at = NULL,
    subscription_tier = 'Pay Per Form',
    updated_at = NOW()
  WHERE is_trial_active = TRUE 
    AND trial_ends_at < NOW();
  
  RETURN v_count;
END;
$$;

-- Update RLS policies to allow trial users to access their data
CREATE POLICY "Trial users can manage own subscription"
  ON public.lemon_subscriptions
  FOR ALL
  USING (
    user_id = auth.uid() 
    AND is_trial = TRUE 
    AND trial_ends_at > NOW()
  )
  WITH CHECK (user_id = auth.uid());
