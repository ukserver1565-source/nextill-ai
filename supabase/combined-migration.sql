-- ============================================================
-- Nextill AI - Combined Migration
-- Order: 001_core_tables -> 002_rls_policies -> 003_seed -> 004_functions
-- ============================================================

-- ============================================================
-- 001_core_tables.sql
-- ============================================================
-- Core tables for Nextill AI

create extension if not exists "pgcrypto";

-- PROFILES
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

-- PLANS
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

-- TOOL SETTINGS
create table if not exists public.tool_settings (
  id uuid primary key default gen_random_uuid(),
  tool_slug text unique not null,
  tool_name text not null,
  is_enabled boolean default true,
  guest_daily_limit integer default 0,
  free_daily_limit integer default 5,
  premium_daily_limit integer default 100,
  credits_cost integer default 1,
  usage_count integer default 0,
  default_model text,
  prompt_template text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AI MODELS
create table if not exists public.ai_models (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  model_name text not null,
  api_key_secret_name text,
  is_enabled boolean default true,
  is_default boolean default false,
  cost_input numeric(10,6) default 0,
  cost_output numeric(10,6) default 0,
  created_at timestamptz default now()
);

create unique index if not exists idx_ai_models_provider_model on public.ai_models(provider, model_name);

-- PROJECTS
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

-- DOCUMENTS
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

-- USAGE LOGS
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

-- GUEST USAGE
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

-- PAYMENTS
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

-- SUBSCRIPTIONS
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

-- CREDITS
create table if not exists public.credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  balance integer default 0,
  updated_at timestamptz default now()
);

create unique index if not exists idx_credits_user_id on public.credits(user_id);

-- CREDIT LOGS
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

-- CONTACT MESSAGES
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

-- BLOG CATEGORIES
create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- BLOG POSTS
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

-- COUPONS
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

-- API KEYS
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  key_hash text not null,
  name text not null,
  last_used_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_api_keys_user_id on public.api_keys(user_id);

-- SECURITY LOGS
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

-- ADMIN LOGS
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

-- SITE SETTINGS
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}',
  updated_at timestamptz default now()
);

create unique index if not exists idx_site_settings_key on public.site_settings(key);

-- SYSTEM LOGS
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

-- ============================================================
-- SERVICE ROLE GRANTS (required for admin API access)
-- ============================================================
grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
-- ============================================================
-- FOREIGN KEYS FOR PROFILES JOINS (PostgREST needs FK for joins)
-- ============================================================
alter table public.projects add constraint if not exists fk_projects_profiles foreign key (user_id) references public.profiles(user_id);
alter table public.documents add constraint if not exists fk_documents_profiles foreign key (user_id) references public.profiles(user_id);
alter table public.payments add constraint if not exists fk_payments_profiles foreign key (user_id) references public.profiles(user_id);
alter table public.credit_logs add constraint if not exists fk_credit_logs_profiles foreign key (user_id) references public.profiles(user_id);
alter table public.api_keys add constraint if not exists fk_api_keys_profiles foreign key (user_id) references public.profiles(user_id);
alter table public.subscriptions add constraint if not exists fk_subscriptions_profiles foreign key (user_id) references public.profiles(user_id);
alter table public.credits add constraint if not exists fk_credits_profiles foreign key (user_id) references public.profiles(user_id);
alter table public.usage_logs add constraint if not exists fk_usage_logs_profiles foreign key (user_id) references public.profiles(user_id);


-- 002_rls_policies.sql
-- ============================================================
-- Row Level Security policies

create or replace function public.is_admin()
returns boolean
language sql
stable
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
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
    and role = 'super_admin'
  );
$$;

-- PROFILES RLS
alter table public.profiles enable row level security;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select using (user_id = auth.uid());
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (user_id = auth.uid());
drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles" on public.profiles for select using (public.is_admin());
drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles" on public.profiles for update using (public.is_admin());

