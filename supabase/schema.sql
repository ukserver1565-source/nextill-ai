-- ============================================================
-- Nextill AI — Combined Migration (all 14 files)
-- Generated: 2026-07-18T10:14:39.088Z
-- ============================================================


-- ============================================================
-- 001_core_tables.sql
-- ============================================================

-- 001_core_tables.sql
-- Core tables for Nextill AI

create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  full_name text,
  email text,
  role text default 'free_user' check (role in ('free_user', 'admin', 'super_admin')),
  plan text default 'free' check (plan in ('free', 'starter', 'pro', 'agency', 'enterprise')),
  credits integer default 100,
  avatar_url text,
  status text default 'active' check (status in ('active', 'suspended', 'inactive')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_plan on public.profiles(plan);
create index if not exists idx_profiles_status on public.profiles(status);

-- ============================================================
-- PLANS
-- ============================================================
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  price_monthly numeric(10,2) not null default 0,
  price_yearly numeric(10,2) not null default 0,
  credits integer not null default 0,
  features jsonb default '[]',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- TOOL SETTINGS
-- ============================================================
create table if not exists public.tool_settings (
  id uuid primary key default gen_random_uuid(),
  tool_slug text unique not null,
  tool_name text not null,
  is_enabled boolean default true,
  guest_daily_limit integer default 0,
  free_daily_limit integer default 5,
  premium_daily_limit integer default 100,
  credits_cost integer default 1,
  default_model text,
  prompt_template text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- AI MODELS
-- ============================================================
create table if not exists public.ai_models (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  model_name text not null,
  api_key_secret_name text,
  is_enabled boolean default true,
  is_default boolean default false,
  cost_input numeric(10,6) default 0,
  cost_output numeric(10,6) default 0,
  created_at timestamptz default now(),
  unique (provider, model_name)
);

-- ============================================================
-- PROJECTS
-- ============================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  domain text,
  seo_score integer default 0,
  pulse_score integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_created_at on public.projects(created_at);

-- ============================================================
-- DOCUMENTS
-- ============================================================
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  content text,
  tool_slug text,
  word_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_documents_user_id on public.documents(user_id);
create index if not exists idx_documents_project_id on public.documents(project_id);

-- ============================================================
-- USAGE LOGS
-- ============================================================
create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  guest_id text,
  tool_slug text not null,
  credits_used integer default 0,
  input_chars integer default 0,
  output_chars integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_usage_logs_user_id on public.usage_logs(user_id);
create index if not exists idx_usage_logs_tool_slug on public.usage_logs(tool_slug);
create index if not exists idx_usage_logs_created_at on public.usage_logs(created_at);

-- ============================================================
-- GUEST USAGE
-- ============================================================
create table if not exists public.guest_usage (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  fingerprint_hash text,
  tool_slug text not null,
  usage_count integer default 1,
  usage_date date not null default current_date,
  created_at timestamptz default now()
);

create index if not exists idx_guest_usage_ip_hash on public.guest_usage(ip_hash);
create index if not exists idx_guest_usage_fingerprint_hash on public.guest_usage(fingerprint_hash);
create unique index if not exists idx_guest_usage_ip_tool_date on public.guest_usage(ip_hash, tool_slug, usage_date);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_slug text not null,
  amount numeric(10,2) not null,
  currency text default 'USD',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  provider text default 'stripe',
  provider_payment_id text,
  created_at timestamptz default now()
);

create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_created_at on public.payments(created_at);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_slug text not null,
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired', 'past_due')),
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  created_at timestamptz default now()
);

create unique index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);

-- ============================================================
-- CREDITS
-- ============================================================
create table if not exists public.credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  balance integer default 0,
  updated_at timestamptz default now()
);

create unique index if not exists idx_credits_user_id on public.credits(user_id);

-- ============================================================
-- CREDIT LOGS
-- ============================================================
create table if not exists public.credit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount integer not null,
  type text not null check (type in ('added', 'removed', 'used')),
  reason text,
  created_at timestamptz default now()
);

create index if not exists idx_credit_logs_user_id on public.credit_logs(user_id);
create index if not exists idx_credit_logs_type on public.credit_logs(type);

-- ============================================================
-- CONTACT MESSAGES
-- ============================================================
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text default 'unread' check (status in ('unread', 'read', 'replied')),
  created_at timestamptz default now()
);

create index if not exists idx_contact_messages_status on public.contact_messages(status);

-- ============================================================
-- BLOG CATEGORIES
-- ============================================================
create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- ============================================================
-- BLOG POSTS
-- ============================================================
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  category_id uuid references public.blog_categories(id) on delete set null,
  status text default 'draft' check (status in ('draft', 'published')),
  seo_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_blog_posts_status on public.blog_posts(status);
create index if not exists idx_blog_posts_category_id on public.blog_posts(category_id);

-- ============================================================
-- COUPONS
-- ============================================================
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10,2) not null,
  usage_limit integer default 0,
  used_count integer default 0,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

create unique index if not exists idx_coupons_code on public.coupons(code);

-- ============================================================
-- API KEYS
-- ============================================================
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  key_hash text not null,
  name text not null,
  last_used_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_api_keys_user_id on public.api_keys(user_id);

-- ============================================================
-- SECURITY LOGS
-- ============================================================
create table if not exists public.security_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('login', 'failed_login', 'admin_action', 'api_call')),
  ip_hash text,
  user_agent text,
  created_at timestamptz default now()
);

create index if not exists idx_security_logs_event_type on public.security_logs(event_type);
create index if not exists idx_security_logs_created_at on public.security_logs(created_at);

-- ============================================================
-- ADMIN LOGS
-- ============================================================
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_admin_logs_created_at on public.admin_logs(created_at);

-- ============================================================
-- SITE SETTINGS
-- ============================================================
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}',
  updated_at timestamptz default now()
);

create unique index if not exists idx_site_settings_key on public.site_settings(key);

-- ============================================================
-- SYSTEM LOGS
-- ============================================================
create table if not exists public.system_logs (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('info', 'warn', 'error', 'debug')),
  message text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_system_logs_level on public.system_logs(level);
create index if not exists idx_system_logs_created_at on public.system_logs(created_at);


-- ============================================================
-- 002_rls_policies.sql
-- ============================================================

-- 002_rls_policies.sql
-- Row Level Security policies for Nextill AI

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
    and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
    and role = 'super_admin'
  );
$$;

-- ============================================================
-- PROFILES
-- ============================================================
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (user_id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (user_id = auth.uid());

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.is_admin());

-- ============================================================
-- PROJECTS
-- ============================================================
alter table public.projects enable row level security;

create policy "Users can insert own projects"
  on public.projects for insert
  with check (user_id = auth.uid());

create policy "Users can read own projects"
  on public.projects for select
  using (user_id = auth.uid());

create policy "Users can update own projects"
  on public.projects for update
  using (user_id = auth.uid());

create policy "Users can delete own projects"
  on public.projects for delete
  using (user_id = auth.uid());

create policy "Admins can read all projects"
  on public.projects for select
  using (public.is_admin());

create policy "Admins can delete all projects"
  on public.projects for delete
  using (public.is_admin());

-- ============================================================
-- DOCUMENTS
-- ============================================================
alter table public.documents enable row level security;

create policy "Users can insert own documents"
  on public.documents for insert
  with check (user_id = auth.uid());

create policy "Users can read own documents"
  on public.documents for select
  using (user_id = auth.uid());

create policy "Users can update own documents"
  on public.documents for update
  using (user_id = auth.uid());

create policy "Users can delete own documents"
  on public.documents for delete
  using (user_id = auth.uid());

create policy "Admins can read all documents"
  on public.documents for select
  using (public.is_admin());

create policy "Admins can delete all documents"
  on public.documents for delete
  using (public.is_admin());

-- ============================================================
-- CONTACT MESSAGES
-- ============================================================
alter table public.contact_messages enable row level security;

create policy "Anyone can insert contact messages"
  on public.contact_messages for insert
  with check (true);

create policy "Admins can read contact messages"
  on public.contact_messages for select
  using (public.is_admin());

create policy "Admins can update contact messages"
  on public.contact_messages for update
  using (public.is_admin());

create policy "Admins can delete contact messages"
  on public.contact_messages for delete
  using (public.is_admin());

-- ============================================================
-- BLOG POSTS
-- ============================================================
alter table public.blog_posts enable row level security;

create policy "Public can read published posts"
  on public.blog_posts for select
  using (status = 'published');

create policy "Admins can insert blog posts"
  on public.blog_posts for insert
  with check (public.is_admin());

create policy "Admins can read all blog posts"
  on public.blog_posts for select
  using (public.is_admin());

create policy "Admins can update blog posts"
  on public.blog_posts for update
  using (public.is_admin());

create policy "Admins can delete blog posts"
  on public.blog_posts for delete
  using (public.is_admin());

-- ============================================================
-- BLOG CATEGORIES
-- ============================================================
alter table public.blog_categories enable row level security;

