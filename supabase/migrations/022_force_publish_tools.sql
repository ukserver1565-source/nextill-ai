-- ============================================================
-- Migration 022: FORCE publish premium tools + fix workflow_settings schema
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

-- 3. Add CHECK constraint for status (drop old one first if exists)
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

-- 4. SEED all tools with correct status
-- Premium tools = PUBLISHED
INSERT INTO public.workflow_settings (tool_slug, tool_name, is_enabled, status, credits_cost)
VALUES
  ('domain-intelligence', 'Domain Intelligence', true, 'published', 2),
  ('post-generator', 'Post Generator', true, 'published', 10),
  ('plagiarism-checker', 'Plagiarism Checker', true, 'published', 4)
ON CONFLICT (tool_slug) DO UPDATE SET
  status = EXCLUDED.status,
  is_enabled = EXCLUDED.is_enabled,
  credits_cost = EXCLUDED.credits_cost;

-- Other tools = COMING SOON
INSERT INTO public.workflow_settings (tool_slug, tool_name, is_enabled, status, credits_cost)
VALUES
  ('keyword-intelligence', 'Keyword Intelligence', true, 'coming_soon', 2),
  ('ai-writer', 'AI Writer', true, 'coming_soon', 3),
  ('ai-humanizer', 'AI Humanizer', true, 'coming_soon', 2),
  ('seo-analyzer', 'SEO Analyzer', true, 'coming_soon', 3),
  ('rank-tracker', 'Rank Tracker', true, 'coming_soon', 3),
  ('backlink-analyzer', 'Backlink Analyzer', true, 'coming_soon', 3),
  ('website-audit', 'Website Audit', true, 'coming_soon', 3),
  ('keyword-research', 'Keyword Research', true, 'coming_soon', 2),
  ('seo-title-generator', 'SEO Title Generator', true, 'coming_soon', 1),
  ('meta-description-generator', 'Meta Description Generator', true, 'coming_soon', 1),
  ('faq-generator', 'FAQ Generator', true, 'coming_soon', 1),
  ('schema-generator', 'Schema Generator', true, 'coming_soon', 1),
  ('content-brief', 'Content Brief', true, 'coming_soon', 2),
  ('topical-map', 'Topical Map', true, 'coming_soon', 2),
  ('internal-link-generator', 'Internal Link Generator', true, 'coming_soon', 1),
  ('sitemap-generator', 'Sitemap Generator', true, 'coming_soon', 1),
  ('robots-txt-generator', 'Robots.txt Generator', true, 'coming_soon', 1),
  ('article-rewriter', 'Article Rewriter', true, 'coming_soon', 2),
  ('grammar-checker', 'Grammar Checker', true, 'coming_soon', 1),
  ('summarizer', 'Summarizer', true, 'coming_soon', 1),
  ('translator', 'Translator', true, 'coming_soon', 1)
ON CONFLICT (tool_slug) DO UPDATE SET
  status = EXCLUDED.status,
  is_enabled = EXCLUDED.is_enabled,
  credits_cost = EXCLUDED.credits_cost;

-- 5. Verify
SELECT tool_slug, status, credits_cost FROM public.workflow_settings ORDER BY status DESC, tool_slug;
