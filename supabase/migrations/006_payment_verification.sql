-- ============================================================
-- 006_payment_verification.sql
-- Hybrid payment verification: manual approval by default,
-- auto-verification when provider credentials are verified.
-- ============================================================

-- 1. Payment provider credentials table
-- Stores API keys/merchants per provider. is_verified = true ONLY
-- after a REAL successful test call to the provider's API.
CREATE TABLE IF NOT EXISTS public.payment_provider_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL UNIQUE CHECK (provider IN (
    'stripe', 'jazzcash', 'easypaisa', 'paypal',
    'payoneer', 'bank_transfer', 'crypto'
  )),
  api_key_encrypted text,       -- encrypted API key (nullable)
  api_secret_encrypted text,    -- encrypted API secret (nullable)
  merchant_id text,             -- for JazzCash/EasyPaisa
  is_verified boolean DEFAULT false,  -- true ONLY after real API test
  last_tested_at timestamptz,
  last_test_result text,        -- 'success' | 'error' | null
  last_test_error text,         -- error message if test failed
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ppc_provider ON public.payment_provider_credentials(provider);

-- 2. Extend payments table with verification columns
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS
  verification_status text DEFAULT 'pending_manual_review'
  CHECK (verification_status IN (
    'pending_manual_review', 'auto_verified',
    'manually_approved', 'rejected'
  ));

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS
  reviewed_at timestamptz;

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS
  provider_transaction_id text;

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS
  auto_verification_response jsonb;

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS
  rejection_reason text;

CREATE INDEX IF NOT EXISTS idx_payments_verification
  ON public.payments(verification_status);

-- 3. Enable RLS
ALTER TABLE public.payment_provider_credentials ENABLE ROW LEVEL SECURITY;

-- Admin-only access to credentials
CREATE POLICY "Admins can manage payment credentials"
  ON public.payment_provider_credentials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- 4. Seed default credentials row for each provider (all unverified)
INSERT INTO public.payment_provider_credentials (provider)
VALUES ('stripe'), ('jazzcash'), ('easypaisa'), ('paypal'),
       ('payoneer'), ('bank_transfer'), ('crypto')
ON CONFLICT (provider) DO NOTHING;