create policy "Public can read blog categories"
  on public.blog_categories for select
  using (true);

create policy "Admins can insert blog categories"
  on public.blog_categories for insert
  with check (public.is_admin());

create policy "Admins can update blog categories"
  on public.blog_categories for update
  using (public.is_admin());

create policy "Admins can delete blog categories"
  on public.blog_categories for delete
  using (public.is_admin());

-- ============================================================
-- PLANS
-- ============================================================
alter table public.plans enable row level security;

create policy "Public can read active plans"
  on public.plans for select
  using (is_active = true);

create policy "Admins can insert plans"
  on public.plans for insert
  with check (public.is_admin());

create policy "Admins can read all plans"
  on public.plans for select
  using (public.is_admin());

create policy "Admins can update plans"
  on public.plans for update
  using (public.is_admin());

create policy "Admins can delete plans"
  on public.plans for delete
  using (public.is_admin());

-- ============================================================
-- TOOL SETTINGS
-- ============================================================
alter table public.tool_settings enable row level security;

create policy "Public can read enabled tool settings"
  on public.tool_settings for select
  using (is_enabled = true);

create policy "Admins can insert tool settings"
  on public.tool_settings for insert
  with check (public.is_admin());

create policy "Admins can read all tool settings"
  on public.tool_settings for select
  using (public.is_admin());

create policy "Admins can update tool settings"
  on public.tool_settings for update
  using (public.is_admin());

create policy "Admins can delete tool settings"
  on public.tool_settings for delete
  using (public.is_admin());

-- ============================================================
-- AI MODELS
-- ============================================================
alter table public.ai_models enable row level security;

create policy "Public can read enabled AI models"
  on public.ai_models for select
  using (is_enabled = true);

create policy "Admins can insert AI models"
  on public.ai_models for insert
  with check (public.is_admin());

create policy "Admins can read all AI models"
  on public.ai_models for select
  using (public.is_admin());

create policy "Admins can update AI models"
  on public.ai_models for update
  using (public.is_admin());

create policy "Admins can delete AI models"
  on public.ai_models for delete
  using (public.is_admin());

-- ============================================================
-- PAYMENTS
-- ============================================================
alter table public.payments enable row level security;

create policy "Users can insert own payments"
  on public.payments for insert
  with check (user_id = auth.uid());

create policy "Users can read own payments"
  on public.payments for select
  using (user_id = auth.uid());

create policy "Admins can read all payments"
  on public.payments for select
  using (public.is_admin());

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
alter table public.subscriptions enable row level security;

create policy "Users can read own subscriptions"
  on public.subscriptions for select
  using (user_id = auth.uid());

create policy "Admins can read all subscriptions"
  on public.subscriptions for select
  using (public.is_admin());

-- ============================================================
-- CREDITS
-- ============================================================
alter table public.credits enable row level security;

create policy "Users can read own credit balance"
  on public.credits for select
  using (user_id = auth.uid());

create policy "Admins can read all credit balances"
  on public.credits for select
  using (public.is_admin());

-- ============================================================
-- CREDIT LOGS
-- ============================================================
alter table public.credit_logs enable row level security;

create policy "Users can read own credit logs"
  on public.credit_logs for select
  using (user_id = auth.uid());

create policy "Admins can read all credit logs"
  on public.credit_logs for select
  using (public.is_admin());

-- ============================================================
-- USAGE LOGS
-- ============================================================
alter table public.usage_logs enable row level security;

create policy "Users can read own usage logs"
  on public.usage_logs for select
  using (user_id = auth.uid());

create policy "Admins can read all usage logs"
  on public.usage_logs for select
  using (public.is_admin());

-- ============================================================
-- GUEST USAGE
-- ============================================================
alter table public.guest_usage enable row level security;

create policy "Admins can read guest usage"
  on public.guest_usage for select
  using (public.is_admin());

-- ============================================================
-- COUPONS
-- ============================================================
alter table public.coupons enable row level security;

create policy "Public can read active coupons"
  on public.coupons for select
  using (is_active = true);

create policy "Admins can insert coupons"
  on public.coupons for insert
  with check (public.is_admin());

create policy "Admins can read all coupons"
  on public.coupons for select
  using (public.is_admin());

create policy "Admins can update coupons"
  on public.coupons for update
  using (public.is_admin());

create policy "Admins can delete coupons"
  on public.coupons for delete
  using (public.is_admin());

-- ============================================================
-- API KEYS
-- ============================================================
alter table public.api_keys enable row level security;

create policy "Users can read own API keys"
  on public.api_keys for select
  using (user_id = auth.uid());

create policy "Admins can read all API keys"
  on public.api_keys for select
  using (public.is_admin());

-- ============================================================
-- SECURITY LOGS
-- ============================================================
alter table public.security_logs enable row level security;

create policy "Admins can read security logs"
  on public.security_logs for select
  using (public.is_admin());

-- ============================================================
-- ADMIN LOGS
-- ============================================================
alter table public.admin_logs enable row level security;

create policy "Admins can read admin logs"
  on public.admin_logs for select
  using (public.is_admin());

create policy "Super admins can insert admin logs"
  on public.admin_logs for insert
  with check (public.is_super_admin());

-- ============================================================
-- SITE SETTINGS
-- ============================================================
alter table public.site_settings enable row level security;

create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

create policy "Admins can update site settings"
  on public.site_settings for update
  using (public.is_admin());

-- ============================================================
-- SYSTEM LOGS
-- ============================================================
alter table public.system_logs enable row level security;

create policy "Admins can read system logs"
  on public.system_logs for select
  using (public.is_admin());

-- ============================================================
-- AUTO-PROFILE CREATION ON USER SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name, role, plan, credits)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'free_user',
    'free',
    100
  );
  insert into public.credits (user_id, balance)
  values (new.id, 100);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- ============================================================
-- 003_seed.sql
-- ============================================================

-- 003_seed.sql
-- Seed data for Nextill AI
-- NOTE: id columns use gen_random_uuid() defaults; app lookups use slug/tool_slug/name

-- ============================================================
-- PLANS
-- ============================================================
insert into public.plans (name, slug, price_monthly, price_yearly, credits, features, is_active) values
('Free', 'free', 0, 0, 100, '["AI Writer (5/day)", "Basic tools", "1 project"]', true),
('Starter', 'starter', 29, 290, 2000, '["AI Writer (50/day)", "AI Humanizer", "AI Detector", "Plagiarism Checker", "SEO Title Generator", "Meta Description Generator", "3 projects"]', true),
('Pro', 'pro', 79, 790, 5000, '["All Starter features", "Keyword Research", "Website Audit", "10 projects", "Priority support"]', true),
('Agency', 'agency', 149, 1490, 15000, '["All Pro features", "Rank Tracker", "Backlink Checker", "50 projects", "Team (10 users)", "API access"]', true),
('Enterprise', 'enterprise', 299, 2990, 50000, '["All Agency features", "Unlimited projects", "Unlimited users", "Custom AI models", "Dedicated support", "SLA"]', true)
on conflict (slug) do nothing;

-- ============================================================
-- TOOL SETTINGS
-- ============================================================
insert into public.tool_settings (tool_slug, tool_name, is_enabled, guest_daily_limit, free_daily_limit, premium_daily_limit, credits_cost, default_model, prompt_template) values
('ai-writer', 'AI Writer', true, 1, 5, 100, 10, 'gpt-4o', 'Write a comprehensive article about {topic}'),
('ai-humanizer', 'AI Humanizer', true, 1, 3, 50, 5, 'gpt-4o', 'Humanize this text: {text}'),
('ai-detector', 'AI Detector', true, 1, 5, 100, 3, 'custom-detector', 'Analyze if this text is AI-generated: {text}'),
('plagiarism-checker', 'Plagiarism Checker', true, 1, 2, 30, 8, 'custom-plagiarism', 'Check plagiarism for: {text}'),
('seo-title-generator', 'SEO Title Generator', true, 2, 10, 200, 2, 'gpt-4o-mini', 'Generate SEO titles for: {topic}'),
('meta-description-generator', 'Meta Description Generator', true, 2, 10, 200, 2, 'gpt-4o-mini', 'Generate meta description for: {topic}'),
('keyword-research', 'Keyword Research', true, 1, 5, 50, 15, 'gpt-4o', 'Research keywords for: {niche}'),
('website-audit', 'Website Audit', true, 1, 1, 10, 25, 'custom-audit', 'Audit website: {url}'),
('rank-tracker', 'Rank Tracker', true, 1, 1, 20, 20, 'custom-rank', 'Track rankings for: {keyword}'),
('backlink-checker', 'Backlink Checker', true, 1, 1, 15, 18, 'custom-backlink', 'Analyze backlinks for: {url}')
on conflict (tool_slug) do nothing;

