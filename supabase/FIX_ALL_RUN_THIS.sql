-- ============================================================
-- FIX_ALL_RUN_THIS.sql
-- Run this ONE file in Supabase SQL Editor to fix ALL errors
-- It fixes: severity column, duplicate policies, RLS issues
-- Fully idempotent — safe to run multiple times
-- ============================================================

-- ── 1. SECURITY LOGS: add missing columns ──────────────────
ALTER TABLE IF EXISTS public.security_logs
  ADD COLUMN IF NOT EXISTS severity text DEFAULT 'low';
ALTER TABLE IF EXISTS public.security_logs
  ADD COLUMN IF NOT EXISTS blocked boolean DEFAULT false;
ALTER TABLE IF EXISTS public.security_logs
  ADD COLUMN IF NOT EXISTS ip_address text;

-- Add check constraint safely
DO $$ BEGIN
  ALTER TABLE public.security_logs
    ADD CONSTRAINT security_logs_severity_check
    CHECK (severity IN ('low', 'medium', 'high', 'critical'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add indexes safely
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON public.security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON public.security_logs(ip_address);

-- ── 2. PAYMENT PROVIDER CREDENTIALS: fix policies ──────────
DO $$ BEGIN
  ALTER TABLE public.payment_provider_credentials
    ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DROP POLICY IF EXISTS "Admins can manage payment credentials" ON public.payment_provider_credentials;
CREATE POLICY "Admins can manage payment credentials"
  ON public.payment_provider_credentials
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read payment credentials" ON public.payment_provider_credentials;
CREATE POLICY "Admins can read payment credentials"
  ON public.payment_provider_credentials
  FOR SELECT USING (public.is_admin());

-- ── 3. SITE_SETTINGS: add INSERT + ALL policies ────────────
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;
CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (public.is_admin());

-- ── 4. PAYMENTS: add missing columns ──────────────────────
ALTER TABLE IF EXISTS public.payments
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending';
ALTER TABLE IF EXISTS public.payments
  ADD COLUMN IF NOT EXISTS reviewed_by uuid;
ALTER TABLE IF EXISTS public.payments
  ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE IF EXISTS public.payments
  ADD COLUMN IF NOT EXISTS auto_verification_response jsonb;
ALTER TABLE IF EXISTS public.payments
  ADD COLUMN IF NOT EXISTS final_amount numeric;
ALTER TABLE IF EXISTS public.payments
  ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly';
ALTER TABLE IF EXISTS public.payments
  ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;
ALTER TABLE IF EXISTS public.payments
  ADD COLUMN IF NOT EXISTS coupon_id uuid;

-- Add check constraint safely
DO $$ BEGIN
  ALTER TABLE public.payments
    ADD CONSTRAINT payments_verification_status_check
    CHECK (verification_status IN ('pending', 'pending_manual_review', 'manually_approved', 'auto_verified', 'rejected'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 5. PAYMENT PROVIDER CREDENTIALS: add gopayfast ────────
DO $$ BEGIN
  ALTER TABLE public.payment_provider_credentials
    DROP CONSTRAINT IF EXISTS payment_provider_credentials_provider_check;
  ALTER TABLE public.payment_provider_credentials
    ADD CONSTRAINT payment_provider_credentials_provider_check
    CHECK (provider IN ('stripe', 'paypal', 'jazzcash', 'easypaisa', 'bank_transfer', 'crypto', 'gopayfast'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

INSERT INTO public.payment_provider_credentials (provider, is_verified)
VALUES ('gopayfast', false)
ON CONFLICT DO NOTHING;

-- ── 6. PROFILES: fix role constraint ──────────────────────
UPDATE public.profiles SET role = 'free_user' WHERE role = 'user';
DO $$ BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('free_user', 'admin', 'super_admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 7. TRIGGER: fix handle_new_user ───────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role, plan, credits)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'free_user',
    'free',
    100
  );
  INSERT INTO public.credits (user_id, balance)
  VALUES (new.id, 100)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ── 8. DAILY LIMITS for all tools ─────────────────────────
INSERT INTO public.tool_settings (tool_slug, tool_name, is_enabled, credits_cost, guest_daily_limit)
VALUES
  ('ai-humanizer', 'AI Humanizer', true, 3, 5),
  ('ai-writer', 'AI Writer', true, 5, 3),
  ('ai-detector', 'AI Detector', true, 2, 5),
  ('plagiarism-checker', 'Plagiarism Checker', true, 4, 3),
  ('keyword-research', 'Keyword Research', true, 2, 5),
  ('post-generator', 'Post Generator', true, 10, 2),
  ('seo-title-generator', 'SEO Title Generator', true, 1, 5),
  ('meta-description-generator', 'Meta Description Generator', true, 1, 5),
  ('faq-generator', 'FAQ Generator', true, 2, 3),
  ('schema-generator', 'Schema Generator', true, 1, 5),
  ('website-audit', 'Website Audit', true, 5, 2),
  ('grammar-checker', 'Grammar Checker', true, 1, 5),
  ('summarizer', 'Summarizer', true, 2, 3),
  ('translator', 'Translator', true, 2, 3),
  ('article-rewriter', 'Article Rewriter', true, 3, 3)
ON CONFLICT (tool_slug) DO UPDATE SET
  guest_daily_limit = EXCLUDED.guest_daily_limit,
  credits_cost = EXCLUDED.credits_cost,
  is_enabled = EXCLUDED.is_enabled;

-- ── 9. EMAIL SETTINGS seed ────────────────────────────────
INSERT INTO public.site_settings (key, value) VALUES
  ('email_provider', '"resend"'),
  ('resend_api_key', '""'),
  ('from_email', '"noreply@adultpulse.co.uk"'),
  ('from_name', '"Nextill AI"'),
  ('smtp_host', '""'),
  ('smtp_port', '"587"'),
  ('smtp_user', '""'),
  ('smtp_pass', '""')
ON CONFLICT (key) DO NOTHING;

-- ── DONE ──────────────────────────────────────────────────
SELECT 'FIX_ALL completed successfully!' as result;
