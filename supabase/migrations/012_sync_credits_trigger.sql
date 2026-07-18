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