-- ============================================================
-- AI MODELS
-- ============================================================
insert into public.ai_models (provider, model_name, api_key_secret_name, is_enabled, is_default, cost_input, cost_output) values
('Google', 'Gemini Pro', 'GEMINI_API_KEY', true, true, 0.000002, 0.000003),
('OpenAI', 'GPT-4o', 'OPENAI_API_KEY', true, false, 0.000005, 0.000015),
('OpenAI', 'GPT-4o-mini', 'OPENAI_API_KEY', true, true, 0.000001, 0.000002),
('DeepSeek', 'DeepSeek V3', 'DEEPSEEK_API_KEY', true, false, 0.000001, 0.000002),
('Anthropic', 'Claude 3.5 Sonnet', 'ANTHROPIC_API_KEY', true, false, 0.000003, 0.000015)
on conflict (provider, model_name) do nothing;

-- ============================================================
-- BLOG CATEGORIES
-- ============================================================
insert into public.blog_categories (name, slug) values
('AI Writing', 'ai-writing'),
('SEO', 'seo'),
('Content Marketing', 'content-marketing'),
('Tools', 'tools')
on conflict (slug) do nothing;

-- ============================================================
-- SITE SETTINGS
-- ============================================================
insert into public.site_settings (key, value) values
('site_name', '{"value": "Nextill AI"}'),
('site_url', '{"value": "https://nextill.ai"}'),
('free_daily_limit', '{"value": 5}'),
('maintenance_mode', '{"value": false}'),
('contact_email', '{"value": "support@nextill.ai"}')
on conflict (key) do nothing;


-- ============================================================
-- 004_functions.sql
-- ============================================================

-- 004_functions.sql
-- Helper functions for Nextill AI

-- ============================================================
-- ADD CREDITS
-- ============================================================
create or replace function public.add_credits(p_user_id uuid, p_amount integer)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.credits (user_id, balance)
  values (p_user_id, p_amount)
  on conflict (user_id)
  do update set balance = public.credits.balance + p_amount, updated_at = now();
end;
$$;

-- ============================================================
-- DEDUCT CREDITS
-- ============================================================
create or replace function public.deduct_credits(p_user_id uuid, p_amount integer)
returns boolean
language plpgsql
security definer
as $$
declare
  current_balance integer;
begin
  select balance into current_balance from public.credits where user_id = p_user_id;
  if current_balance is null or current_balance < p_amount then
    return false;
  end if;
  update public.credits set balance = balance - p_amount, updated_at = now() where user_id = p_user_id;
  return true;
end;
$$;

-- ============================================================
-- GET USER CREDITS
-- ============================================================
create or replace function public.get_user_credits(p_user_id uuid)
returns integer
language plpgsql
stable
as $$
declare
  current_balance integer;
begin
  select balance into current_balance from public.credits where user_id = p_user_id;
  return coalesce(current_balance, 0);
end;
$$;


-- ============================================================
-- 005_enterprise_tables.sql
-- ============================================================

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


-- ============================================================
-- 005_fix_role_constraint.sql
-- ============================================================

-- ============================================================
-- 005_fix_role_constraint.sql
-- Idempotent migration to fix role constraint mismatch
-- The codebase uses "user" but the DB check constraint said "free_user"
-- ============================================================

-- Fix profiles role check constraint to match codebase
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'admin', 'super_admin'));

-- Fix handle_new_user trigger to use "user" instead of "free_user"
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name, role, plan, credits)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'user',
    'free',
    100
  );
  insert into public.credits (user_id, balance)
  values (new.id, 100)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Fix user-service.ts role fallback (sync with codebase)
-- No SQL change needed; the code already uses "user" when creating users

-- Add index on profiles.email for admin user search
create index if not exists idx_profiles_email on public.profiles(email);

-- Add index on credit_logs.created_at for dashboard queries
create index if not exists idx_credit_logs_created_at on public.credit_logs(created_at);

-- Add index on documents.tool_slug for document filtering
create index if not exists idx_documents_tool_slug on public.documents(tool_slug);

-- Add index on documents.updated_at for "recent documents" queries
create index if not exists idx_documents_updated_at on public.documents(updated_at);

-- Ensure RLS is enabled on all tables (idempotent)
-- (already enabled in 002_rls_policies.sql, re-asserting for safety)
alter table if exists public.profiles enable row level security;
alter table if exists public.projects enable row level security;
alter table if exists public.documents enable row level security;
alter table if exists public.contact_messages enable row level security;
alter table if exists public.blog_posts enable row level security;
alter table if exists public.blog_categories enable row level security;
alter table if exists public.plans enable row level security;
alter table if exists public.tool_settings enable row level security;
alter table if exists public.ai_models enable row level security;
alter table if exists public.payments enable row level security;
alter table if exists public.subscriptions enable row level security;
alter table if exists public.credits enable row level security;
alter table if exists public.credit_logs enable row level security;
alter table if exists public.usage_logs enable row level security;
alter table if exists public.guest_usage enable row level security;
alter table if exists public.coupons enable row level security;
alter table if exists public.api_keys enable row level security;
alter table if exists public.security_logs enable row level security;
alter table if exists public.admin_logs enable row level security;
alter table if exists public.site_settings enable row level security;
alter table if exists public.system_logs enable row level security;


-- ============================================================
-- 006_apply_missing_enterprise.sql
-- ============================================================

-- 006_apply_missing_enterprise.sql
-- Idempotent migration to create all enterprise tables that were never applied.
-- Safe to rerun. Uses IF NOT EXISTS for all CREATE statements.

-- ============================================================
-- AI PROVIDERS
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
-- AI API KEYS
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
-- AI LOGS
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
-- SEED: Workflow Settings (idempotent)
-- ============================================================
insert into public.workflow_settings (workflow_slug, workflow_name, is_enabled, credits_cost, guest_daily_limit, free_daily_limit, premium_daily_limit, max_words, default_model, steps) values
('keyword-intelligence', 'Keyword Intelligence', true, 3, 3, 10, 100, 0, 'gemini-2.0-flash', '["keyword_analysis", "long_tail", "questions", "related", "lsi", "nlp", "topical_map"]'),
('post-generator', 'Post Generator', true, 10, 1, 5, 50, 5000, 'gemini-2.0-flash', '["keyword_analysis", "seo_outline", "ai_writer", "humanizer", "rewriter", "grammar_check", "ai_detector", "plagiarism_check", "seo_title", "meta_description", "faq", "schema", "internal_links", "readability", "final_optimization"]'),
('plagiarism-checker', 'Plagiarism Checker', true, 4, 2, 5, 50, 0, 'gemini-2.0-flash', '["text_analysis", "source_matching", "scoring"]')
on conflict (workflow_slug) do nothing;

-- ============================================================
-- SEED: Prompt Templates (idempotent)
-- ============================================================
insert into public.prompt_templates (slug, name, category, prompt_text) values
('keyword_intelligence', 'Keyword Intelligence', 'keyword', 'Analyze the seed keyword "{keyword}" for {country}/{language}.'),
('post_generator_outline', 'Post Generator Outline', 'outline', 'Create a detailed SEO outline for "{keyword}".'),
('seo_title_generator', 'SEO Title Generator', 'seo', 'Generate 10 SEO-optimized title tags for "{keyword}".'),
('meta_description_generator', 'Meta Description Generator', 'seo', 'Generate 5 compelling meta descriptions for "{keyword}".'),
('faq_generator', 'FAQ Generator', 'faq', 'Generate 8 frequently asked questions about "{keyword}".')
on conflict (slug) do nothing;

-- ============================================================
-- SEED: AI Providers (idempotent)
-- ============================================================
insert into public.ai_providers (name, slug, enabled, priority, base_url, default_model, status, config) values
('Gemini', 'gemini', false, 1, 'https://generativelanguage.googleapis.com/v1beta', 'gemini-2.0-flash', 'inactive', '{"requires_api_key": true}'),
('OpenAI', 'openai', false, 2, 'https://api.openai.com/v1', 'gpt-4o', 'inactive', '{"requires_api_key": true}'),
('Claude', 'claude', false, 3, 'https://api.anthropic.com/v1', 'claude-3-sonnet-20240229', 'inactive', '{"requires_api_key": true}')
on conflict (slug) do nothing;

-- ============================================================
-- RLS Policies for new tables (idempotent)
-- ============================================================
alter table public.ai_providers enable row level security;
alter table public.ai_api_keys enable row level security;
alter table public.prompt_templates enable row level security;
alter table public.workflow_settings enable row level security;
alter table public.workflow_runs enable row level security;
alter table public.ai_logs enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.integration_settings enable row level security;
alter table public.backup_exports enable row level security;
alter table public.keyword_research enable row level security;
alter table public.generated_posts enable row level security;
alter table public.plagiarism_reports enable row level security;
alter table public.email_settings enable row level security;
alter table public.seo_settings enable row level security;


-- ============================================================
-- 007_fix_role_constraint_idempotent.sql
-- ============================================================

-- 007_fix_role_constraint_idempotent.sql
-- Idempotent fix for the role check constraint.
-- 005_fix_role_constraint.sql has a bare ADD CONSTRAINT that fails on rerun.
-- This migration safely drops and recreates the constraint.
--
-- IMPORTANT: The codebase uses 'free_user' as the default role (user-service.ts line 39).
-- The correct constraint must include 'free_user', NOT 'user'.