-- PROJECTS RLS
alter table public.projects enable row level security;
drop policy if exists "Users can insert own projects" on public.projects;
create policy "Users can insert own projects" on public.projects for insert with check (user_id = auth.uid());
drop policy if exists "Users can read own projects" on public.projects;
create policy "Users can read own projects" on public.projects for select using (user_id = auth.uid());
drop policy if exists "Users can update own projects" on public.projects;
create policy "Users can update own projects" on public.projects for update using (user_id = auth.uid());
drop policy if exists "Users can delete own projects" on public.projects;
create policy "Users can delete own projects" on public.projects for delete using (user_id = auth.uid());
drop policy if exists "Admins can read all projects" on public.projects;
create policy "Admins can read all projects" on public.projects for select using (public.is_admin());
drop policy if exists "Admins can delete all projects" on public.projects;
create policy "Admins can delete all projects" on public.projects for delete using (public.is_admin());

-- DOCUMENTS RLS
alter table public.documents enable row level security;
drop policy if exists "Users can insert own documents" on public.documents;
create policy "Users can insert own documents" on public.documents for insert with check (user_id = auth.uid());
drop policy if exists "Users can read own documents" on public.documents;
create policy "Users can read own documents" on public.documents for select using (user_id = auth.uid());
drop policy if exists "Users can update own documents" on public.documents;
create policy "Users can update own documents" on public.documents for update using (user_id = auth.uid());
drop policy if exists "Users can delete own documents" on public.documents;
create policy "Users can delete own documents" on public.documents for delete using (user_id = auth.uid());
drop policy if exists "Admins can read all documents" on public.documents;
create policy "Admins can read all documents" on public.documents for select using (public.is_admin());
drop policy if exists "Admins can delete all documents" on public.documents;
create policy "Admins can delete all documents" on public.documents for delete using (public.is_admin());

-- CONTACT MESSAGES RLS
alter table public.contact_messages enable row level security;
drop policy if exists "Anyone can insert contact messages" on public.contact_messages;
create policy "Anyone can insert contact messages" on public.contact_messages for insert with check (true);
drop policy if exists "Admins can read contact messages" on public.contact_messages;
create policy "Admins can read contact messages" on public.contact_messages for select using (public.is_admin());
drop policy if exists "Admins can update contact messages" on public.contact_messages;
create policy "Admins can update contact messages" on public.contact_messages for update using (public.is_admin());
drop policy if exists "Admins can delete contact messages" on public.contact_messages;
create policy "Admins can delete contact messages" on public.contact_messages for delete using (public.is_admin());

-- BLOG POSTS RLS
alter table public.blog_posts enable row level security;
drop policy if exists "Public can read published posts" on public.blog_posts;
create policy "Public can read published posts" on public.blog_posts for select using (status = 'published');
drop policy if exists "Admins can insert blog posts" on public.blog_posts;
create policy "Admins can insert blog posts" on public.blog_posts for insert with check (public.is_admin());
drop policy if exists "Admins can read all blog posts" on public.blog_posts;
create policy "Admins can read all blog posts" on public.blog_posts for select using (public.is_admin());
drop policy if exists "Admins can update blog posts" on public.blog_posts;
create policy "Admins can update blog posts" on public.blog_posts for update using (public.is_admin());
drop policy if exists "Admins can delete blog posts" on public.blog_posts;
create policy "Admins can delete blog posts" on public.blog_posts for delete using (public.is_admin());

-- BLOG CATEGORIES RLS
alter table public.blog_categories enable row level security;
drop policy if exists "Public can read blog categories" on public.blog_categories;
create policy "Public can read blog categories" on public.blog_categories for select using (true);
drop policy if exists "Admins can insert blog categories" on public.blog_categories;
create policy "Admins can insert blog categories" on public.blog_categories for insert with check (public.is_admin());
drop policy if exists "Admins can update blog categories" on public.blog_categories;
create policy "Admins can update blog categories" on public.blog_categories for update using (public.is_admin());
drop policy if exists "Admins can delete blog categories" on public.blog_categories;
create policy "Admins can delete blog categories" on public.blog_categories for delete using (public.is_admin());

