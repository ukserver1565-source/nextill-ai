-- 005_enterprise_tables.sql
-- Enterprise tables for Nextill AI production architecture

-- ============================================================
-- AI PROVIDERS (dynamic provider configs)
-- ============================================================
create table if not exists public.ai_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo text,
  enabled boolean default false,
  priority integer default 0,
  base_url text,
  default_model text,
  status text default 'inactive' check (status in ('active', 'inactive', 'error')),
  latency_ms integer default 0,
  usage_count integer default 0,
  total_cost numeric(12,6) default 0,
  last_used_at timestamptz,
  config jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- AI API KEYS (encrypted/masked storage)
-- ============================================================
create table if not exists public.ai_api_keys (
  id uuid primary key default gen_random_uuid(),
  provider_slug text not null references public.ai_providers(slug) on delete cascade,
  name text not null,
  key_encrypted text not null,
  key_prefix text default '',
  is_enabled boolean default true,
  last_used_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_ai_api_keys_provider on public.ai_api_keys(provider_slug);

-- ============================================================
-- AI MODELS (enhanced)
-- ============================================================
alter table public.ai_models add column if not exists provider_slug text;
alter table public.ai_models add column if not exists temperature numeric(4,2) default 0.7;
alter table public.ai_models add column if not exists top_p numeric(4,2) default 1.0;
alter table public.ai_models add column if not exists max_tokens integer default 4096;
alter table public.ai_models add column if not exists streaming boolean default false;
alter table public.ai_models add column if not exists priority integer default 0;
alter table public.ai_models add column if not exists fallback_model_id uuid;
alter table public.ai_models add column if not exists is_fallback boolean default false;

-- ============================================================
-- PROMPT TEMPLATES
-- ============================================================
create table if not exists public.prompt_templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  prompt_text text not null,
  default_model text,
  temperature numeric(4,2) default 0.7,
  max_tokens integer default 4096,
  is_active boolean default true,
  version integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- WORKFLOW SETTINGS
-- ============================================================
create table if not exists public.workflow_settings (
  id uuid primary key default gen_random_uuid(),
  workflow_slug text unique not null,
  workflow_name text not null,
  is_enabled boolean default true,
  credits_cost integer default 1,
  guest_daily_limit integer default 3,
  free_daily_limit integer default 10,
  premium_daily_limit integer default 100,
  daily_limit integer default 0,
  max_words integer default 5000,
  default_model text,
  fallback_model text,
  prompt_template text,
  temperature numeric(4,2) default 0.7,
  steps jsonb default '[]',
  config jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- WORKFLOW RUNS
-- ============================================================
create table if not exists public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  guest_id text,
  workflow_slug text not null,
  status text default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'cancelled')),
  input_data jsonb default '{}',
  output_data jsonb default '{}',
  steps_data jsonb default '[]',
  current_step integer default 0,
  total_steps integer default 0,
  credits_used integer default 0,
  error text,
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_workflow_runs_user on public.workflow_runs(user_id);
create index if not exists idx_workflow_runs_status on public.workflow_runs(status);
create index if not exists idx_workflow_runs_workflow on public.workflow_runs(workflow_slug);
create index if not exists idx_workflow_runs_created on public.workflow_runs(created_at);

-- ============================================================
-- AI LOGS (detailed AI usage per provider)
-- ============================================================
create table if not exists public.ai_logs (
  id uuid primary key default gen_random_uuid(),
  provider_slug text,
  model_name text,
  prompt_tokens integer default 0,
  completion_tokens integer default 0,
  total_tokens integer default 0,
  latency_ms integer default 0,
  cost numeric(12,8) default 0,
  success boolean default true,
  error text,
  workflow_slug text,
  created_at timestamptz default now()
);

create index if not exists idx_ai_logs_provider on public.ai_logs(provider_slug);
create index if not exists idx_ai_logs_created on public.ai_logs(created_at);

-- ============================================================
-- ADMIN AUDIT LOGS
-- ============================================================
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  section text not null,
  target_type text,
  target_id text,
  metadata jsonb default '{}',
  ip_address text,
  created_at timestamptz default now()
);

