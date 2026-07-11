-- ============================================================
-- Complete Nextill AI Database Schema
-- ============================================================

-- 0. CORE TABLES (profiles, plans, projects, documents, credits, etc.)

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  credits_monthly INTEGER DEFAULT 0,
  max_projects INTEGER DEFAULT 5,
  max_users INTEGER DEFAULT 1,
  max_documents INTEGER DEFAULT -1,
  features JSONB DEFAULT '[]',
  tool_access JSONB DEFAULT '[]',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT DEFAULT '',
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  plan TEXT DEFAULT 'free',
  credits INTEGER DEFAULT 100,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  company TEXT,
  website TEXT,
  bio TEXT,
  metadata JSONB DEFAULT '{}',
  last_sign_in TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT,
  description TEXT,
  color TEXT DEFAULT '#6D5EF5',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT,
  content_html TEXT,
  tool_slug TEXT,
  type TEXT DEFAULT 'article',
  status TEXT DEFAULT 'draft',
  metadata JSONB DEFAULT '{}',
  word_count INTEGER DEFAULT 0,
  credits_cost INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);

CREATE TABLE IF NOT EXISTS credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE UNIQUE,
  balance INTEGER DEFAULT 0,
  lifetime_earned INTEGER DEFAULT 0,
  lifetime_used INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'used', 'refunded', 'admin_add', 'admin_remove', 'expired')),
  description TEXT,
  reference_type TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credit_logs_user ON credit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_logs_created ON credit_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  guest_id TEXT,
  tool_slug TEXT NOT NULL,
  workflow_slug TEXT,
  credits_cost INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed',
  input_summary TEXT,
  tokens_used INTEGER DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  model TEXT,
  provider TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_tool ON usage_logs(tool_slug);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  plan_slug TEXT,
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  plan_slug TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_provider TEXT,
  provider_payment_id TEXT,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  author TEXT,
  cover_image TEXT,
  category TEXT,
  tags JSONB DEFAULT '[]',
  seo_title TEXT,
  seo_description TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  min_amount DECIMAL(10,2) DEFAULT 0,
  applies_to_plan TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  value_json JSONB,
  type TEXT DEFAULT 'string',
  category TEXT DEFAULT 'general',
  label TEXT,
  description TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON admin_audit_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS plagiarism_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  input_text_hash TEXT,
  overall_score DECIMAL(5,2) DEFAULT 0,
  matches JSONB DEFAULT '[]',
  sources JSONB DEFAULT '[]',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT UNIQUE NOT NULL,
  config JSONB DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflow_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tool_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_slug TEXT UNIQUE NOT NULL,
  tool_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  credits_cost INTEGER DEFAULT 5,
  guest_daily_limit INTEGER DEFAULT 3,
  free_daily_limit INTEGER DEFAULT 10,
  premium_daily_limit INTEGER DEFAULT 100,
  default_model TEXT,
  max_words INTEGER DEFAULT 2000,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  prompt_template TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Enterprise SaaS Tables: AI Providers, Models, Prompts, etc.
-- ============================================================

