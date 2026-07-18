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
