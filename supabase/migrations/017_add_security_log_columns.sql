-- Migration 017: Add severity + blocked columns to security_logs
-- These columns are used by the admin security page but were missing from the original schema.

ALTER TABLE public.security_logs ADD COLUMN IF NOT EXISTS severity text DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE public.security_logs ADD COLUMN IF NOT EXISTS blocked boolean DEFAULT false;
ALTER TABLE public.security_logs ADD COLUMN IF NOT EXISTS ip_address text;

-- Index for filtering by severity
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON public.security_logs(severity);