-- ============================================================
-- 1. Fix the role check constraint (idempotent)
-- ============================================================
DO $$ BEGIN
  -- Drop old constraint if it exists (from 001_core_tables.sql or 005)
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
EXCEPTION WHEN undefined_object THEN
  -- Constraint doesn't exist, nothing to drop
  NULL;
END $$;

DO $$ BEGIN
  -- Add the correct constraint: free_user (default), admin, super_admin
  -- Note: 005_fix_role_constraint.sql incorrectly changed 'free_user' to 'user'.
  -- The codebase (user-service.ts) uses 'free_user', so we keep it.
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('free_user', 'admin', 'super_admin'));
EXCEPTION WHEN duplicate_object THEN
  -- Constraint already exists with correct definition, skip
  NULL;
END $$;

-- ============================================================
-- 2. Fix handle_new_user trigger (from 005 — idempotent)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role, plan, credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    'free_user',
    'free',
    100
  );
  INSERT INTO public.credits (user_id, balance)
  VALUES (NEW.id, 100)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 3. Indexes from 005 (idempotent)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_credit_logs_created_at ON public.credit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_tool_slug ON public.documents(tool_slug);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON public.documents(updated_at);


-- ============================================================
-- 008_domain_intelligence.sql
-- ============================================================

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


-- ============================================================
-- 009_admin_permissions_and_prompt_fix.sql
-- ============================================================

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


-- ============================================================
-- 010_monetization_architecture.sql
-- ============================================================

-- Migration 010: Monetization Architecture
-- Extends existing tables + creates coupon_redemptions
-- Idempotent, non-destructive, safe to rerun

-- ============================================================
-- 1. Extend plans table with limit columns
-- ============================================================
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_projects integer DEFAULT 5;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_documents integer DEFAULT 50;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_article_length integer DEFAULT 2000;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_reports_per_month integer DEFAULT 20;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS report_history_days integer DEFAULT 30;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS badge text;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS is_popular boolean DEFAULT false;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS exports jsonb DEFAULT '["txt","markdown"]'::jsonb;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS support_level text DEFAULT 'email';
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS target_audience text;

-- ============================================================
-- 2. Extend subscriptions with billing_cycle + provider
-- ============================================================
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'));
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS provider text DEFAULT 'paddle';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS provider_subscription_id text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Drop the old unique index on user_id (one user can have multiple subs over time)
DROP INDEX IF EXISTS idx_subscriptions_user_id;
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- ============================================================
-- 3. Extend coupons with full coupon system columns
-- ============================================================
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS coupon_type text DEFAULT 'percentage' CHECK (coupon_type IN ('percentage', 'fixed', 'free_trial', 'first_payment', 'bonus_credits'));
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS bonus_credits integer DEFAULT 0;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS applicable_plan text;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'both' CHECK (billing_cycle IN ('monthly', 'yearly', 'both'));
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS min_amount numeric(10,2) DEFAULT 0;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS max_per_user integer DEFAULT 1;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS new_users_only boolean DEFAULT false;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS first_payment_only boolean DEFAULT false;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================================
-- 4. Create coupon_redemptions table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  discount_applied numeric(10,2) DEFAULT 0,
  credits_granted integer DEFAULT 0,
  billing_cycle text,
  plan_slug text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON public.coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user ON public.coupon_redemptions(user_id);

-- ============================================================
-- 5. Extend payments with more fields
-- ============================================================
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'));
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS final_amount numeric(10,2);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS webhook_verified boolean DEFAULT false;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- ============================================================
-- 6. Extend credit_logs with more transaction types
-- ============================================================
ALTER TABLE public.credit_logs ADD COLUMN IF NOT EXISTS balance_after integer;
ALTER TABLE public.credit_logs ADD COLUMN IF NOT EXISTS reference_id uuid;
ALTER TABLE public.credit_logs ADD COLUMN IF NOT EXISTS reference_type text;

-- ============================================================
-- 7. Update existing plans to the 3 paid plans + free
-- ============================================================
-- Free plan
UPDATE public.plans SET
  name = 'Free', slug = 'free', price_monthly = 0, price_yearly = 0, credits = 100,
  features = '["1 Domain Intelligence check/day","1 Post Generator test/day","1 Plagiarism check/day","Local/basic engines only","1 project","10 documents"]'::jsonb,
  max_projects = 1, max_documents = 10, max_article_length = 1500, max_reports_per_month = 1,
  report_history_days = 7, sort_order = 0, badge = NULL, is_popular = false,
  exports = '["txt"]'::jsonb, support_level = 'community',
  target_audience = 'Try Nextill AI with limited free access'
WHERE slug = 'free';

-- Starter plan ($19/mo, $190/yr)
UPDATE public.plans SET
  name = 'Starter', slug = 'starter', price_monthly = 19, price_yearly = 190, credits = 2000,
  features = '["Domain Intelligence — basic analysis","Keyword ideas & local data","20 saved reports/month","Post Generator — up to 2,000 words","AI generation, humanization, grammar","SEO title, meta, FAQ, schema","Plagiarism & Authenticity — local checks","5 projects","50 documents","30-day report history","TXT & Markdown exports","Email support"]'::jsonb,
  max_projects = 5, max_documents = 50, max_article_length = 2000, max_reports_per_month = 20,
  report_history_days = 30, sort_order = 1, badge = NULL, is_popular = false,
  exports = '["txt","markdown"]'::jsonb, support_level = 'email',
  target_audience = 'New creators, bloggers, solo SEO users'
WHERE slug = 'starter';

-- Pro plan ($49/mo, $490/yr) — MOST POPULAR
UPDATE public.plans SET
  name = 'Pro', slug = 'pro', price_monthly = 49, price_yearly = 490, credits = 7500,
  features = '["Everything in Starter","Domain Intelligence — full live metrics","Volume, KD, CPC, intent, trend","Competitor & backlink analysis","100 saved reports/month","Post Generator — up to 5,000 words","Priority provider routing","Advanced humanization","AI detection & live plagiarism","25 projects","500 documents","1-year report history","PDF, CSV, TXT, Markdown exports","Priority email support"]'::jsonb,
  max_projects = 25, max_documents = 500, max_article_length = 5000, max_reports_per_month = 100,
  report_history_days = 365, sort_order = 2, badge = 'MOST POPULAR', is_popular = true,
  exports = '["pdf","csv","txt","markdown"]'::jsonb, support_level = 'priority',
  target_audience = 'Professional bloggers, SEO specialists, content marketers'
WHERE slug = 'pro';

-- Business plan ($99/mo, $990/yr)
UPDATE public.plans SET
  name = 'Business', slug = 'business', price_monthly = 99, price_yearly = 990, credits = 20000,
  features = '["Everything in Pro","500 saved reports/month","Bulk keyword analysis","Advanced competitor reports","Advanced backlink reports","Post Generator — up to 10,000 words","100 projects","5,000 documents","Unlimited report history","All export formats","Priority support","Business usage rights"]'::jsonb,
  max_projects = 100, max_documents = 5000, max_article_length = 10000, max_reports_per_month = 500,
  report_history_days = 9999, sort_order = 3, badge = NULL, is_popular = false,
  exports = '["pdf","csv","txt","markdown"]'::jsonb, support_level = 'priority',
  target_audience = 'Agencies, SEO teams, high-volume publishers'
WHERE slug = 'business';

-- Deactivate Agency and Enterprise (not part of the 3 primary plans)
UPDATE public.plans SET is_active = false WHERE slug IN ('agency', 'enterprise');

-- ============================================================
-- 8. Update workflow_settings credit costs
-- ============================================================
UPDATE public.workflow_settings SET credits_cost = 2 WHERE workflow_slug = 'keyword-intelligence';
UPDATE public.workflow_settings SET credits_cost = 10 WHERE workflow_slug = 'post-generator';
UPDATE public.workflow_settings SET credits_cost = 4 WHERE workflow_slug = 'plagiarism-checker';

-- Insert domain-intelligence credit cost if missing
INSERT INTO public.workflow_settings (workflow_slug, workflow_name, is_enabled, credits_cost, guest_daily_limit, free_daily_limit, premium_daily_limit)
VALUES ('domain-intelligence', 'Domain Intelligence', true, 2, 1, 5, 100)
ON CONFLICT (workflow_slug) DO UPDATE SET credits_cost = 2;

-- ============================================================
-- 9. RLS policies for new/extended tables
-- ============================================================
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coupon_redemptions_user_policy' AND tablename = 'coupon_redemptions') THEN
    CREATE POLICY coupon_redemptions_user_policy ON coupon_redemptions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coupon_redemptions_admin_policy' AND tablename = 'coupon_redemptions') THEN
    CREATE POLICY coupon_redemptions_admin_policy ON coupon_redemptions
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
      );
  END IF;
END $$;

