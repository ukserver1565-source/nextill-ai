-- ============================================================
-- 016_configure_daily_limits.sql
-- Configure daily limits and credit costs for all tools
-- Idempotent: safe to run multiple times
-- ============================================================

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
  ('article-rewriter', 'Article Rewriter', true, 3, 3),
  ('content-brief', 'Content Brief', true, 3, 3),
  ('topical-map', 'Topical Map', true, 2, 3),
  ('internal-link-generator', 'Internal Link Generator', true, 1, 5),
  ('sitemap-generator', 'Sitemap Generator', true, 1, 5),
  ('robots-txt-generator', 'Robots.txt Generator', true, 1, 5),
  ('rank-tracker', 'Rank Tracker', true, 5, 2),
  ('backlink-checker', 'Backlink Checker', true, 5, 2)
ON CONFLICT (tool_slug) DO UPDATE SET
  guest_daily_limit = EXCLUDED.guest_daily_limit,
  credits_cost = EXCLUDED.credits_cost,
  is_enabled = EXCLUDED.is_enabled;
