-- Migration 008: Domain Intelligence tables
-- Idempotent: uses IF NOT EXISTS for all objects

-- ========================================
-- Domain Reports
-- ========================================
CREATE TABLE IF NOT EXISTS domain_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  input_json JSONB NOT NULL DEFAULT '{}',
  overview_json JSONB NOT NULL DEFAULT '{}',
  growth_json JSONB NOT NULL DEFAULT '[]',
  countries_json JSONB NOT NULL DEFAULT '[]',
  competitors_json JSONB NOT NULL DEFAULT '[]',
  backlinks_json JSONB NOT NULL DEFAULT '[]',
  technical_json JSONB NOT NULL DEFAULT '{}',
  recommendations_json JSONB NOT NULL DEFAULT '[]',
  ai_search_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_domain_reports_user_id ON domain_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_domain_reports_domain ON domain_reports(domain);
CREATE INDEX IF NOT EXISTS idx_domain_reports_created_at ON domain_reports(created_at DESC);

-- ========================================
-- Domain Report Snapshots (for history tracking)
-- ========================================
CREATE TABLE IF NOT EXISTS domain_report_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES domain_reports(id) ON DELETE CASCADE,
  overview_json JSONB NOT NULL DEFAULT '{}',
  growth_json JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_domain_snapshots_report_id ON domain_report_snapshots(report_id);

-- ========================================
-- Domain Report Exports
-- ========================================
CREATE TABLE IF NOT EXISTS domain_report_exports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES domain_reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'csv', 'json')),
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_domain_exports_report_id ON domain_report_exports(report_id);

-- ========================================
-- Provider Usage Tracking
-- ========================================
CREATE TABLE IF NOT EXISTS provider_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint TEXT,
  units_used INTEGER DEFAULT 1,
  estimated_cost NUMERIC(10, 6) DEFAULT 0,
  latency_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  request_params JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_usage_provider ON provider_usage(provider);
CREATE INDEX IF NOT EXISTS idx_provider_usage_user_id ON provider_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_usage_created_at ON provider_usage(created_at DESC);

-- ========================================
-- RLS Policies
-- ========================================

ALTER TABLE domain_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_report_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_report_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_usage ENABLE ROW LEVEL SECURITY;

-- domain_reports: users can read/write their own, admins can read all
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'domain_reports_user_policy' AND tablename = 'domain_reports') THEN
    CREATE POLICY domain_reports_user_policy ON domain_reports
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'domain_reports_admin_policy' AND tablename = 'domain_reports') THEN
    CREATE POLICY domain_reports_admin_policy ON domain_reports
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
      );
  END IF;
END $$;

-- domain_report_snapshots
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'domain_snapshots_user_policy' AND tablename = 'domain_report_snapshots') THEN
    CREATE POLICY domain_snapshots_user_policy ON domain_report_snapshots
      FOR ALL USING (
        EXISTS (SELECT 1 FROM domain_reports WHERE id = report_id AND user_id = auth.uid())
      );
  END IF;
END $$;

-- domain_report_exports
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'domain_exports_user_policy' AND tablename = 'domain_report_exports') THEN
    CREATE POLICY domain_exports_user_policy ON domain_report_exports
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- provider_usage: admin only
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'provider_usage_admin_policy' AND tablename = 'provider_usage') THEN
    CREATE POLICY provider_usage_admin_policy ON provider_usage
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
      );
  END IF;
END $$;

-- ========================================
-- Updated_at trigger for domain_reports
-- ========================================
CREATE OR REPLACE FUNCTION update_domain_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_domain_reports_updated_at') THEN
    CREATE TRIGGER update_domain_reports_updated_at
      BEFORE UPDATE ON domain_reports
      FOR EACH ROW
      EXECUTE FUNCTION update_domain_reports_updated_at();
  END IF;
END $$;
