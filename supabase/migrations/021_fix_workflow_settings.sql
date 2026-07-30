-- ============================================================
-- Migration 021: Fix workflow_settings — add missing columns
-- and seed ALL tools with correct status and credit costs.
--
-- ROOT CAUSE: The `status` column was defined in migration 014
-- and 019 but never applied to the live DB. Without it, every
-- tool reverts to "coming_soon" on refresh because:
--   - select("*") returns no `status` field
--   - tool-repo.ts defaults w.status ?? "coming_soon"
--   - Updates to `status` column fail (column doesn't exist)
--
-- 100% IDEMPOTENT — safe to run multiple times.
-- ============================================================

-- ============================================================
-- 1. ADD COLUMNS (idempotent — IF NOT EXISTS)
-- ============================================================
ALTER TABLE public.workflow_settings
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'coming_soon';

ALTER TABLE public.workflow_settings
  ADD COLUMN IF NOT EXISTS api_verified boolean DEFAULT false;

ALTER TABLE public.workflow_settings
  ADD COLUMN IF NOT EXISTS last_tested_at timestamptz;

ALTER TABLE public.workflow_settings
  ADD COLUMN IF NOT EXISTS last_test_result text;

-- ============================================================
-- 2. ADD/CHECK CONSTRAINT for status values
-- Drop existing constraint first to avoid duplicate errors,
-- then re-add with the full set of allowed values.
-- ============================================================
DO $$ BEGIN
  ALTER TABLE public.workflow_settings
    DROP CONSTRAINT IF EXISTS workflow_settings_status_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.workflow_settings
  ADD CONSTRAINT workflow_settings_status_check
  CHECK (status IN ('coming_soon', 'published', 'maintenance'));

-- ============================================================
-- 3. BACKFILL: any NULL status -> 'coming_soon'
-- ============================================================
UPDATE public.workflow_settings SET status = 'coming_soon' WHERE status IS NULL;

-- ============================================================
-- 4. ENSURE ALL 10 TOOLS EXIST (idempotent insert)
-- Uses the canonical slug and name from tool-repo.ts
-- ============================================================
INSERT INTO public.workflow_settings
  (workflow_slug, workflow_name, is_enabled, credits_cost,
   guest_daily_limit, free_daily_limit, premium_daily_limit,
   max_words, default_model)
VALUES
  ('keyword-intelligence',  'Keyword Intelligence',       true, 3,  3, 10, 100,    0, 'gemini-2.0-flash'),
  ('domain-intelligence',   'Domain Intelligence',        true, 2,  1,  5, 100,    0, 'gemini-2.0-flash'),
  ('post-generator',        'Post Generator',             true, 10, 1,  5,  50, 5000, 'gemini-2.0-flash'),
  ('plagiarism-checker',    'Plagiarism & Authenticity',  true, 4,  2,  5,  50,    0, 'gemini-2.0-flash'),
  ('ai-writer',             'AI Writer',                  true, 3,  3, 10, 100, 2000, 'gemini-2.0-flash'),
  ('ai-humanizer',          'AI Humanizer',               true, 3,  3, 10, 100, 2000, 'gemini-2.0-flash'),
  ('seo-analyzer',          'SEO Analyzer',               true, 3,  2,  5,  50,    0, 'gemini-2.0-flash'),
  ('rank-tracker',          'Rank Tracker',               true, 3,  2,  5,  30,    0, 'gemini-2.0-flash'),
  ('backlink-analyzer',     'Backlink Analyzer',          true, 3,  2,  5,  30,    0, 'gemini-2.0-flash'),
  ('website-audit',         'Website Audit',              true, 5,  1,  3,  20,    0, 'gemini-2.0-flash')
ON CONFLICT (workflow_slug) DO UPDATE SET
  workflow_name       = EXCLUDED.workflow_name,
  credits_cost        = EXCLUDED.credits_cost,
  guest_daily_limit   = EXCLUDED.guest_daily_limit,
  free_daily_limit    = EXCLUDED.free_daily_limit,
  premium_daily_limit = EXCLUDED.premium_daily_limit;

-- ============================================================
-- 5. SET 3 PREMIUM TOOLS to 'published'
-- These are the only tools with live API integrations:
--   - domain-intelligence  (2 credits)
--   - post-generator       (10 credits)
--   - plagiarism-checker   (4 credits)
-- ============================================================
UPDATE public.workflow_settings
SET status      = 'published',
    is_enabled  = true,
    api_verified = true
WHERE workflow_slug IN ('domain-intelligence', 'post-generator', 'plagiarism-checker');

-- ============================================================
-- 6. SET ALL OTHER TOOLS to 'coming_soon'
-- ============================================================
UPDATE public.workflow_settings
SET status     = 'coming_soon',
    is_enabled = false
WHERE workflow_slug NOT IN ('domain-intelligence', 'post-generator', 'plagiarism-checker');

-- ============================================================
-- 7. VERIFY (run manually to confirm)
-- ============================================================
-- SELECT workflow_slug, status, api_verified, credits_cost
-- FROM public.workflow_settings
-- ORDER BY workflow_slug;
