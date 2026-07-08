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
