-- ============================================================
-- Migration 022: FORCE publish premium tools + fix workflow_settings schema
-- IDEMPOTENT: safe to run multiple times
-- ============================================================

-- 1. Add status column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflow_settings' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.workflow_settings ADD COLUMN status text DEFAULT 'coming_soon';
  END IF;
END $$;

-- 2. Add credits_cost column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflow_settings' AND column_name = 'credits_cost'
  ) THEN
    ALTER TABLE public.workflow_settings ADD COLUMN credits_cost integer DEFAULT 0;
  END IF;
END $$;

-- 3. Add api_verified column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflow_settings' AND column_name = 'api_verified'
  ) THEN
    ALTER TABLE public.workflow_settings ADD COLUMN api_verified boolean DEFAULT false;
  END IF;
END $$;

-- 4. Add last_tested_at column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflow_settings' AND column_name = 'last_tested_at'
  ) THEN
    ALTER TABLE public.workflow_settings ADD COLUMN last_tested_at timestamptz;
  END IF;
END $$;

-- 5. Add last_test_result column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflow_settings' AND column_name = 'last_test_result'
  ) THEN
    ALTER TABLE public.workflow_settings ADD COLUMN last_test_result text;
  END IF;
END $$;

-- 6. Add CHECK constraint for status (drop old one first if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'workflow_settings_status_check'
  ) THEN
    ALTER TABLE public.workflow_settings DROP CONSTRAINT workflow_settings_status_check;
  END IF;
END $$;

ALTER TABLE public.workflow_settings
  ADD CONSTRAINT workflow_settings_status_check
  CHECK (status IN ('coming_soon', 'published', 'maintenance'));

-- 7. SEED all tools with correct status
-- NOTE: Column is workflow_slug (NOT tool_slug!)
-- Premium tools = PUBLISHED
INSERT INTO public.workflow_settings (workflow_slug, workflow_name, is_enabled, status, credits_cost, guest_daily_limit, free_daily_limit, premium_daily_limit)
VALUES
  ('keyword-intelligence', 'Keyword Intelligence', true, 'published', 3, 2, 5, 50),
  ('domain-intelligence', 'Domain Intelligence', true, 'published', 4, 2, 5, 50),
  ('post-generator', 'Post Generator', true, 'published', 10, 1, 5, 50),
  ('plagiarism-checker', 'Plagiarism Checker', true, 'published', 4, 2, 5, 50),
  ('ai-writer', 'AI Writer', true, 'published', 3, 3, 10, 100),
  ('ai-humanizer', 'AI Humanizer', true, 'published', 3, 3, 10, 100),
  ('seo-analyzer', 'SEO Analyzer', true, 'published', 3, 2, 5, 50),
  ('rank-tracker', 'Rank Tracker', true, 'published', 3, 2, 5, 30),
  ('backlink-analyzer', 'Backlink Analyzer', true, 'published', 3, 2, 5, 30),
  ('website-audit', 'Website Audit', true, 'published', 5, 1, 3, 20),
  ('keyword-research', 'Keyword Research', true, 'published', 2, 2, 5, 50),
  ('seo-title-generator', 'SEO Title Generator', true, 'published', 1, 3, 10, 100),
  ('meta-description-generator', 'Meta Description Generator', true, 'published', 1, 3, 10, 100),
  ('faq-generator', 'FAQ Generator', true, 'published', 1, 3, 10, 100),
  ('schema-generator', 'Schema Generator', true, 'published', 1, 3, 10, 100),
  ('content-brief', 'Content Brief', true, 'published', 2, 2, 5, 50),
  ('topical-map', 'Topical Map', true, 'published', 2, 2, 5, 50),
  ('internal-link-generator', 'Internal Link Generator', true, 'published', 1, 3, 10, 100),
  ('sitemap-generator', 'Sitemap Generator', true, 'published', 1, 3, 10, 100),
  ('robots-txt-generator', 'Robots.txt Generator', true, 'published', 1, 3, 10, 100),
  ('article-rewriter', 'Article Rewriter', true, 'published', 2, 3, 10, 100),
  ('grammar-checker', 'Grammar Checker', true, 'published', 1, 3, 10, 100),
  ('summarizer', 'Summarizer', true, 'published', 1, 3, 10, 100),
  ('translator', 'Translator', true, 'published', 1, 3, 10, 100),
  ('ai-detector', 'AI Detector', true, 'published', 2, 3, 10, 100)
ON CONFLICT (workflow_slug) DO UPDATE SET
  status = EXCLUDED.status,
  is_enabled = EXCLUDED.is_enabled,
  credits_cost = EXCLUDED.credits_cost,
  guest_daily_limit = EXCLUDED.guest_daily_limit,
  free_daily_limit = EXCLUDED.free_daily_limit,
  premium_daily_limit = EXCLUDED.premium_daily_limit;

-- 8. Verify
SELECT workflow_slug, status, credits_cost FROM public.workflow_settings ORDER BY status DESC, workflow_slug;