-- PLANS RLS
alter table public.plans enable row level security;
drop policy if exists "Public can read active plans" on public.plans;
create policy "Public can read active plans" on public.plans for select using (is_active = true);
drop policy if exists "Admins can insert plans" on public.plans;
create policy "Admins can insert plans" on public.plans for insert with check (public.is_admin());
drop policy if exists "Admins can read all plans" on public.plans;
create policy "Admins can read all plans" on public.plans for select using (public.is_admin());
drop policy if exists "Admins can update plans" on public.plans;
create policy "Admins can update plans" on public.plans for update using (public.is_admin());
drop policy if exists "Admins can delete plans" on public.plans;
create policy "Admins can delete plans" on public.plans for delete using (public.is_admin());

-- TOOL SETTINGS RLS
alter table public.tool_settings enable row level security;
drop policy if exists "Public can read enabled tool settings" on public.tool_settings;
create policy "Public can read enabled tool settings" on public.tool_settings for select using (is_enabled = true);
drop policy if exists "Admins can insert tool settings" on public.tool_settings;
create policy "Admins can insert tool settings" on public.tool_settings for insert with check (public.is_admin());
drop policy if exists "Admins can read all tool settings" on public.tool_settings;
create policy "Admins can read all tool settings" on public.tool_settings for select using (public.is_admin());
drop policy if exists "Admins can update tool settings" on public.tool_settings;
create policy "Admins can update tool settings" on public.tool_settings for update using (public.is_admin());
drop policy if exists "Admins can delete tool settings" on public.tool_settings;
create policy "Admins can delete tool settings" on public.tool_settings for delete using (public.is_admin());

-- AI MODELS RLS
alter table public.ai_models enable row level security;
drop policy if exists "Public can read enabled AI models" on public.ai_models;
create policy "Public can read enabled AI models" on public.ai_models for select using (is_enabled = true);
drop policy if exists "Admins can insert AI models" on public.ai_models;
create policy "Admins can insert AI models" on public.ai_models for insert with check (public.is_admin());
drop policy if exists "Admins can read all AI models" on public.ai_models;
create policy "Admins can read all AI models" on public.ai_models for select using (public.is_admin());
drop policy if exists "Admins can update AI models" on public.ai_models;
create policy "Admins can update AI models" on public.ai_models for update using (public.is_admin());
drop policy if exists "Admins can delete AI models" on public.ai_models;
create policy "Admins can delete AI models" on public.ai_models for delete using (public.is_admin());

-- PAYMENTS RLS
alter table public.payments enable row level security;
drop policy if exists "Users can insert own payments" on public.payments;
create policy "Users can insert own payments" on public.payments for insert with check (user_id = auth.uid());
drop policy if exists "Users can read own payments" on public.payments;
create policy "Users can read own payments" on public.payments for select using (user_id = auth.uid());
drop policy if exists "Admins can read all payments" on public.payments;
create policy "Admins can read all payments" on public.payments for select using (public.is_admin());

-- SUBSCRIPTIONS RLS
alter table public.subscriptions enable row level security;
drop policy if exists "Users can read own subscriptions" on public.subscriptions;
create policy "Users can read own subscriptions" on public.subscriptions for select using (user_id = auth.uid());
drop policy if exists "Admins can read all subscriptions" on public.subscriptions;
create policy "Admins can read all subscriptions" on public.subscriptions for select using (public.is_admin());

-- CREDITS RLS
alter table public.credits enable row level security;
drop policy if exists "Users can read own credit balance" on public.credits;
create policy "Users can read own credit balance" on public.credits for select using (user_id = auth.uid());
drop policy if exists "Admins can read all credit balances" on public.credits;
create policy "Admins can read all credit balances" on public.credits for select using (public.is_admin());

