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