-- 1. AI PROVIDERS
CREATE TABLE IF NOT EXISTS ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  logo TEXT,
  base_url TEXT,
  api_key_encrypted TEXT,
  priority INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'unconfigured',
  latency_ms INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  cost_total DECIMAL(12,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. API KEYS (encrypted)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES ai_providers(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  key_encrypted TEXT NOT NULL,
  key_preview TEXT,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  connection_status TEXT DEFAULT 'untested',
  last_used_at TIMESTAMPTZ,
  last_tested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. MODELS
CREATE TABLE IF NOT EXISTS ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES ai_providers(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  top_p DECIMAL(3,2) DEFAULT 0.95,
  presence_penalty DECIMAL(3,2) DEFAULT 0,
  frequency_penalty DECIMAL(3,2) DEFAULT 0,
  max_tokens INTEGER DEFAULT 4096,
  supports_streaming BOOLEAN DEFAULT false,
  supports_vision BOOLEAN DEFAULT false,
  cost_per_1k_input DECIMAL(8,6) DEFAULT 0,
  cost_per_1k_output DECIMAL(8,6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PROMPTS
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SETTINGS (key-value store)
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  value_json JSONB,
  type TEXT DEFAULT 'string',
  category TEXT DEFAULT 'general',
  label TEXT,
  description TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  user_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  source TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. SYSTEM LOGS
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT DEFAULT 'info',
  message TEXT NOT NULL,
  source TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. EMAIL SETTINGS
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'resend',
  config_json JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. BACKUPS
CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  filename TEXT,
  size_bytes BIGINT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  data JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. SECURITY EVENTS
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_id UUID,
  details JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'low',
  blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_providers_priority ON ai_providers(priority);
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_provider ON ai_models(provider_id);
CREATE INDEX IF NOT EXISTS idx_prompts_tool_slug ON prompts(tool_slug);
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address);

-- Default prompts
INSERT INTO prompts (tool_slug, name, content) VALUES
('keyword-intelligence', 'Keyword Research', 'You are an SEO keyword research expert. Given the seed keywords "{{seed}}", generate {{maxKeywords}} related keywords with search volume, difficulty score (0-100), and trend direction. Return as JSON array with fields: keyword, volume, difficulty, trend.'),
('post-generator', 'Post Writer', 'You are an expert content writer. Write a comprehensive, SEO-optimized blog post about "{{topic}}" in a {{tone}} tone. Target {{audience}} audience. Include keywords: {{keywords}}. Write at least {{wordCount}} words. Use proper headings, paragraphs, and formatting.'),
('plagiarism', 'Plagiarism Check', 'Analyze the following text for potential plagiarism. Compare the content against known sources and return a similarity score (0-100%), flagged sentences, and potential source URLs. Text: "{{text}}"'),
('ai-humanizer', 'Humanizer', 'Rewrite the following AI-generated text to sound more natural and human-like. Preserve the original meaning, facts, and key information while making the language flow naturally, varying sentence structure, and adding a conversational tone where appropriate. Text: "{{text}}"'),
('ai-detector', 'AI Detector', 'Analyze the following text for AI-generated content. Return a probability score (0-100%), sentence-level analysis, and patterns detected. Text: "{{text}}"')
ON CONFLICT DO NOTHING;

-- Default app settings
INSERT INTO app_settings (key, value, type, category, label, description) VALUES
('site_name', 'Nextill AI', 'string', 'general', 'Site Name', 'The name of your application'),
('site_description', 'AI-Powered SEO & Content Platform', 'string', 'general', 'Site Description', 'Default meta description'),
('site_logo', '', 'string', 'branding', 'Logo URL', 'URL to your logo image'),
('site_favicon', '', 'string', 'branding', 'Favicon URL', 'URL to your favicon'),
('footer_text', 'Nextill AI. All rights reserved.', 'string', 'general', 'Footer Text', 'Copyright text in footer'),
('default_theme', 'dark', 'string', 'appearance', 'Default Theme', 'dark or light'),
('primary_color', '#6366f1', 'string', 'appearance', 'Primary Color', 'Primary brand color'),
('language', 'en', 'string', 'localization', 'Default Language', 'Default language code'),
('timezone', 'UTC', 'string', 'localization', 'Timezone', 'Server timezone'),
('currency', 'USD', 'string', 'billing', 'Currency', 'Default billing currency'),
('smtp_host', '', 'string', 'email', 'SMTP Host', 'SMTP server hostname'),
('smtp_port', '587', 'string', 'email', 'SMTP Port', 'SMTP server port'),
('smtp_user', '', 'string', 'email', 'SMTP Username', 'SMTP authentication username'),
('smtp_pass', '', 'string', 'email', 'SMTP Password', 'SMTP authentication password'),
('smtp_from', 'noreply@nextill.ai', 'string', 'email', 'From Address', 'Default sender email'),
('resend_api_key', '', 'string', 'email', 'Resend API Key', 'Resend.com API key for email sending'),
('rate_limit_per_min', '60', 'string', 'security', 'Rate Limit (per min)', 'Maximum API requests per minute'),
('rate_limit_per_hour', '1000', 'string', 'security', 'Rate Limit (per hour)', 'Maximum API requests per hour'),
('session_timeout', '3600', 'string', 'security', 'Session Timeout (s)', 'Session expiry in seconds'),
('maintenance_mode', 'false', 'string', 'system', 'Maintenance Mode', 'Enable to put site in maintenance mode'),
('enable_registration', 'true', 'string', 'system', 'Enable Registration', 'Allow new user signups'),
('default_credits', '100', 'string', 'billing', 'Default Credits', 'Credits given to new users')
ON CONFLICT (key) DO NOTHING;