create index if not exists idx_admin_audit_logs_admin on public.admin_audit_logs(admin_id);
create index if not exists idx_admin_audit_logs_action on public.admin_audit_logs(action);
create index if not exists idx_admin_audit_logs_created on public.admin_audit_logs(created_at);

-- ============================================================
-- SITE SETTINGS (enhanced)
-- ============================================================
alter table public.site_settings add column if not exists category text default 'general';
alter table public.site_settings add column if not exists description text;

-- ============================================================
-- EMAIL SETTINGS
-- ============================================================
create table if not exists public.email_settings (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('resend', 'smtp', 'sendgrid', 'mailgun')),
  is_enabled boolean default true,
  config jsonb default '{}',
  from_name text default 'Nextill AI',
  from_email text,
  welcome_template text,
  reset_password_template text,
  contact_template text,
  notification_template text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SEO SETTINGS
-- ============================================================
create table if not exists public.seo_settings (
  id uuid primary key default gen_random_uuid(),
  meta_title text,
  meta_description text,
  robots_txt text,
  og_title text,
  og_description text,
  og_image text,
  twitter_card text default 'summary_large_image',
  twitter_site text,
  schema_json jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- INTEGRATION SETTINGS
-- ============================================================
create table if not exists public.integration_settings (
  id uuid primary key default gen_random_uuid(),
  provider_slug text unique not null,
  provider_name text not null,
  is_enabled boolean default false,
  api_key_encrypted text,
  config jsonb default '{}',
  is_connected boolean default false,
  last_synced_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- BACKUP EXPORTS
-- ============================================================
create table if not exists public.backup_exports (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('settings', 'prompts', 'providers', 'full')),
  status text default 'pending' check (status in ('pending', 'completed', 'failed')),
  data jsonb,
  file_url text,
  size_bytes integer default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================================
-- KEYWORD RESEARCH
-- ============================================================
create table if not exists public.keyword_research (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  seed_keyword text not null,
  country text default 'us',
  language text default 'en',
  niche text,
  keywords jsonb default '[]',
  long_tail_keywords jsonb default '[]',
  questions jsonb default '[]',
  related_keywords jsonb default '[]',
  lsi_keywords jsonb default '[]',
  nlp_terms jsonb default '[]',
  topical_map jsonb default '{}',
  total_results integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_keyword_research_user on public.keyword_research(user_id);
create index if not exists idx_keyword_research_created on public.keyword_research(created_at);

-- ============================================================
-- GENERATED POSTS
-- ============================================================
create table if not exists public.generated_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  keyword text not null,
  article_type text,
  word_count integer default 1000,
  language text default 'en',
  country text default 'us',
  tone text default 'professional',
  audience text default 'general',
  seo_title text,
  meta_description text,
  slug text,
  h1 text,
  sections jsonb default '[]',
  intro text,
  body text,
  faqs jsonb default '[]',
  conclusion text,
  cta text,
  internal_links jsonb default '[]',
  schema_json jsonb default '{}',
  tags jsonb default '[]',
  category_suggestions jsonb default '[]',
  seo_score integer default 0,
  human_score integer default 0,
  ai_score integer default 0,
  plagiarism_risk numeric(5,2) default 0,
  readability_grade text,
  reading_time integer default 0,
  content text,
  html_content text,
  markdown_content text,
  pipeline_steps jsonb default '[]',
  status text default 'completed',
  created_at timestamptz default now()
);

create index if not exists idx_generated_posts_user on public.generated_posts(user_id);
create index if not exists idx_generated_posts_created on public.generated_posts(created_at);

-- ============================================================
-- PLAGIARISM REPORTS
-- ============================================================
create table if not exists public.plagiarism_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  text_checked text,
  word_count integer default 0,
  originality_score numeric(5,2) default 100,
  duplicate_risk text check (duplicate_risk in ('low', 'medium', 'high', 'critical')),
  matched_phrases jsonb default '[]',
  sources jsonb default '[]',
  recommendation text,
  safe_to_publish boolean default true,
  engine text default 'local',
  created_at timestamptz default now()
);

create index if not exists idx_plagiarism_reports_user on public.plagiarism_reports(user_id);
create index if not exists idx_plagiarism_reports_created on public.plagiarism_reports(created_at);

-- ============================================================
-- SEED DATA: Workflow Settings
-- ============================================================
insert into public.workflow_settings (workflow_slug, workflow_name, is_enabled, credits_cost, guest_daily_limit, free_daily_limit, premium_daily_limit, max_words, default_model, steps) values
('keyword-intelligence', 'Keyword Intelligence', true, 3, 3, 10, 100, 0, 'gemini-2.0-flash', '["keyword_analysis", "long_tail", "questions", "related", "lsi", "nlp", "topical_map"]'),
('post-generator', 'Post Generator', true, 10, 1, 5, 50, 5000, 'gemini-2.0-flash', '["keyword_analysis", "seo_outline", "ai_writer", "humanizer", "rewriter", "grammar_check", "ai_detector", "plagiarism_check", "seo_title", "meta_description", "faq", "schema", "internal_links", "readability", "final_optimization"]'),
('plagiarism-checker', 'Plagiarism Checker', true, 4, 2, 5, 50, 0, 'gemini-2.0-flash', '["text_analysis", "source_matching", "scoring"]')
on conflict (workflow_slug) do nothing;

-- ============================================================
-- SEED DATA: Prompt Templates
-- ============================================================
insert into public.prompt_templates (slug, name, category, prompt_text) values
('keyword_intelligence', 'Keyword Intelligence', 'keyword', 'Analyze the seed keyword "{keyword}" for {country}/{language}. Generate: 1) Keyword table with difficulty, CPC, trend, intent 2) Long-tail keywords 3) Questions 4) Related keywords 5) LSI keywords 6) NLP terms 7) Topical map'),
('post_generator_outline', 'Post Generator Outline', 'outline', 'Create a detailed SEO outline for "{keyword}". Include H1, H2-H3 structure, intro points, body sections, FAQ ideas, CTA. Target {word_count} words for {audience} with {tone} tone.'),
('post_generator_writer', 'Post Generator Writer', 'writer', 'Write a comprehensive SEO article for "{keyword}". Follow this outline: {outline}. Target {word_count} words. Language: {language}. Tone: {tone}. Include relevant keywords naturally. Format with proper HTML headings.'),
('post_generator_humanizer', 'Post Generator Humanizer', 'humanizer', 'Humanize the following AI-generated content. Reduce AI patterns, vary sentence structure, add natural phrasing, use contractions, and make it sound like a human expert wrote it: {content}'),
('post_generator_rewriter', 'Post Generator Rewriter', 'rewriter', 'Rewrite the following content to improve clarity and engagement while preserving meaning and SEO value: {content}'),
('post_generator_grammar', 'Post Generator Grammar Check', 'grammar', 'Check and fix grammar, spelling, and punctuation in the following content. Return corrected version only: {content}'),
('post_generator_detector', 'Post Generator AI Detector', 'detector', 'Analyze this content for AI detection patterns. Return a score from 0-100 where 100 is definitely AI: {content}'),
('seo_title_generator', 'SEO Title Generator', 'seo', 'Generate 10 SEO-optimized title tags for "{keyword}" targeting {audience}. Each under 60 characters. Include primary keyword near the beginning.'),
('meta_description_generator', 'Meta Description Generator', 'seo', 'Generate 5 compelling meta descriptions for "{keyword}". Each between 150-160 characters. Include call to action.'),
('faq_generator', 'FAQ Generator', 'faq', 'Generate 8 frequently asked questions and answers about "{keyword}" for SEO schema markup.'),
('schema_generator', 'Schema Generator', 'schema', 'Generate JSON-LD schema markup for an article about "{keyword}". Include Article, FAQPage, and BreadcrumbList schemas.'),
('internal_links_generator', 'Internal Links Generator', 'links', 'Suggest 5 internal linking opportunities for an article about "{keyword}". Include anchor text and target topics.'),
('readability_checker', 'Readability Checker', 'readability', 'Analyze the readability of this content. Provide Flesch-Kincaid score, grade level, sentence stats, and suggestions: {content}'),
('final_optimization', 'Final Optimization', 'optimization', 'Perform final SEO optimization on this article. Check keyword density, heading structure, meta length, internal links, and overall quality score: {content}')
on conflict (slug) do nothing;

-- ============================================================
-- SEED DATA: AI Providers
-- ============================================================
insert into public.ai_providers (name, slug, enabled, priority, base_url, default_model, status, config) values
('Gemini', 'gemini', false, 1, 'https://generativelanguage.googleapis.com/v1beta', 'gemini-2.0-flash', 'inactive', '{"requires_api_key": true, "key_env_var": "GEMINI_API_KEY"}'),
('OpenAI', 'openai', false, 2, 'https://api.openai.com/v1', 'gpt-4o', 'inactive', '{"requires_api_key": true, "key_env_var": "OPENAI_API_KEY"}'),
('Claude', 'claude', false, 3, 'https://api.anthropic.com/v1', 'claude-3-sonnet-20240229', 'inactive', '{"requires_api_key": true, "key_env_var": "ANTHROPIC_API_KEY"}'),
('DeepSeek', 'deepseek', false, 4, 'https://api.deepseek.com/v1', 'deepseek-chat', 'inactive', '{"requires_api_key": true, "key_env_var": "DEEPSEEK_API_KEY"}'),
('Perplexity', 'perplexity', false, 5, 'https://api.perplexity.ai', 'sonar-pro', 'inactive', '{"requires_api_key": true, "key_env_var": "PERPLEXITY_API_KEY"}'),
('Mistral AI', 'mistral', false, 6, 'https://api.mistral.ai/v1', 'mistral-large-latest', 'inactive', '{"requires_api_key": true, "key_env_var": "MISTRAL_API_KEY"}'),
('Grok', 'grok', false, 7, 'https://api.x.ai/v1', 'grok-1', 'inactive', '{"requires_api_key": true, "key_env_var": "XAI_API_KEY"}'),
('OpenRouter', 'openrouter', false, 8, 'https://openrouter.ai/api/v1', 'openrouter/auto', 'inactive', '{"requires_api_key": true, "key_env_var": "OPENROUTER_API_KEY"}'),
('Together AI', 'togetherai', false, 9, 'https://api.together.xyz/v1', 'mistralai/Mixtral-8x7B-Instruct-v0.1', 'inactive', '{"requires_api_key": true, "key_env_var": "TOGETHER_API_KEY"}'),
('Fireworks', 'fireworks', false, 10, 'https://api.fireworks.ai/inference/v1', 'accounts/fireworks/models/llama-v3p1-70b-instruct', 'inactive', '{"requires_api_key": true, "key_env_var": "FIREWORKS_API_KEY"}'),
('Ollama', 'ollama', false, 11, 'http://localhost:11434', 'llama3', 'inactive', '{"requires_api_key": false}'),
('DataForSEO', 'dataforseo', false, 1, 'https://api.dataforseo.com', '', 'inactive', '{"requires_api_key": true, "key_env_var": "DATAFORSEO_API_KEY"}'),
('Copyleaks', 'copyleaks', false, 1, 'https://api.copyleaks.com/v3', '', 'inactive', '{"requires_api_key": true, "key_env_var": "COPYLEAKS_API_KEY"}')
on conflict (slug) do nothing;

-- ============================================================
-- SEED DATA: SEO Settings
-- ============================================================
insert into public.seo_settings (meta_title, meta_description) values
('Nextill AI | Premium SEO Content Platform', 'Nextill AI is an all-in-one AI platform for keyword research, SEO content generation, and plagiarism checking.')
on conflict do nothing;

-- ============================================================
-- SEED DATA: Integration Settings
-- ============================================================
insert into public.integration_settings (provider_slug, provider_name, is_enabled) values
('dataforseo', 'DataForSEO', false),
('copyleaks', 'Copyleaks', false),
('originality', 'Originality.ai', false),
('resend', 'Resend', false),
('stripe', 'Stripe', false),
('openai', 'OpenAI', false)
on conflict (provider_slug) do nothing;
