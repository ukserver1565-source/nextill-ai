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