-- CREDIT LOGS RLS
alter table public.credit_logs enable row level security;
drop policy if exists "Users can read own credit logs" on public.credit_logs;
create policy "Users can read own credit logs" on public.credit_logs for select using (user_id = auth.uid());
drop policy if exists "Admins can read all credit logs" on public.credit_logs;
create policy "Admins can read all credit logs" on public.credit_logs for select using (public.is_admin());

-- USAGE LOGS RLS
alter table public.usage_logs enable row level security;
drop policy if exists "Users can read own usage logs" on public.usage_logs;
create policy "Users can read own usage logs" on public.usage_logs for select using (user_id = auth.uid());
drop policy if exists "Admins can read all usage logs" on public.usage_logs;
create policy "Admins can read all usage logs" on public.usage_logs for select using (public.is_admin());

-- GUEST USAGE RLS
alter table public.guest_usage enable row level security;
drop policy if exists "Admins can read guest usage" on public.guest_usage;
create policy "Admins can read guest usage" on public.guest_usage for select using (public.is_admin());

-- COUPONS RLS
alter table public.coupons enable row level security;
drop policy if exists "Public can read active coupons" on public.coupons;
create policy "Public can read active coupons" on public.coupons for select using (is_active = true);
drop policy if exists "Admins can insert coupons" on public.coupons;
create policy "Admins can insert coupons" on public.coupons for insert with check (public.is_admin());
drop policy if exists "Admins can read all coupons" on public.coupons;
create policy "Admins can read all coupons" on public.coupons for select using (public.is_admin());
drop policy if exists "Admins can update coupons" on public.coupons;
create policy "Admins can update coupons" on public.coupons for update using (public.is_admin());
drop policy if exists "Admins can delete coupons" on public.coupons;
create policy "Admins can delete coupons" on public.coupons for delete using (public.is_admin());

-- API KEYS RLS
alter table public.api_keys enable row level security;
drop policy if exists "Users can read own API keys" on public.api_keys;
create policy "Users can read own API keys" on public.api_keys for select using (user_id = auth.uid());
drop policy if exists "Admins can read all API keys" on public.api_keys;
create policy "Admins can read all API keys" on public.api_keys for select using (public.is_admin());

-- SECURITY LOGS RLS
alter table public.security_logs enable row level security;
drop policy if exists "Admins can read security logs" on public.security_logs;
create policy "Admins can read security logs" on public.security_logs for select using (public.is_admin());

-- ADMIN LOGS RLS
alter table public.admin_logs enable row level security;
drop policy if exists "Admins can read admin logs" on public.admin_logs;
create policy "Admins can read admin logs" on public.admin_logs for select using (public.is_admin());
drop policy if exists "Super admins can insert admin logs" on public.admin_logs;
create policy "Super admins can insert admin logs" on public.admin_logs for insert with check (public.is_super_admin());

-- SITE SETTINGS RLS
alter table public.site_settings enable row level security;
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings for select using (true);
drop policy if exists "Admins can update site settings" on public.site_settings;
create policy "Admins can update site settings" on public.site_settings for update using (public.is_admin());

-- SYSTEM LOGS RLS
alter table public.system_logs enable row level security;
drop policy if exists "Admins can read system logs" on public.system_logs;
create policy "Admins can read system logs" on public.system_logs for select using (public.is_admin());

-- ADD MISSING COLUMNS FOR CODE COMPATIBILITY
alter table public.usage_logs add column if not exists word_count integer;
alter table public.usage_logs add column if not exists status text default 'completed';
alter table public.credits add column if not exists amount integer;
alter table public.credits add column if not exists type text;
alter table public.credits add column if not exists description text;

-- AUTO-PROFILE CREATION ON USER SIGNUP
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- ============================================================
-- 003_seed.sql (FIXED - removed hardcoded non-UUID ids)
-- ============================================================

