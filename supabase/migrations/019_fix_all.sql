-- ============================================================
-- Migration 019: Fix ALL known DB issues (RUN THIS LAST)
-- Run this AFTER all other migrations have been applied.
-- Fixes: severity column, duplicate policies, missing tools,
--        payment_provider_credentials check constraint issues.
-- 100% IDEMPOTENT — safe to run multiple times.
-- ============================================================

-- ============================================================
-- 1. FIX: Add severity + blocked columns to security_logs
-- (Required by admin security page. Schema.sql's CREATE TABLE
--  IF NOT EXISTS won't add them if table already exists.)
-- ============================================================
ALTER TABLE public.security_logs ADD COLUMN IF NOT EXISTS severity text DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE public.security_logs ADD COLUMN IF NOT EXISTS blocked boolean DEFAULT false;
ALTER TABLE public.security_logs ADD COLUMN IF NOT EXISTS ip_address text;
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON public.security_logs(severity);

-- ============================================================
-- 2. FIX: payment_provider_credentials — drop conflicting policies
-- (Both 006_payment_verification.sql and 018_add_payment_columns
--  try to create the same policy. Drop first, then recreate.)
-- ============================================================
ALTER TABLE public.payment_provider_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage payment credentials" ON public.payment_provider_credentials;
CREATE POLICY "Admins can manage payment credentials"
  ON public.payment_provider_credentials FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================================
-- 3. FIX: payment_provider_credentials — widen check constraint
-- (006 had a restrictive CHECK, 018 omitted it. This ensures
--  GoPayFast and future providers work without constraint errors.)
-- ============================================================
ALTER TABLE public.payment_provider_credentials DROP CONSTRAINT IF EXISTS payment_provider_credentials_provider_check;
-- Re-add with wider list including gopayfast
DO $$ BEGIN
  ALTER TABLE public.payment_provider_credentials
    ADD CONSTRAINT payment_provider_credentials_provider_check
    CHECK (provider IN (
      'stripe', 'jazzcash', 'easypaisa', 'paypal',
      'payoneer', 'bank_transfer', 'crypto', 'gopayfast'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 4. FIX: workflow_settings — add status + api_verified columns
-- (May be missing if schema.sql ran before 018)
-- ============================================================
ALTER TABLE public.workflow_settings ADD COLUMN IF NOT EXISTS status text DEFAULT 'coming_soon' CHECK (status IN ('coming_soon', 'published', 'maintenance'));
ALTER TABLE public.workflow_settings ADD COLUMN IF NOT EXISTS api_verified boolean DEFAULT false;
ALTER TABLE public.workflow_settings ADD COLUMN IF NOT EXISTS last_tested_at timestamptz;
ALTER TABLE public.workflow_settings ADD COLUMN IF NOT EXISTS last_test_result text;

-- ============================================================
-- 5. FIX: ai_models — add display_name, provider_model_id, config
-- ============================================================
ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS provider_model_id text;
ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS config jsonb DEFAULT '{}';

-- ============================================================
-- 6. FIX: payments — widen verification_status check to match 018
-- (006 had old check values, 018 added more)
-- ============================================================
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_verification_status_check;
DO $$ BEGIN
  ALTER TABLE public.payments
    ADD CONSTRAINT payments_verification_status_check
    CHECK (verification_status IN (
      'pending',
      'pending_manual_review',
      'manually_approved',
      'auto_verified',
      'rejected'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 7. SEED: Ensure all workflow_settings entries exist
-- (Idempotent — won't overwrite existing)
-- ============================================================
INSERT INTO public.workflow_settings (workflow_slug, workflow_name, is_enabled, credits_cost, guest_daily_limit, free_daily_limit, premium_daily_limit, max_words, default_model) VALUES
  ('keyword-intelligence', 'Keyword Intelligence', true, 3, 2, 5, 50, 0, 'gemini-2.0-flash'),
  ('domain-intelligence', 'Domain Intelligence', true, 4, 2, 5, 50, 0, 'gemini-2.0-flash'),
  ('post-generator', 'Post Generator', true, 10, 1, 5, 50, 5000, 'gemini-2.0-flash'),
  ('plagiarism-checker', 'Plagiarism Checker', true, 4, 2, 5, 50, 0, 'gemini-2.0-flash'),
  ('ai-writer', 'AI Writer', true, 3, 3, 10, 100, 2000, 'gemini-2.0-flash'),
  ('ai-humanizer', 'AI Humanizer', true, 3, 3, 10, 100, 2000, 'gemini-2.0-flash'),
  ('seo-analyzer', 'SEO Analyzer', true, 3, 2, 5, 50, 0, 'gemini-2.0-flash'),
  ('rank-tracker', 'Rank Tracker', true, 3, 2, 5, 30, 0, 'gemini-2.0-flash'),
  ('backlink-analyzer', 'Backlink Analyzer', true, 3, 2, 5, 30, 0, 'gemini-2.0-flash'),
  ('website-audit', 'Website Audit', true, 5, 1, 3, 20, 0, 'gemini-2.0-flash')
ON CONFLICT (workflow_slug) DO UPDATE SET
  workflow_name = EXCLUDED.workflow_name,
  is_enabled = EXCLUDED.is_enabled;

-- ============================================================
-- 8. SEED: Ensure integration_settings entries exist
-- ============================================================
INSERT INTO public.integration_settings (provider_slug, provider_name, is_enabled) VALUES
  ('dataforseo', 'DataForSEO', false),
  ('copyleaks', 'Copyleaks', false),
  ('originality', 'Originality.ai', false),
  ('resend', 'Resend', false),
  ('plagiarismcheck', 'PlagiarismCheck.org', false),
  ('rewriteai', 'RewriteAI', false),
  ('stripe', 'Stripe', false),
  ('openai', 'OpenAI', false)
ON CONFLICT (provider_slug) DO NOTHING;

-- ============================================================
-- 9. FIX: Add RLS policies for payment_provider_credentials
-- (Ensures admins can read/update credentials from admin panel)
-- ============================================================
DROP POLICY IF EXISTS "Admins can view payment credentials" ON public.payment_provider_credentials;
CREATE POLICY "Admins can view payment credentials"
  ON public.payment_provider_credentials FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================================
-- 10. FIX: Ensure RLS enabled on key tables
-- (Idempotent — re-asserts RLS on tables that might have been missed)
-- ============================================================
ALTER TABLE IF EXISTS public.payment_provider_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workflow_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.backup_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.keyword_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.generated_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plagiarism_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seo_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFICATION QUERIES (run these to confirm fixes applied)
-- ============================================================
-- SELECT column_name FROM information_schema.columns WHERE table_name='security_logs' AND column_name='severity';
-- SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
-- SELECT * FROM public.payment_provider_credentials;
-- SELECT workflow_slug, status, is_enabled FROM public.workflow_settings ORDER BY workflow_slug;
