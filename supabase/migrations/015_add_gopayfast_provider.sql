-- ============================================================
-- Migration 015: Add GoPayFast (PayFast Pakistan) as payment provider
-- ============================================================

-- 1. Update the payment_provider_credentials check constraint to include gopayfast
-- First drop the old constraint, then add new one with all providers
DO $$
DECLARE
  v_constraint_name TEXT;
BEGIN
  SELECT c.conname INTO v_constraint_name
  FROM pg_constraint c
  WHERE c.conrelid = 'public.payment_provider_credentials'::regclass
    AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) LIKE '%provider%'
  LIMIT 1;

  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.payment_provider_credentials DROP CONSTRAINT %I', v_constraint_name);
  END IF;
END $$;

ALTER TABLE public.payment_provider_credentials
  ADD CONSTRAINT payment_provider_credentials_provider_check
  CHECK (provider IN (
    'stripe', 'jazzcash', 'easypaisa', 'paypal',
    'payoneer', 'bank_transfer', 'crypto', 'gopayfast'
  ));

-- 2. Seed GoPayFast credentials row (unverified, like all others)
INSERT INTO public.payment_provider_credentials (provider)
VALUES ('gopayfast')
ON CONFLICT (provider) DO NOTHING;
