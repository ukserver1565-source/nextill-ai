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

-- ============================================================
-- SECTION 6: CHECK CONSTRAINTS UPDATE
-- ============================================================

-- profiles.plan: add 'business' to allowed values
DO $$
DECLARE
  conname TEXT;
BEGIN
  SELECT conname INTO conname
  FROM pg_constraint
  WHERE conrelid = 'public.profiles'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%plan%'
    AND pg_get_constraintdef(oid) LIKE '%free%';

  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', conname);
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'business', 'agency', 'enterprise'));

-- payments.status: add Paddle/JazzCash states
DO $$
DECLARE
  conname TEXT;
BEGIN
  SELECT conname INTO conname
  FROM pg_constraint
  WHERE conrelid = 'public.payments'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%status%'
    AND pg_get_constraintdef(oid) LIKE '%pending%';

  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.payments DROP CONSTRAINT %I', conname);
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
-- SECTION18: FINAL VERIFICATION
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
