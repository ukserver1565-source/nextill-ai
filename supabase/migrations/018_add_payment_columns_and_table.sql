-- Migration 018: Add payment review columns + payment_provider_credentials table

-- 1. Add review columns to payments table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'));
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider_transaction_id text;

-- 2. Create payment_provider_credentials table
CREATE TABLE IF NOT EXISTS public.payment_provider_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL UNIQUE,
  merchant_id text,
  api_key_encrypted text,
  api_secret_encrypted text,
  is_verified boolean DEFAULT false,
  last_tested_at timestamptz,
  last_test_result text,
  last_test_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Add missing columns to workflow_settings
ALTER TABLE public.workflow_settings ADD COLUMN IF NOT EXISTS status text DEFAULT 'coming_soon' CHECK (status IN ('coming_soon', 'published', 'maintenance'));
ALTER TABLE public.workflow_settings ADD COLUMN IF NOT EXISTS api_verified boolean DEFAULT false;
ALTER TABLE public.workflow_settings ADD COLUMN IF NOT EXISTS last_tested_at timestamptz;
ALTER TABLE public.workflow_settings ADD COLUMN IF NOT EXISTS last_test_result text;

-- 4. Add missing columns to ai_models
ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS provider_model_id text;
ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS config jsonb DEFAULT '{}';

-- 5. Enable RLS on payment_provider_credentials
ALTER TABLE public.payment_provider_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage payment credentials" ON public.payment_provider_credentials;
CREATE POLICY "Admins can manage payment credentials"
  ON public.payment_provider_credentials FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
