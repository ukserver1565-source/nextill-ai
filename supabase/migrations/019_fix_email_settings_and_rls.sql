-- ============================================================
-- Migration 019: Fix site_settings RLS + missing policies
-- Run this to fix email settings save failure
-- ============================================================

-- 1. Ensure site_settings has INSERT policy for admins
DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;
CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (public.is_admin());

-- 2. Ensure site_settings has ALL policy for admins (insert + update)
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin());

-- 3. Seed default email settings if missing
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

-- 4. Also ensure email_settings table has admin insert policy
DROP POLICY IF EXISTS "Admins can manage email_settings" ON public.email_settings;
CREATE POLICY "Admins can manage email_settings"
  ON public.email_settings FOR ALL
  USING (public.is_admin());
