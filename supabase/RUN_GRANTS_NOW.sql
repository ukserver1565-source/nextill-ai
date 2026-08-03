-- ─────────────────────────────────────────────────────────────
-- RUN THIS IN SUPABASE SQL EDITOR (Dashboard → SQL Editor → New query)
-- Fixes: admin payment-credentials, coupons, workspaces, credit
-- transactions and provider statuses all return HTTP 403 to the
-- service_role (tables created after the original GRANT ALL ran).
--
-- Idempotent — safe to run more than once.
-- Verified failing BEFORE (2026-08-03): all 5 tables → 403
-- ─────────────────────────────────────────────────────────────

GRANT ALL ON TABLE public.payment_provider_credentials TO service_role;
GRANT ALL ON TABLE public.coupon_redemptions TO service_role;
GRANT ALL ON TABLE public.credit_transactions TO service_role;
GRANT ALL ON TABLE public.workspaces TO service_role;
GRANT ALL ON TABLE public.provider_statuses TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Verify: should return 5 rows with no error
SELECT 'payment_provider_credentials' AS tbl, count(*) AS n FROM public.payment_provider_credentials
UNION ALL SELECT 'coupon_redemptions', count(*) FROM public.coupon_redemptions
UNION ALL SELECT 'credit_transactions', count(*) FROM public.credit_transactions
UNION ALL SELECT 'workspaces', count(*) FROM public.workspaces
UNION ALL SELECT 'provider_statuses', count(*) FROM public.provider_statuses;
