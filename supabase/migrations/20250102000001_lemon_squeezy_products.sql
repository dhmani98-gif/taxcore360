-- Migration: Lemon Squeezy Products and Variants Mapping
-- Date: 2025-01-02
-- This table stores Lemon Squeezy product/variant IDs and maps them to subscription tiers

-- Create table to store Lemon Squeezy product mappings
CREATE TABLE IF NOT EXISTS public.lemon_squeezy_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  variant_id VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  variant_name VARCHAR(255),
  tier VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  checkout_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint on variant_id (each variant should be unique)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lemon_squeezy_products_variant_id_key'
  ) THEN
    ALTER TABLE public.lemon_squeezy_products ADD CONSTRAINT lemon_squeezy_products_variant_id_key UNIQUE (variant_id);
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lemon_squeezy_products_tier ON public.lemon_squeezy_products(tier);
CREATE INDEX IF NOT EXISTS idx_lemon_squeezy_products_variant ON public.lemon_squeezy_products(variant_id);

-- Enable RLS
ALTER TABLE public.lemon_squeezy_products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active products" ON public.lemon_squeezy_products;
DROP POLICY IF EXISTS "Service role can manage products" ON public.lemon_squeezy_products;

-- Create RLS policies
-- Anyone can view active products (for checkout page)
CREATE POLICY "Anyone can view active products"
  ON public.lemon_squeezy_products
  FOR SELECT
  USING (is_active = TRUE);

-- Service role can manage all
CREATE POLICY "Service role can manage products"
  ON public.lemon_squeezy_products
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.lemon_squeezy_products TO service_role;
GRANT SELECT ON public.lemon_squeezy_products TO authenticated;
GRANT SELECT ON public.lemon_squeezy_products TO anon;

-- Insert your Lemon Squeezy products (run these after creating the table)
-- Uncomment and modify with your actual product/variant IDs:

/*
INSERT INTO public.lemon_squeezy_products (product_id, variant_id, product_name, variant_name, tier, price, checkout_url) VALUES
('8c2a1173-86c0-4f3d-9bd6-55c6eea44f08', 'variant-id-here', 'TaxFlow', 'Pay Per Form', 'Pay Per Form', 4.00, 'https://taxflow.lemonsqueezy.com/checkout/buy/8c2a1173-86c0-4f3d-9bd6-55c6eea44f08'),
('8ce36460-1599-4916-a8b6-84a31dfec176', 'variant-id-here', 'TaxFlow', 'Professional', 'Professional', 79.00, 'https://taxflow.lemonsqueezy.com/checkout/buy/8ce36460-1599-4916-a8b6-84a31dfec176'),
('a7399038-8dc2-4cc7-b5f8-530ccce4f32a', 'variant-id-here', 'TaxFlow', 'Enterprise', 'Enterprise', 199.00, 'https://taxflow.lemonsqueezy.com/checkout/buy/a7399038-8dc2-4cc7-b5f8-530ccce4f32a');
*/

-- Function to get checkout URL by tier
CREATE OR REPLACE FUNCTION public.get_checkout_url(p_tier VARCHAR)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url TEXT;
BEGIN
  SELECT checkout_url INTO v_url
  FROM public.lemon_squeezy_products
  WHERE tier = p_tier AND is_active = TRUE
  LIMIT 1;
  
  RETURN v_url;
END;
$$;

-- Function to map variant ID to tier
CREATE OR REPLACE FUNCTION public.get_tier_by_variant(p_variant_id VARCHAR)
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tier VARCHAR;
BEGIN
  SELECT tier INTO v_tier
  FROM public.lemon_squeezy_products
  WHERE variant_id = p_variant_id AND is_active = TRUE
  LIMIT 1;
  
  RETURN v_tier;
END;
$$;
