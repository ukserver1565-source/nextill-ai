-- Migration 009: Admin permissions fix + prompt_templates RLS policies
-- Idempotent: all statements use IF NOT EXISTS / DO $$ blocks
-- Non-destructive: no data deletion, no old migration edits

-- ============================================================
-- 1. Ensure RLS is enabled on all admin tables
-- ============================================================
ALTER TABLE IF EXISTS public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.provider_usage ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. Create RLS policies for prompt_templates
--    Admin/super_admin can read/write via service_role (bypasses RLS)
--    Authenticated users: read-only for active prompts
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'prompt_templates_admin_policy' AND tablename = 'prompt_templates') THEN
    CREATE POLICY prompt_templates_admin_policy ON prompt_templates
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'prompt_templates_read_active' AND tablename = 'prompt_templates') THEN
    CREATE POLICY prompt_templates_read_active ON prompt_templates
      FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ============================================================
-- 3. Create RLS policies for system_logs
--    Admin/super_admin via service_role only
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'system_logs_admin_policy' AND tablename = 'system_logs') THEN
    CREATE POLICY system_logs_admin_policy ON system_logs
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
      );
  END IF;
END $$;

-- ============================================================
-- 4. Create RLS policies for admin_audit_logs
--    Admin/super_admin via service_role only
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_audit_logs_admin_policy' AND tablename = 'admin_audit_logs') THEN
    CREATE POLICY admin_audit_logs_admin_policy ON admin_audit_logs
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
      );
  END IF;
END $$;

-- ============================================================
-- 5. Create RLS policies for workflow_runs
--    Users can read their own; admins read all
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workflow_runs_user_policy' AND tablename = 'workflow_runs') THEN
    CREATE POLICY workflow_runs_user_policy ON workflow_runs
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workflow_runs_admin_policy' AND tablename = 'workflow_runs') THEN
    CREATE POLICY workflow_runs_admin_policy ON workflow_runs
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
      );
  END IF;
END $$;

-- ============================================================
-- 6. Create RLS policies for ai_logs
--    NO access for authenticated users via anon key
--    service_role bypasses RLS, so admin API routes work fine
-- ============================================================
-- ai_logs: NO policies for regular users = no access
-- This is intentional. All admin queries go through service_role.

-- ============================================================
-- 7. Ensure service_role has necessary table access
-- ============================================================
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Ensure authenticated role has basic access for their own data
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON TABLE profiles TO authenticated;
GRANT SELECT ON TABLE plans TO authenticated;
GRANT SELECT ON TABLE documents TO authenticated;
GRANT INSERT, UPDATE ON TABLE documents TO authenticated;
GRANT SELECT ON TABLE projects TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE projects TO authenticated;
GRANT SELECT ON TABLE credits TO authenticated;
GRANT SELECT ON TABLE credit_logs TO authenticated;
GRANT SELECT ON TABLE usage_logs TO authenticated;
GRANT SELECT ON TABLE ai_providers TO authenticated;
GRANT SELECT ON TABLE ai_models TO authenticated;

-- ============================================================
-- 8. Seed additional prompt templates if missing
-- ============================================================
INSERT INTO public.prompt_templates (slug, name, category, prompt_text) VALUES
('grammar_check', 'Grammar Check', 'grammar', 'Check the following text for grammar, spelling, and punctuation errors. Return corrected text and list of changes.'),
('ai_detector', 'AI Detection', 'ai_detection', 'Analyze the following text and estimate the likelihood it was AI-generated. Provide a score and explanation.'),
('plagiarism_check', 'Plagiarism Check', 'plagiarism', 'Analyze the following text for originality and potential plagiarism. Return originality score and any concerns.')
ON CONFLICT (slug) DO NOTHING;
