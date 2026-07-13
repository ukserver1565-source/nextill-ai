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