-- PLANS (id auto-generated, conflict on slug)
insert into public.plans (name, slug, price_monthly, price_yearly, credits, features, is_active) values
('Free', 'free', 0, 0, 100, '["AI Writer (5/day)", "Basic tools", "1 project"]', true),
('Starter', 'starter', 29, 290, 2000, '["AI Writer (50/day)", "AI Humanizer", "AI Detector", "Plagiarism Checker", "SEO Title Generator", "Meta Description Generator", "3 projects"]', true),
('Pro', 'pro', 79, 790, 5000, '["All Starter features", "Keyword Research", "Website Audit", "10 projects", "Priority support"]', true),
('Agency', 'agency', 149, 1490, 15000, '["All Pro features", "Rank Tracker", "Backlink Checker", "50 projects", "Team (10 users)", "API access"]', true),
('Enterprise', 'enterprise', 299, 2990, 50000, '["All Agency features", "Unlimited projects", "Unlimited users", "Custom AI models", "Dedicated support", "SLA"]', true)
on conflict (slug) do nothing;

-- TOOL SETTINGS (id auto-generated, conflict on tool_slug)
insert into public.tool_settings (tool_slug, tool_name, is_enabled, guest_daily_limit, free_daily_limit, premium_daily_limit, credits_cost, default_model, prompt_template) values
('ai-writer', 'AI Writer', true, 1, 5, 100, 10, 'gpt-4o', 'Write a comprehensive article about {topic}'),
('ai-humanizer', 'AI Humanizer', true, 1, 3, 50, 5, 'gpt-4o', 'Humanize this text: {text}'),
('ai-detector', 'AI Detector', true, 1, 5, 100, 3, 'custom-detector', 'Analyze if this text is AI-generated: {text}'),
('plagiarism-checker', 'Plagiarism Checker', true, 0, 2, 30, 8, 'custom-plagiarism', 'Check plagiarism for: {text}'),
('seo-title-generator', 'SEO Title Generator', true, 2, 10, 200, 2, 'gpt-4o-mini', 'Generate SEO titles for: {topic}'),
('meta-description-generator', 'Meta Description Generator', true, 2, 10, 200, 2, 'gpt-4o-mini', 'Generate meta description for: {topic}'),
('keyword-research', 'Keyword Research', true, 1, 5, 50, 15, 'gpt-4o', 'Research keywords for: {niche}'),
('website-audit', 'Website Audit', true, 0, 1, 10, 25, 'custom-audit', 'Audit website: {url}'),
('rank-tracker', 'Rank Tracker', true, 0, 1, 20, 20, 'custom-rank', 'Track rankings for: {keyword}'),
('backlink-checker', 'Backlink Checker', true, 0, 1, 15, 18, 'custom-backlink', 'Analyze backlinks for: {url}')
on conflict (tool_slug) do nothing;

-- AI MODELS (id auto-generated, conflict on provider+model_name unique index)
insert into public.ai_models (provider, model_name, api_key_secret_name, is_enabled, is_default, cost_input, cost_output) values
('Google', 'Gemini Pro', 'GEMINI_API_KEY', true, true, 0.000002, 0.000003),
('OpenAI', 'GPT-4o', 'OPENAI_API_KEY', true, false, 0.000005, 0.000015),
('OpenAI', 'GPT-4o-mini', 'OPENAI_API_KEY', true, true, 0.000001, 0.000002),
('DeepSeek', 'DeepSeek V3', 'DEEPSEEK_API_KEY', true, false, 0.000001, 0.000002),
('Anthropic', 'Claude 3.5 Sonnet', 'ANTHROPIC_API_KEY', true, false, 0.000003, 0.000015)
on conflict (provider, model_name) do nothing;

-- BLOG CATEGORIES (id auto-generated, conflict on slug)
insert into public.blog_categories (name, slug) values
('AI Writing', 'ai-writing'),
('SEO', 'seo'),
('Content Marketing', 'content-marketing'),
('Tools', 'tools')
on conflict (slug) do nothing;

-- SITE SETTINGS (conflict on key)
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
