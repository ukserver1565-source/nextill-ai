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
