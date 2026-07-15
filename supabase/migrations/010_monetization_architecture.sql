-- Migration 010: Monetization Architecture
-- Extends existing tables + creates coupon_redemptions
-- Idempotent, non-destructive, safe to rerun

-- ============================================================
-- 1. Extend plans table with limit columns
-- ============================================================
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_projects integer DEFAULT 5;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_documents integer DEFAULT 50;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_article_length integer DEFAULT 2000;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_reports_per_month integer DEFAULT 20;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS report_history_days integer DEFAULT 30;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS badge text;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS is_popular boolean DEFAULT false;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS exports jsonb DEFAULT '["txt","markdown"]'::jsonb;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS support_level text DEFAULT 'email';
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS target_audience text;

-- ============================================================
-- 2. Extend subscriptions with billing_cycle + provider
-- ============================================================
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'));
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS provider text DEFAULT 'paddle';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS provider_subscription_id text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Drop the old unique index on user_id (one user can have multiple subs over time)
DROP INDEX IF EXISTS idx_subscriptions_user_id;
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- ============================================================
-- 3. Extend coupons with full coupon system columns
-- ============================================================
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS coupon_type text DEFAULT 'percentage' CHECK (coupon_type IN ('percentage', 'fixed', 'free_trial', 'first_payment', 'bonus_credits'));
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS bonus_credits integer DEFAULT 0;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS applicable_plan text;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'both' CHECK (billing_cycle IN ('monthly', 'yearly', 'both'));
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS min_amount numeric(10,2) DEFAULT 0;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS max_per_user integer DEFAULT 1;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS new_users_only boolean DEFAULT false;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS first_payment_only boolean DEFAULT false;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================================
-- 4. Create coupon_redemptions table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  discount_applied numeric(10,2) DEFAULT 0,
  credits_granted integer DEFAULT 0,
  billing_cycle text,
  plan_slug text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON public.coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user ON public.coupon_redemptions(user_id);

-- ============================================================
-- 5. Extend payments with more fields
-- ============================================================
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'));
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS final_amount numeric(10,2);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS webhook_verified boolean DEFAULT false;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- ============================================================
-- 6. Extend credit_logs with more transaction types
-- ============================================================
ALTER TABLE public.credit_logs ADD COLUMN IF NOT EXISTS balance_after integer;
ALTER TABLE public.credit_logs ADD COLUMN IF NOT EXISTS reference_id uuid;
ALTER TABLE public.credit_logs ADD COLUMN IF NOT EXISTS reference_type text;

-- ============================================================
-- 7. Update existing plans to the 3 paid plans + free
-- ============================================================
-- Free plan
UPDATE public.plans SET
  name = 'Free', slug = 'free', price_monthly = 0, price_yearly = 0, credits = 100,
  features = '["1 Domain Intelligence check/day","1 Post Generator test/day","1 Plagiarism check/day","Local/basic engines only","1 project","10 documents"]'::jsonb,
  max_projects = 1, max_documents = 10, max_article_length = 1500, max_reports_per_month = 1,
  report_history_days = 7, sort_order = 0, badge = NULL, is_popular = false,
  exports = '["txt"]'::jsonb, support_level = 'community',
  target_audience = 'Try Nextill AI with limited free access'
WHERE slug = 'free';

-- Starter plan ($19/mo, $190/yr)
UPDATE public.plans SET
  name = 'Starter', slug = 'starter', price_monthly = 19, price_yearly = 190, credits = 2000,
  features = '["Domain Intelligence — basic analysis","Keyword ideas & local data","20 saved reports/month","Post Generator — up to 2,000 words","AI generation, humanization, grammar","SEO title, meta, FAQ, schema","Plagiarism & Authenticity — local checks","5 projects","50 documents","30-day report history","TXT & Markdown exports","Email support"]'::jsonb,
  max_projects = 5, max_documents = 50, max_article_length = 2000, max_reports_per_month = 20,
  report_history_days = 30, sort_order = 1, badge = NULL, is_popular = false,
  exports = '["txt","markdown"]'::jsonb, support_level = 'email',
  target_audience = 'New creators, bloggers, solo SEO users'
