# Pricing System Report

**Date:** 2026-07-15

---

## Final Plans (after migration 010)

| Plan | Monthly | Yearly | Credits | Projects | Documents | Max Words | Report History |
|------|---------|--------|---------|----------|-----------|-----------|----------------|
| Free | $0 | $0 | 100 | 1 | 10 | 1,500 | 7 days |
| Starter | $19 | $190 | 2,000 | 5 | 50 | 2,000 | 30 days |
| Pro | $49 | $490 | 7,500 | 25 | 500 | 5,000 | 1 year |
| Business | $99 | $990 | 20,000 | 100 | 5,000 | 10,000 | Unlimited |

- **Pro** is marked "MOST POPULAR"
- Agency and Enterprise plans deactivated (not primary)
- "Save 2 months with yearly billing" displayed on pricing page

---

## Canonical Credit Source

**Table:** `workflow_settings`

| Workflow | Credits | Guest Limit | Free Limit | Premium Limit |
|----------|---------|-------------|------------|---------------|
| domain-intelligence | 2 | 1 | 5 | 100 |
| keyword-intelligence | 3 | 3 | 10 | 100 |
| post-generator | 10 | 1 | 5 | 50 |
| plagiarism-checker | 4 | 2 | 5 | 50 |

Post Generator word-count tiers (hardcoded in pricing display, configurable via admin):
- 1,000 words = 5 credits
- 2,000 words = 8 credits
- 5,000 words = 20 credits

---

## Coupon Types Supported

| Type | Example | Behavior |
|------|---------|----------|
| percentage | SAVE20 | 20% off price |
| fixed | SAVE10 | $10 off price |
| bonus_credits | BONUS500 | Adds 500 credits |
| first_payment | WELCOME50 | 50% off first payment |
| free_trial | FREE7DAYS | Temporary trial access |

---

## Database Changes (Migration 010)

### Extended Tables
- `plans` — added: max_projects, max_documents, max_article_length, max_reports_per_month, report_history_days, sort_order, badge, is_popular, exports, support_level, target_audience
- `subscriptions` — added: billing_cycle, provider, provider_subscription_id, cancelled_at
- `coupons` — added: coupon_type, bonus_credits, description, applicable_plan, billing_cycle, min_amount, max_per_user, new_users_only, first_payment_only, created_by
- `payments` — added: billing_cycle, discount_amount, coupon_id, final_amount, webhook_verified, metadata
- `credit_logs` — added: balance_after, reference_id, reference_type

### New Tables
- `coupon_redemptions` — id, coupon_id, user_id, payment_id, discount_applied, credits_granted, billing_cycle, plan_slug, created_at

### RLS Policies
- plans: public read, admin write
- subscriptions: user read, admin all
- payments: user read
- coupon_redemptions: user read, admin all

---

## Subscription Architecture

**Table:** `subscriptions`

Fields: id, user_id, plan_slug, status, billing_cycle, provider, provider_subscription_id, current_period_start, current_period_end, cancelled_at, created_at

Statuses: active, cancelled, expired, past_due

Billing cycles: monthly, yearly

---

## Payment Provider Selected

**Primary:** Paddle (international)

Rationale: Paddle handles tax compliance, subscription billing, and global payments as a Merchant of Record. Simpler integration than Stripe for SaaS.

**Secondary (Pakistan):** JazzCash (future implementation)

**Status:** Architecture ready, no real credentials configured.

---

## Admin Functionality

### Admin Plans (existing page)
- View all plans with prices, credits, features
- Edit plan details
- Enable/disable plans

### Admin Coupons (existing page)
- Create, edit, delete coupons
- Enable/disable coupons
- View usage count
- Search/filter

### Admin Credits (existing page)
- View user credit balances
- Add/remove credits

---

## API Routes Created

| Route | Method | Purpose |
|-------|--------|---------|
| /api/public/plans | GET | Public plans list |
| /api/public/workflow-settings | GET | Credit costs (public) |
| /api/public/coupons/validate | POST | Validate coupon code |
| /api/domain-intelligence | POST | Domain analysis |

---

## Limitations

1. **Payment integration** — Paddle credentials not configured. Checkout buttons route to signup. Webhook architecture not implemented (requires Paddle account).
2. **Subscription activation** — Currently manual via admin. Automated activation requires payment webhook.
3. **Coupon redemption tracking** — Table created but no automated redemption flow (requires payment integration).
4. **Credit cost tiers** — Post Generator word-count tiers are display-only. Actual credit deduction uses `workflow_settings.credits_cost` flat rate.

---

## Migration Required

Run `supabase/migrations/010_monetization_architecture.sql` via Supabase Dashboard or CLI:

```bash
supabase db push
# or apply manually via Supabase SQL Editor
```

This will:
1. Extend existing tables with new columns
2. Create coupon_redemptions table
3. Update plans to correct prices
4. Add domain-intelligence to workflow_settings
5. Set up RLS policies