-- Ensure plans are readable by everyone
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'plans_public_read' AND tablename = 'plans') THEN
    CREATE POLICY plans_public_read ON plans FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'plans_admin_write' AND tablename = 'plans') THEN
    CREATE POLICY plans_admin_write ON plans FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
    );
  END IF;
END $$;

-- Ensure subscriptions have proper policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'subscriptions_user_policy' AND tablename = 'subscriptions') THEN
    CREATE POLICY subscriptions_user_policy ON subscriptions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure payments have proper policies
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'payments_user_policy' AND tablename = 'payments') THEN
    CREATE POLICY payments_user_policy ON payments
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- 011_final_production_architecture.sql
-- ============================================================

-- ================================================================
-- MIGRATION 011: FINAL PRODUCTION ARCHITECTURE
-- Nextill AI (formerly AdultPulse AI)
-- Enterprise-grade database synchronization, credit system,
-- workspaces, plan sync, RLS, and data repair.
--
-- This migration is FULLY IDEMPOTENT and PRODUCTION-SAFE.
-- Running it multiple times will NOT fail and will NOT lose data.
-- No existing tables are dropped. No user data is deleted.
-- auth.users is NEVER recreated.
-- ================================================================

-- Ensure pgcrypto is available (for gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;

-- ============================================================
-- SECTION 1: GENERIC HELPER FUNCTIONS
-- ============================================================

-- Generic updated_at trigger function (reusable for all tables)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- SECTION 2: WORKSPACES TABLE
-- Every user gets a default workspace. No orphan projects.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.workspaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT 'Default Workspace',
  slug        TEXT,
  is_default  BOOLEAN DEFAULT true,
  settings    JSONB DEFAULT '{}'::JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- One default workspace per user (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_workspaces_user_default
  ON public.workspaces(user_id) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id
  ON public.workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_created_at
  ON public.workspaces(created_at);

-- ============================================================
-- SECTION 3: CREDIT TRANSACTIONS (Enterprise Ledger)
-- Every deduction, refund, renewal logged. No silent changes.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN (
                    'deduction', 'refund', 'monthly_renewal', 'signup_bonus',
                    'admin_adjustment', 'coupon_bonus', 'payment_bonus', 'plan_change'
                  )),
  amount          INTEGER NOT NULL,  -- positive = credit, negative = debit
  balance_after   INTEGER NOT NULL,
  reference_type  TEXT,              -- 'workflow_run', 'payment', 'coupon', 'admin', 'subscription'
  reference_id    UUID,
  description     TEXT,
  metadata        JSONB DEFAULT '{}'::JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_tx_user_id
  ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_tx_type
  ON public.credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_tx_reference
  ON public.credit_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_credit_tx_created
  ON public.credit_transactions(created_at);

-- ============================================================
-- SECTION 4: PROVIDER STATUSES
-- Track external provider health and keys.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.provider_statuses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider      TEXT NOT NULL UNIQUE,
  display_name  TEXT,
  enabled       BOOLEAN DEFAULT false,
  connected     BOOLEAN DEFAULT false,
  last_checked  TIMESTAMPTZ,
  last_error    TEXT,
  masked_key    TEXT,
  metadata      JSONB DEFAULT '{}'::JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_statuses_provider
  ON public.provider_statuses(provider);

-- Seed known providers (idempotent)
INSERT INTO public.provider_statuses (provider, display_name, enabled)
VALUES
  ('gemini',   'Google Gemini',  false),
  ('semrush',  'Semrush',        false),
  ('copyleaks','Copyleaks',      false),
  ('gptzero',  'GPTZero',        false),
  ('openai',   'OpenAI',         false),
  ('deepseek', 'DeepSeek',       false)
ON CONFLICT (provider) DO NOTHING;

-- ============================================================
-- SECTION 5: ADD WORKSPACE_ID TO PROJECTS
-- ============================================================

-- Add column (nullable initially for backfill)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS workspace_id UUID;

-- Add updated_at to subscriptions (was never added in 001 or 010)
-- Required by admin_change_user_plan() and audit triggers
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================
-- SECTION 6: CHECK CONSTRAINTS UPDATE
-- ============================================================

-- profiles.plan: add 'business' to allowed values
DO $$
DECLARE
  v_constraint_name TEXT;
BEGIN
  SELECT c.conname INTO v_constraint_name
  FROM pg_constraint c
  WHERE c.conrelid = 'public.profiles'::regclass
    AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) LIKE '%plan%'
    AND pg_get_constraintdef(c.oid) LIKE '%free%'
  LIMIT 1;

  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', v_constraint_name);
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'business', 'agency', 'enterprise'));

-- payments.status: add Paddle/JazzCash states
DO $$
DECLARE
  v_constraint_name TEXT;
BEGIN
  SELECT c.conname INTO v_constraint_name
  FROM pg_constraint c
  WHERE c.conrelid = 'public.payments'::regclass
    AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) LIKE '%status%'
    AND pg_get_constraintdef(c.oid) LIKE '%pending%'
  LIMIT 1;

  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.payments DROP CONSTRAINT %I', v_constraint_name);
  END IF;
END $$;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_status_check
  CHECK (status IN ('pending', 'processing', 'completed', 'paid', 'failed', 'cancelled', 'refunded'));

-- credits.balance: prevent negative
DO $$
BEGIN
  -- Fix any existing negative balances
  UPDATE public.credits SET balance = 0 WHERE balance < 0;

  -- Add constraint if missing
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.credits'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%>= 0%'
  ) THEN
    ALTER TABLE public.credits ADD CONSTRAINT credits_balance_non_negative CHECK (balance >= 0);
  END IF;
END $$;

-- ============================================================
-- SECTION 7: CREDIT SYSTEM FUNCTIONS
-- ============================================================