WHERE slug = 'starter';

-- Pro plan ($49/mo, $490/yr) — MOST POPULAR
UPDATE public.plans SET
  name = 'Pro', slug = 'pro', price_monthly = 49, price_yearly = 490, credits = 7500,
  features = '["Everything in Starter","Domain Intelligence — full live metrics","Volume, KD, CPC, intent, trend","Competitor & backlink analysis","100 saved reports/month","Post Generator — up to 5,000 words","Priority provider routing","Advanced humanization","AI detection & live plagiarism","25 projects","500 documents","1-year report history","PDF, CSV, TXT, Markdown exports","Priority email support"]'::jsonb,
  max_projects = 25, max_documents = 500, max_article_length = 5000, max_reports_per_month = 100,
  report_history_days = 365, sort_order = 2, badge = 'MOST POPULAR', is_popular = true,
  exports = '["pdf","csv","txt","markdown"]'::jsonb, support_level = 'priority',
  target_audience = 'Professional bloggers, SEO specialists, content marketers'
WHERE slug = 'pro';

-- Business plan ($99/mo, $990/yr)
UPDATE public.plans SET
  name = 'Business', slug = 'business', price_monthly = 99, price_yearly = 990, credits = 20000,
  features = '["Everything in Pro","500 saved reports/month","Bulk keyword analysis","Advanced competitor reports","Advanced backlink reports","Post Generator — up to 10,000 words","100 projects","5,000 documents","Unlimited report history","All export formats","Priority support","Business usage rights"]'::jsonb,
  max_projects = 100, max_documents = 5000, max_article_length = 10000, max_reports_per_month = 500,
  report_history_days = 9999, sort_order = 3, badge = NULL, is_popular = false,
  exports = '["pdf","csv","txt","markdown"]'::jsonb, support_level = 'priority',
  target_audience = 'Agencies, SEO teams, high-volume publishers'
WHERE slug = 'business';

-- Deactivate Agency and Enterprise (not part of the 3 primary plans)
UPDATE public.plans SET is_active = false WHERE slug IN ('agency', 'enterprise');

-- ============================================================
-- 8. Update workflow_settings credit costs
-- ============================================================
UPDATE public.workflow_settings SET credits_cost = 2 WHERE workflow_slug = 'keyword-intelligence';
UPDATE public.workflow_settings SET credits_cost = 10 WHERE workflow_slug = 'post-generator';
UPDATE public.workflow_settings SET credits_cost = 4 WHERE workflow_slug = 'plagiarism-checker';

-- Insert domain-intelligence credit cost if missing
INSERT INTO public.workflow_settings (workflow_slug, workflow_name, is_enabled, credits_cost, guest_daily_limit, free_daily_limit, premium_daily_limit)
VALUES ('domain-intelligence', 'Domain Intelligence', true, 2, 1, 5, 100)
ON CONFLICT (workflow_slug) DO UPDATE SET credits_cost = 2;

-- ============================================================
-- 9. RLS policies for new/extended tables
-- ============================================================
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coupon_redemptions_user_policy' AND tablename = 'coupon_redemptions') THEN
    CREATE POLICY coupon_redemptions_user_policy ON coupon_redemptions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coupon_redemptions_admin_policy' AND tablename = 'coupon_redemptions') THEN
    CREATE POLICY coupon_redemptions_admin_policy ON coupon_redemptions
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
      );
  END IF;
END $$;

-- Ensure plans are readable by everyone
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'plans_public_read' AND tablename = 'plans') THEN
    CREATE POLICY plans_public_read ON plans FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'plans_admin_write' AND tablename = 'plans') THEN
    CREATE POLICY plans_admin_write ON plans FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
    );
  END IF;
END $$;

-- Ensure subscriptions have proper policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'subscriptions_user_policy' AND tablename = 'subscriptions') THEN
    CREATE POLICY subscriptions_user_policy ON subscriptions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure payments have proper policies
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'payments_user_policy' AND tablename = 'payments') THEN
    CREATE POLICY payments_user_policy ON payments
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;
