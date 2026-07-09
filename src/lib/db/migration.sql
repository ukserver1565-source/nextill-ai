-- ============================================================
-- Enterprise SaaS Migration: AI Providers, Models, Prompts, etc.
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
