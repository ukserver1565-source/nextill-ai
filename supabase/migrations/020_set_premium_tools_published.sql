-- ============================================================
-- Migration 020: Set 3 premium tools to "published" status
-- All other tools remain "coming_soon"
-- ============================================================

-- Ensure workflow_settings has the right rows for our 3 premium tools
INSERT INTO workflow_settings (workflow_slug, workflow_name, is_enabled, status, credits_cost)
VALUES
  ('domain-overview', 'Domain Intelligence', true, 'published', 2),
  ('post-generator', 'Post Generator', true, 'published', 10),
  ('plagiarism-checker', 'Plagiarism & Authenticity', true, 'published', 4)
ON CONFLICT (workflow_slug) DO UPDATE SET
  is_enabled = true,
  status = 'published',
  credits_cost = EXCLUDED.credits_cost;

-- Set all other tools to coming_soon (don't touch the 3 premium ones)
UPDATE workflow_settings
SET status = 'coming_soon', is_enabled = false
WHERE workflow_slug NOT IN ('domain-overview', 'post-generator', 'plagiarism-checker')
  AND status != 'coming_soon';