-- Core ledger function: creates a transaction, updates balance
CREATE OR REPLACE FUNCTION public.create_credit_transaction(
  p_user_id         UUID,
  p_type            TEXT,
  p_amount          INTEGER,
  p_reference_type  TEXT DEFAULT NULL,
  p_reference_id    UUID DEFAULT NULL,
  p_description     TEXT DEFAULT NULL,
  p_metadata        JSONB DEFAULT '{}'::JSONB
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance     INTEGER;
BEGIN
  -- Get current balance
  SELECT balance INTO v_current_balance
  FROM public.credits
  WHERE user_id = p_user_id;

  v_current_balance := COALESCE(v_current_balance, 0);
  v_new_balance := v_current_balance + p_amount;

  -- Prevent negative balance
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient credits. Current: %, Requested change: %, Result would be: %',
      v_current_balance, p_amount, v_new_balance;
  END IF;

  -- Upsert credits balance
  INSERT INTO public.credits (user_id, balance, updated_at)
  VALUES (p_user_id, v_new_balance, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET balance = v_new_balance, updated_at = NOW();

  -- Log to credit_transactions (enterprise ledger)
  INSERT INTO public.credit_transactions (
    user_id, type, amount, balance_after,
    reference_type, reference_id, description, metadata
  ) VALUES (
    p_user_id, p_type, p_amount, v_new_balance,
    p_reference_type, p_reference_id, p_description, p_metadata
  );

  -- Also log to credit_logs (backward compatibility with existing queries)
  INSERT INTO public.credit_logs (
    user_id, amount, type, reason, balance_after, reference_id, reference_type
  ) VALUES (
    p_user_id, p_amount,
    CASE WHEN p_amount >= 0 THEN 'added' ELSE 'used' END,
    p_description, v_new_balance, p_reference_id, p_reference_type
  );

  RETURN v_new_balance;
END;
$$;

-- Replace add_credits with ledger-backed version (backward-compatible signature)
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id    UUID,
  p_amount     INTEGER,
  p_reason     TEXT DEFAULT 'Credit addition',
  p_ref_type   TEXT DEFAULT NULL,
  p_ref_id     UUID DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_amount <= 0 THEN RETURN; END IF;

  PERFORM public.create_credit_transaction(
    p_user_id, 'admin_adjustment', p_amount,
    p_ref_type, p_ref_id, p_reason
  );
END;
$$;

-- Replace deduct_credits with ledger-backed version
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id    UUID,
  p_amount     INTEGER,
  p_reason     TEXT DEFAULT 'Credit deduction',
  p_ref_type   TEXT DEFAULT NULL,
  p_ref_id     UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_amount <= 0 THEN RETURN false; END IF;

  BEGIN
    PERFORM public.create_credit_transaction(
      p_user_id, 'deduction', -p_amount,
      p_ref_type, p_ref_id, p_reason
    );
    RETURN true;
  EXCEPTION WHEN OTHERS THEN
    RETURN false;
  END;
END;
$$;

-- Refund credits (for failed workflows, cancelled payments, etc.)
CREATE OR REPLACE FUNCTION public.refund_credits(
  p_user_id    UUID,
  p_amount     INTEGER,
  p_ref_type   TEXT DEFAULT NULL,
  p_ref_id     UUID DEFAULT NULL,
  p_reason     TEXT DEFAULT 'Credit refund'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_amount <= 0 THEN RETURN false; END IF;

  PERFORM public.create_credit_transaction(
    p_user_id, 'refund', p_amount,
    p_ref_type, p_ref_id, p_reason
  );
  RETURN true;
END;
$$;

-- Monthly credit renewal (call via cron/scheduler)
CREATE OR REPLACE FUNCTION public.monthly_credit_renewal(
  p_user_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_slug    TEXT;
  v_plan_credits INTEGER;
BEGIN
  -- Get user's current plan
  SELECT plan INTO v_plan_slug
  FROM public.profiles
  WHERE user_id = p_user_id;

  -- Get plan's credit allocation
  SELECT credits INTO v_plan_credits
  FROM public.plans
  WHERE slug = COALESCE(v_plan_slug, 'free');

  v_plan_credits := COALESCE(v_plan_credits, 100);

  -- Reset credits to plan allocation
  PERFORM public.create_credit_transaction(
    p_user_id, 'monthly_renewal', v_plan_credits,
    'subscription', NULL,
    'Monthly credit renewal for ' || COALESCE(v_plan_slug, 'free') || ' plan'
  );
END;
$$;

-- ============================================================
-- SECTION 8: PLAN SYNCHRONIZATION
-- One source of truth. Changing plan syncs everything.
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_change_user_plan(
  p_user_id    UUID,
  p_plan_slug  TEXT,
  p_admin_id   UUID DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan         RECORD;
  v_old_plan     TEXT;
  v_current_bal  INTEGER;
  v_delta        INTEGER;
BEGIN
  -- Get target plan
  SELECT * INTO v_plan
  FROM public.plans
  WHERE slug = p_plan_slug AND is_active = true;

  IF v_plan IS NULL THEN
    RAISE EXCEPTION 'Plan % not found or inactive', p_plan_slug;
  END IF;

  -- Get current state
  SELECT plan INTO v_old_plan FROM public.profiles WHERE user_id = p_user_id;
  SELECT balance INTO v_current_bal FROM public.credits WHERE user_id = p_user_id;
  v_current_bal := COALESCE(v_current_bal, 0);

  -- 1. Update profiles.plan and set credits to plan allocation
  UPDATE public.profiles
  SET plan    = p_plan_slug,
      credits = v_plan.credits,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 2. Sync subscription (update active or create new)
  UPDATE public.subscriptions
  SET plan_slug = p_plan_slug, updated_at = NOW()
  WHERE user_id = p_user_id AND status = 'active';

  IF NOT FOUND THEN
    INSERT INTO public.subscriptions (
      user_id, plan_slug, status, current_period_start, current_period_end, created_at
    ) VALUES (
      p_user_id, p_plan_slug, 'active',
      NOW(), NOW() + INTERVAL '30 days', NOW()
    );
  END IF;

  -- 3. Sync credits (adjust to plan allocation)
  v_delta := v_plan.credits - v_current_bal;
  IF v_delta != 0 THEN
    PERFORM public.create_credit_transaction(
      p_user_id,
      'plan_change',
      v_delta,
      'plan',
      NULL,
      'Plan changed from ' || COALESCE(v_old_plan, 'none') || ' to ' || p_plan_slug,
      jsonb_build_object(
        'old_plan', v_old_plan,
        'new_plan', p_plan_slug,
        'old_balance', v_current_bal,
        'new_balance', v_plan.credits,
        'admin_id', p_admin_id
      )
    );
  END IF;

  -- 4. Audit log
  INSERT INTO public.admin_audit_logs (
    admin_id, action, section, target_type, target_id, metadata
  ) VALUES (
    p_admin_id, 'plan_changed', 'billing', 'user', p_user_id::TEXT,
    jsonb_build_object('old_plan', v_old_plan, 'new_plan', p_plan_slug, 'credits', v_plan.credits)
  );
END;
$$;

-- ============================================================
-- SECTION 9: AUTH <-> PROFILE SYNC
-- Every auth user always has exactly one profile.
-- Email changes sync automatically.
-- ============================================================

CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  v_full_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Upsert profile (creates if missing, updates email if changed)
  INSERT INTO public.profiles (user_id, email, full_name, role, plan, credits, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    'free_user',
    'free',
    100,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email      = EXCLUDED.email,
    full_name  = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = NOW();

  -- Upsert credits record
  INSERT INTO public.credits (user_id, balance, updated_at)
  VALUES (NEW.id, 100, NOW())
  ON CONFLICT (user_id) DO NOTHING;

  -- Create default workspace if none exists
  IF NOT EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE user_id = NEW.id AND is_default = true
  ) THEN
    INSERT INTO public.workspaces (user_id, name, is_default)
    VALUES (NEW.id, v_full_name || '''s Workspace', true);
  END IF;

  RETURN NEW;
END;
$$;

-- Replace existing trigger (drop old, create new)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_user_profile();

-- Email sync trigger: when auth.users email changes, profile updates
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    UPDATE public.profiles
    SET email = NEW.email, updated_at = NOW()
    WHERE user_id = NEW.id AND email != NEW.email;
  END IF;

  -- Also sync full_name if it changed in metadata
  IF COALESCE(OLD.raw_user_meta_data ->> 'full_name', '') IS DISTINCT FROM
     COALESCE(NEW.raw_user_meta_data ->> 'full_name', '') THEN
    UPDATE public.profiles
    SET full_name = COALESCE(NEW.raw_user_meta_data ->> 'full_name', full_name),
        updated_at = NOW()
    WHERE user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_email();

-- ============================================================
-- SECTION 10: WORKSPACE AUTO-ASSIGNMENT FOR PROJECTS
-- No orphan projects ever.
-- ============================================================

CREATE OR REPLACE FUNCTION public.auto_assign_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id UUID;
BEGIN
  IF NEW.workspace_id IS NULL THEN
    -- Find user's default workspace
    SELECT id INTO v_workspace_id
    FROM public.workspaces
    WHERE user_id = NEW.user_id AND is_default = true
    LIMIT 1;

    -- Create default workspace if none exists
    IF v_workspace_id IS NULL THEN
      INSERT INTO public.workspaces (user_id, name, is_default)
      VALUES (NEW.user_id, 'Default Workspace', true)
      RETURNING id INTO v_workspace_id;
    END IF;

    NEW.workspace_id := v_workspace_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_assign_workspace ON public.projects;
CREATE TRIGGER auto_assign_workspace
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_workspace();

-- ============================================================
-- SECTION 11: ADMIN USER CREATION
-- Single function call creates everything.
-- ============================================================

-- For use AFTER auth.admin.createUser() creates the auth user.
-- The trigger ensures profile + credits + workspace exist.
-- This function adds plan assignment + audit logging.
CREATE OR REPLACE FUNCTION public.admin_setup_new_user(
  p_user_id    UUID,
  p_email      TEXT,
  p_full_name  TEXT DEFAULT NULL,
  p_plan_slug  TEXT DEFAULT 'free',
  p_admin_id   UUID DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure profile exists (trigger should have created it, but be safe)
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = p_user_id) THEN
    INSERT INTO public.profiles (user_id, email, full_name, role, plan, credits, created_at, updated_at)
    VALUES (p_user_id, p_email, COALESCE(p_full_name, split_part(p_email, '@', 1)), 'free_user', 'free', 100, NOW(), NOW());
  END IF;

  -- Ensure workspace exists
  IF NOT EXISTS (
    SELECT 1 FROM public.workspaces WHERE user_id = p_user_id AND is_default = true
  ) THEN
    INSERT INTO public.workspaces (user_id, name, is_default)
    VALUES (p_user_id, COALESCE(p_full_name, split_part(p_email, '@', 1)) || '''s Workspace', true);
  END IF;

  -- Apply plan if not free
  IF p_plan_slug != 'free' THEN
    PERFORM public.admin_change_user_plan(p_user_id, p_plan_slug, p_admin_id);
  END IF;

  -- Audit log
  INSERT INTO public.admin_audit_logs (
    admin_id, action, section, target_type, target_id, metadata
  ) VALUES (
    p_admin_id, 'create_user', 'users', 'user', p_user_id::TEXT,
    jsonb_build_object('email', p_email, 'full_name', p_full_name, 'plan', p_plan_slug)
  );
END;
$$;

-- ============================================================
-- SECTION 12: AUDIT TRIGGERS
-- Automatically log plan changes, credit changes, etc.
-- ============================================================

-- Audit profile plan/role changes
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log plan changes
  IF OLD.plan IS DISTINCT FROM NEW.plan THEN
    INSERT INTO public.admin_audit_logs (action, section, target_type, target_id, metadata)
    VALUES (
      'plan_changed', 'billing', 'user', NEW.user_id::TEXT,
      jsonb_build_object('old_plan', OLD.plan, 'new_plan', NEW.plan)
    );
  END IF;

  -- Log role changes
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.admin_audit_logs (action, section, target_type, target_id, metadata)
    VALUES (
      'role_changed', 'users', 'user', NEW.user_id::TEXT,
      jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role)
    );
  END IF;

  -- Log credit changes
  IF OLD.credits IS DISTINCT FROM NEW.credits THEN
    INSERT INTO public.admin_audit_logs (action, section, target_type, target_id, metadata)
    VALUES (
      'credits_changed', 'billing', 'user', NEW.user_id::TEXT,
      jsonb_build_object('old_credits', OLD.credits, 'new_credits', NEW.credits)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_profile_changes ON public.profiles;
CREATE TRIGGER audit_profile_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.plan IS DISTINCT FROM NEW.plan
     OR OLD.role IS DISTINCT FROM NEW.role
     OR OLD.credits IS DISTINCT FROM NEW.credits)
  EXECUTE FUNCTION public.audit_profile_changes();

-- Audit subscription status changes
CREATE OR REPLACE FUNCTION public.audit_subscription_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status OR OLD.plan_slug IS DISTINCT FROM NEW.plan_slug THEN
    INSERT INTO public.admin_audit_logs (action, section, target_type, target_id, metadata)
    VALUES (
      'subscription_changed', 'billing', 'user', NEW.user_id::TEXT,
      jsonb_build_object(
        'old_status', OLD.status, 'new_status', NEW.status,
        'old_plan', OLD.plan_slug, 'new_plan', NEW.plan_slug
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_subscription_changes ON public.subscriptions;
CREATE TRIGGER audit_subscription_changes
  AFTER UPDATE ON public.subscriptions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status
     OR OLD.plan_slug IS DISTINCT FROM NEW.plan_slug)
  EXECUTE FUNCTION public.audit_subscription_changes();

-- Audit payment status changes
CREATE OR REPLACE FUNCTION public.audit_payment_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.admin_audit_logs (action, section, target_type, target_id, metadata)
    VALUES (
      'payment_status_changed', 'billing', 'payment', NEW.id::TEXT,
      jsonb_build_object(
        'user_id', NEW.user_id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'amount', NEW.amount,
        'plan', NEW.plan_slug
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_payment_changes ON public.payments;
CREATE TRIGGER audit_payment_changes
  AFTER UPDATE ON public.payments
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.audit_payment_changes();

-- ============================================================
-- SECTION 13: UPDATED_AT TRIGGERS
-- Apply to all tables with updated_at columns.
-- ============================================================

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'profiles', 'projects', 'documents', 'credits',
    'prompt_templates', 'workflow_settings',
    'ai_providers', 'ai_api_keys',
    'email_settings', 'seo_settings', 'integration_settings',
    'blog_posts', 'workspaces', 'provider_statuses'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- Create trigger only if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'trg_' || t || '_updated_at'
        AND tgrelid = ('public.' || t)::regclass
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON public.%s FOR EACH ROW EXECUTE FUNCTION public.update_updated_at()',
        t, t
      );
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- SECTION 14: BACKFILL DATA
-- Repair existing production data. No data is deleted.
-- ============================================================

-- 14a. Create profiles for users who don't have one
INSERT INTO public.profiles (user_id, email, full_name, role, plan, credits, created_at, updated_at)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)),
  'free_user',
  'free',
  100,
  COALESCE(u.created_at, NOW()),
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- 14b. Create credit records for users who don't have one
INSERT INTO public.credits (user_id, balance, updated_at)
SELECT
  u.id,
  100,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.credits c WHERE c.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- 14c. Fix null/missing credits
UPDATE public.credits SET balance = 0 WHERE balance IS NULL;
UPDATE public.credits SET balance = 0 WHERE balance < 0;

-- 14d. Create default workspaces for users who don't have one
INSERT INTO public.workspaces (user_id, name, is_default)
SELECT
  p.user_id,
  COALESCE(p.full_name, split_part(p.email, '@', 1)) || '''s Workspace',
  true
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.workspaces w
  WHERE w.user_id = p.user_id AND w.is_default = true
)
ON CONFLICT DO NOTHING;

-- 14e. Assign orphan projects to their owner's default workspace
UPDATE public.projects p
SET workspace_id = w.id
FROM public.workspaces w
WHERE p.workspace_id IS NULL
  AND p.user_id = w.user_id
  AND w.is_default = true;

-- 14f. For any remaining projects without workspace, create one on the fly
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.id AS project_id, p.user_id
    FROM public.projects p
    WHERE p.workspace_id IS NULL
  LOOP
    -- Create workspace if needed
    INSERT INTO public.workspaces (user_id, name, is_default)
    VALUES (r.user_id, 'Default Workspace', true)
    ON CONFLICT DO NOTHING;

    -- Assign project
    UPDATE public.projects
    SET workspace_id = (
      SELECT id FROM public.workspaces
      WHERE user_id = r.user_id AND is_default = true
      LIMIT 1
    )
    WHERE id = r.project_id;
  END LOOP;
END $$;

-- 14g. Make workspace_id NOT NULL on projects (now that all are backfilled)
DO $$
BEGIN
  -- Only add NOT NULL if column exists and has no nulls
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects'
      AND column_name = 'workspace_id' AND is_nullable = 'YES'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM public.projects WHERE workspace_id IS NULL) THEN
      ALTER TABLE public.projects ALTER COLUMN workspace_id SET NOT NULL;
    END IF;
  END IF;
END $$;

-- 14h. Add FK constraint on projects.workspace_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.projects'::regclass
      AND conname = 'fk_projects_workspace'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT fk_projects_workspace
      FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 14i. Ensure subscriptions without plans are repaired
UPDATE public.subscriptions s
SET plan_slug = 'free'
WHERE plan_slug IS NULL
   OR plan_slug NOT IN (SELECT slug FROM public.plans);

-- 14j. Ensure profile plan values are valid
UPDATE public.profiles
SET plan = 'free'
WHERE plan IS NULL
   OR plan NOT IN ('free', 'starter', 'pro', 'business', 'agency', 'enterprise');

-- ============================================================
-- SECTION 15: RLS POLICIES FOR NEW TABLES
-- ============================================================

-- --- Workspaces ---
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workspaces_user_policy' AND tablename = 'workspaces') THEN
    CREATE POLICY workspaces_user_policy ON public.workspaces
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workspaces_admin_policy' AND tablename = 'workspaces') THEN
    CREATE POLICY workspaces_admin_policy ON public.workspaces
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- --- Credit Transactions ---
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'credit_tx_user_policy' AND tablename = 'credit_transactions') THEN
    CREATE POLICY credit_tx_user_policy ON public.credit_transactions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'credit_tx_admin_policy' AND tablename = 'credit_transactions') THEN
    CREATE POLICY credit_tx_admin_policy ON public.credit_transactions
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- --- Provider Statuses (admin only) ---
ALTER TABLE public.provider_statuses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'provider_statuses_admin_policy' AND tablename = 'provider_statuses') THEN
    CREATE POLICY provider_statuses_admin_policy ON public.provider_statuses
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- ============================================================
-- SECTION 16: RLS POLICIES FOR EXISTING TABLES (MISSING)
-- Audit every table. Create missing policies. Never expose data.
-- ============================================================

-- --- ai_providers ---
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_providers_public_read' AND tablename = 'ai_providers') THEN
    CREATE POLICY ai_providers_public_read ON public.ai_providers
      FOR SELECT USING (enabled = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_providers_admin_policy' AND tablename = 'ai_providers') THEN
    CREATE POLICY ai_providers_admin_policy ON public.ai_providers
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- --- ai_api_keys (admin only, highly sensitive) ---
ALTER TABLE public.ai_api_keys ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_api_keys_admin_policy' AND tablename = 'ai_api_keys') THEN
    CREATE POLICY ai_api_keys_admin_policy ON public.ai_api_keys
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- --- prompt_templates ---
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'prompt_templates_public_read' AND tablename = 'prompt_templates') THEN
    CREATE POLICY prompt_templates_public_read ON public.prompt_templates
      FOR SELECT USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'prompt_templates_admin_policy' AND tablename = 'prompt_templates') THEN
    CREATE POLICY prompt_templates_admin_policy ON public.prompt_templates
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- --- workflow_settings ---
ALTER TABLE public.workflow_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workflow_settings_public_read' AND tablename = 'workflow_settings') THEN
    CREATE POLICY workflow_settings_public_read ON public.workflow_settings
      FOR SELECT USING (is_enabled = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workflow_settings_admin_policy' AND tablename = 'workflow_settings') THEN
    CREATE POLICY workflow_settings_admin_policy ON public.workflow_settings
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- --- workflow_runs ---
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workflow_runs_user_policy' AND tablename = 'workflow_runs') THEN
    CREATE POLICY workflow_runs_user_policy ON public.workflow_runs
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workflow_runs_admin_policy' AND tablename = 'workflow_runs') THEN
    CREATE POLICY workflow_runs_admin_policy ON public.workflow_runs
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- --- ai_logs (admin only) ---
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ai_logs_admin_policy' AND tablename = 'ai_logs') THEN
    CREATE POLICY ai_logs_admin_policy ON public.ai_logs
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- --- admin_audit_logs (admin only) ---
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_audit_logs_admin_policy' AND tablename = 'admin_audit_logs') THEN
    CREATE POLICY admin_audit_logs_admin_policy ON public.admin_audit_logs
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- --- email_settings (admin only) ---
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'email_settings_admin_policy' AND tablename = 'email_settings') THEN
    CREATE POLICY email_settings_admin_policy ON public.email_settings
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- --- seo_settings (public read, admin write) ---
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'seo_settings_public_read' AND tablename = 'seo_settings') THEN
    CREATE POLICY seo_settings_public_read ON public.seo_settings
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'seo_settings_admin_policy' AND tablename = 'seo_settings') THEN
    CREATE POLICY seo_settings_admin_policy ON public.seo_settings
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- --- integration_settings (admin only) ---
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'integration_settings_admin_policy' AND tablename = 'integration_settings') THEN
    CREATE POLICY integration_settings_admin_policy ON public.integration_settings
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- --- backup_exports (admin only) ---
ALTER TABLE public.backup_exports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'backup_exports_admin_policy' AND tablename = 'backup_exports') THEN
    CREATE POLICY backup_exports_admin_policy ON public.backup_exports
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- --- keyword_research ---
ALTER TABLE public.keyword_research ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'keyword_research_user_policy' AND tablename = 'keyword_research') THEN
    CREATE POLICY keyword_research_user_policy ON public.keyword_research
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'keyword_research_admin_policy' AND tablename = 'keyword_research') THEN
    CREATE POLICY keyword_research_admin_policy ON public.keyword_research
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- --- generated_posts ---
ALTER TABLE public.generated_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'generated_posts_user_policy' AND tablename = 'generated_posts') THEN
    CREATE POLICY generated_posts_user_policy ON public.generated_posts
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'generated_posts_admin_policy' AND tablename = 'generated_posts') THEN
    CREATE POLICY generated_posts_admin_policy ON public.generated_posts
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- --- site_settings (enhanced in 006, ensure RLS) ---
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
-- (Policies already exist from 002: public read, admin update)

-- --- api_keys (ensure RLS) ---
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
-- (Policies already exist from 002: user read own, admin read all)

-- --- security_logs (ensure RLS) ---
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
-- (Policy already exists from 002: admin read)

-- --- admin_logs (ensure RLS) ---
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
-- (Policies already exist from 002: admin read, super_admin insert)

-- ============================================================
-- SECTION 17: PERFORMANCE INDEXES
-- ============================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Projects (workspace + owner compound index)
CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON public.projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_workspace ON public.projects(user_id, workspace_id);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_slug ON public.subscriptions(plan_slug);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_plan_slug ON public.payments(plan_slug);
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON public.payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON public.payments(provider);
CREATE INDEX IF NOT EXISTS idx_payments_webhook ON public.payments(webhook_verified);

-- Coupons
CREATE INDEX IF NOT EXISTS idx_coupons_type ON public.coupons(coupon_type);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active) WHERE is_active = true;

-- Credit Logs
CREATE INDEX IF NOT EXISTS idx_credit_logs_reference ON public.credit_logs(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_credit_logs_created ON public.credit_logs(created_at);

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON public.documents(project_id);

-- Workflow Runs
CREATE INDEX IF NOT EXISTS idx_workflow_runs_user_status ON public.workflow_runs(user_id, status);

-- ============================================================
-- SECTION 18: FINAL VERIFICATION
-- Run integrity checks and report via RAISE NOTICE.
-- ============================================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Check 1: Orphan profiles (profile without matching auth.users)
  SELECT COUNT(*) INTO v_count
  FROM public.profiles p
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.user_id);

  IF v_count > 0 THEN
    RAISE WARNING 'VERIFICATION: % orphan profiles found (profiles without auth.users)', v_count;
  ELSE
    RAISE NOTICE 'VERIFICATION: PASS - No orphan profiles';
  END IF;

  -- Check 2: Users without profiles
  SELECT COUNT(*) INTO v_count
  FROM auth.users u
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = u.id);

  IF v_count > 0 THEN
    RAISE WARNING 'VERIFICATION: % users still without profiles', v_count;
  ELSE
    RAISE NOTICE 'VERIFICATION: PASS - All users have profiles';
  END IF;

  -- Check 3: Users without workspaces
  SELECT COUNT(*) INTO v_count
  FROM auth.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM public.workspaces w WHERE w.user_id = u.id AND w.is_default = true
  );

  IF v_count > 0 THEN
    RAISE WARNING 'VERIFICATION: % users without default workspace', v_count;
  ELSE
    RAISE NOTICE 'VERIFICATION: PASS - All users have default workspaces';
  END IF;

  -- Check 4: Projects without workspace
  SELECT COUNT(*) INTO v_count
  FROM public.projects
  WHERE workspace_id IS NULL;

  IF v_count > 0 THEN
    RAISE WARNING 'VERIFICATION: % projects without workspace_id', v_count;
  ELSE
    RAISE NOTICE 'VERIFICATION: PASS - All projects have workspace_id';
  END IF;

  -- Check 5: Users without credit records
  SELECT COUNT(*) INTO v_count
  FROM auth.users u
  WHERE NOT EXISTS (SELECT 1 FROM public.credits c WHERE c.user_id = u.id);

  IF v_count > 0 THEN
    RAISE WARNING 'VERIFICATION: % users without credit records', v_count;
  ELSE
    RAISE NOTICE 'VERIFICATION: PASS - All users have credit records';
  END IF;

  -- Check 6: Active subscriptions without valid plan
  SELECT COUNT(*) INTO v_count
  FROM public.subscriptions s
  WHERE s.status = 'active'
    AND NOT EXISTS (SELECT 1 FROM public.plans p WHERE p.slug = s.plan_slug);

  IF v_count > 0 THEN
    RAISE WARNING 'VERIFICATION: % active subscriptions with invalid plan_slug', v_count;
  ELSE
    RAISE NOTICE 'VERIFICATION: PASS - All active subscriptions reference valid plans';
  END IF;

  -- Check 7: Negative credit balances
  SELECT COUNT(*) INTO v_count
  FROM public.credits
  WHERE balance < 0;

  IF v_count > 0 THEN
    RAISE WARNING 'VERIFICATION: % credit records with negative balance', v_count;
  ELSE
    RAISE NOTICE 'VERIFICATION: PASS - No negative credit balances';
  END IF;

  -- Check 8: Duplicate default workspaces
  SELECT COUNT(*) INTO v_count
  FROM (
    SELECT user_id, COUNT(*) AS cnt
    FROM public.workspaces
    WHERE is_default = true
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) d;

  IF v_count > 0 THEN
    RAISE WARNING 'VERIFICATION: % users with duplicate default workspaces', v_count;
  ELSE
    RAISE NOTICE 'VERIFICATION: PASS - No duplicate default workspaces';
  END IF;

  RAISE NOTICE '================================================';
  RAISE NOTICE 'MIGRATION 011: FINAL PRODUCTION ARCHITECTURE COMPLETE';
  RAISE NOTICE '================================================';
END $$;

-- ================================================================
-- END OF MIGRATION 011
-- ================================================================


-- ============================================================
-- 012_sync_credits_trigger.sql
-- ============================================================

-- ============================================================
-- MIGRATION 012: Auto-sync profiles.credits from credits.balance
-- Ensures single source of truth: credits.balance is authoritative,
-- profiles.credits is kept in sync via trigger for backward compat.
-- ============================================================

-- Function to sync profiles.credits from credits.balance
CREATE OR REPLACE FUNCTION public.sync_profiles_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When credits.balance changes, update profiles.credits to match
  UPDATE public.profiles
  SET credits = NEW.balance
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists (idempotent)
DROP TRIGGER IF EXISTS sync_credits_on_change ON public.credits;

-- Create trigger: fires AFTER UPDATE on credits table
CREATE TRIGGER sync_credits_on_change
  AFTER INSERT OR UPDATE ON public.credits
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profiles_credits();

-- Also sync on INSERT into credits table (for new users)
-- The trigger above covers INSERT already via OR INSERT


-- ============================================================
-- 013_fix_rls_recursion.sql
-- ============================================================

-- Migration 013: Fix infinite RLS recursion on is_admin() / is_super_admin()
--
-- PROBLEM:
--   is_admin() is defined as a plain SQL function (no SECURITY DEFINER).
--   When called from an RLS policy on any table (e.g. projects), it queries
--   the `profiles` table. The `profiles` table has an "Admins can read all
--   profiles" policy that calls is_admin() again, which queries profiles
--   again, creating infinite recursion and PostgreSQL error 54001
--   (stack depth limit exceeded).
--
-- FIX:
--   Recreate both functions with SECURITY DEFINER so they bypass RLS on the
--   profiles table, breaking the recursion cycle.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
$$;

-- ============================================================
-- BLOG POSTS — ADD MISSING COLUMNS (idempotent)
-- ============================================================
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured_image_url text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);

