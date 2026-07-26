# CHANGELOG-ALL.md — Single Source of Truth

> **Read this before starting any new work.** Updated after every session.

---

## Current Status (Jul 27, 2026)

| Metric | Value |
|--------|-------|
| Git commits | 30+ on main |
| Last commit | `528e44b` — fix: full admin panel audit |
| Build | ✅ Passing (152+ pages) |
| TypeScript | ✅ 0 errors |
| Lint | ✅ 0 errors, 18 warnings |
| Performance | 91 mobile / 94 desktop |
| Accessibility | 95 mobile / 95 desktop |
| Best Practices | 100 |
| SEO | 100 |

---

## What's Done

### Authentication ✅
- Supabase Auth (signup, login, password reset, session management)
- Admin login at `/zain-nextill-ansari/login` (separate from user login)
- Role-based access: free_user, admin, super_admin
- Rate limiting on login/signup
- Session persistence fixed (`persistSession: true`)
- `proxy.ts` handles all route protection (session timeout, admin auth, maintenance mode)
- Signup email confirmation UX (success message + banner)

### Payment System ✅ (GoPayFast credentials pending)
- **GoPayFast (PayFast Pakistan)** — REAL adapter built
  - Hosted checkout (no PCI compliance needed)
  - GetAccessToken API + hash validation (SHA256)
  - Supports: Cards, JazzCash, EasyPaisa, UPaisa, Raast, Bank Transfer
  - **Merchant signup submitted → Waiting for credentials**
- Stripe adapter — REAL (needs STRIPE_SECRET_KEY)
- PayPal adapter — REAL (needs credentials)
- Admin approval/rejection workflow for pending payments
- `payment_provider_credentials` table + review columns added (migration 018)

### PayFast Onboarding ✅
- Privacy Policy, Refund Policy (7-day money-back), Service Policy, Terms
- Office Address: Faisalabad, Punjab, Pakistan
- Phone: +92 319 0244898
- Email: support@adultpulse.co.uk
- 20+ products/services listed
- Acknowledge email sent to cs@gopayfast.com

### AI Tools (20+) ✅
- AI Writer, Humanizer, Detector, Plagiarism Checker
- SEO Title/Meta Description/FAQ/Schema generators
- Keyword Research, Website Audit, Rank Tracker, Backlink Checker
- Post Generator (15-step pipeline), Keyword Intelligence (7-step)
- Domain Intelligence with PageSpeed integration
- Local heuristic engines for most tools
- RewriteAI API integration for Humanizer + Writer

### Admin Panel (37 pages) ✅ — All field mismatches fixed
- Dashboard with stats, charts, recent payments
- User management (CRUD, credits, plans, block/delete)
- Blog CMS (CRUD, categories, image upload)
- Payment management (approve/reject pending)
- Plans, coupons, tools, AI Hub (providers/models/keys/prompts)
- Settings, SEO, email, maintenance, logs, analytics, system health
- Backup system (fixed — uses backup_exports table with real export logic)
- **Full audit completed** — all API routes and pages verified against schema.sql

### Blog System ✅
- Full CRUD with admin UI
- 5 SEO blog posts (2000+ words each) with seed API
- Image upload to Supabase Storage
- Sitemap integration

### SEO ✅
- robots.txt with AI crawler blocking
- Dynamic sitemap.xml (all public pages + blog posts)
- RSS feed at /feed.xml, JSON-LD, OG image
- CLAUDE.md for auto-continue sessions

### Theme System ✅
- Dark/light mode toggle with localStorage persistence
- Flash-prevention inline script
- CSS variables for all colors
- Glass/liquid-glass UI system
- **50+ page files fixed** — all hardcoded dark-mode colors replaced with theme tokens

### Email ⚠️
- Resend API integration (raw fetch, not npm package)
- No production emails sent yet
- No email hosting for adultpulse.co.uk yet

### Google Integrations ✅
- Analytics: G-6VKXTDV48B, Search Console, PageSpeed API
- Vercel Analytics + Speed Insights

### Cron Jobs ✅
- Credit renewal: `/api/cron/credits/renew` (1st of every month)

### Database ✅
- 46+ tables in `supabase/schema.sql`
- Migrations 015-018 applied
- All schema/code mismatches resolved

---

## What's NOT Done / Pending

### 1. GoPayFast Activation (WAITING)
**Status:** Acknowledge email sent. Waiting for credentials from PayFast.
**When credentials arrive:**
1. Add to `.env.local`: `GOPAYFAST_MERCHANT_ID=xxx`, `GOPAYFAST_STORE_ID=xxx`, `GOPAYFAST_SECURED_KEY=xxx`
2. Test connection in admin panel at `/zain-nextill-ansari/settings`
3. Enable GoPayFast in checkout

### 2. Email Hosting (LOW PRIORITY)
**Fix:** Set up Zoho Mail (free for 1 user) or Namecheap email hosting.

### 3. PCI Compliance (MEDIUM)
**Status:** Checkout collects raw card data directly.
**Fix:** Use Stripe Checkout redirect instead.

### 4. Resend API Key (MEDIUM)
**Fix:** Add `RESEND_API_KEY=xxx` to `.env.local`.

### 5. Remaining Items
- Duplicate AI Hub pages (`/zain-nextill-ansari/ai-hub/*` duplicates standalone pages)
- Security settings not enforced (2FA/rate limiting toggles save to DB but no backend enforcement)
- Test suite (no unit/integration/E2E tests exist)

---

## 🔧 All Fixes Applied (Chronological)

### Today's Session — Jul 27 (3 Chats)

#### Chat 1: Backup System Fix
1. **Backup API** — queried `system_logs` instead of `backup_exports`. Rewrote GET/POST/DELETE to use correct table.
2. **POST backup** — now gathers real data from settings/prompts/providers, stores as JSON with size tracking.
3. **Backup UI** — color-coded type badges (full/settings/prompts/providers), delete button, dismissible errors.
4. **Backup routes** — added admin auth checks (requireAdmin).

#### Chat 2: Full Admin Panel Audit — Part 1 (Schema + API Fixes)
5. **`ai/api-keys/rotate`** — wrong table `api_keys` → `ai_api_keys`, wrong columns `provider_id` → `provider_slug`, `key_preview` → `key_prefix`.
6. **`tool-repo`** — 4 non-existent columns removed (`status`, `api_verified`, `last_tested_at`, `last_test_result`).
7. **`security_logs`** — added missing columns: `severity`, `blocked`, `ip_address`. Migration 017 created.
8. **`payments`** — added missing columns: `verification_status`, `reviewed_by`, `reviewed_at`, `rejection_reason`, `provider_transaction_id`. Migration 018.
9. **`payment_provider_credentials`** — table didn't exist. Created via migration 018.
10. **`workflow_settings`** — added missing columns: `status`, `api_verified`, `last_tested_at`, `last_test_result`. Migration 018.
11. **`ai_models`** — added missing columns: `display_name`, `provider_model_id`, `config`. Migration 018.
12. **Payments pending route** — `verification_status` filter value fixed, `provider_transaction_id` → `provider_payment_id`.
13. **Logs API** — returned bare array instead of `{data, total}`. Fixed.
14. **schema.sql** — updated with all new tables and columns.

#### Chat 3: Full Admin Panel Audit — Part 2 (Page + Repo Fixes)
15. **Workflows page** — expected `row.key`/`row.value` JSON blob but `workflow_settings` has individual columns. Rewrote page.
16. **Integrations API** — returned `{id, name, enabled}` but page expected `{provider_slug, provider_name, is_enabled}`. Fixed.
17. **Credits page** — added `profiles:user_id(full_name)` join to credit-repo, fixed `t.description` → `t.reason`.
18. **Payments page** — added `profiles:user_id(full_name, email)` join to payment-repo.
19. **Projects page** — added `profiles:user_id(full_name)` + `documents:documents(count)` joins. Fixed `proj.articles` → document count.
20. **Documents page** — added `profiles:user_id(full_name)` join to documents-repo.
21. **Reports page** — API returned summary object but page expected array. Rewrote to fetch users/payments directly.
22. **Coupons page** — `usage_count` → `used_count` (matching schema).
23. **Contact page** — API now maps `status` string to `read` boolean for backward compatibility.
24. **Emails page** — replaced all hardcoded `text-white`, `bg-[#151C2E]`, `text-[#A7B0C0]` with theme tokens.
25. **Logs page** — replaced `border-white/[0.03]`, `bg-[#151C2E]` with theme tokens.

### Earlier Sessions (Jul 18-26)
See full details in git history — 25+ commits covering:
- Core app build (auth, admin, payments, blog, tools)
- Liquid glass UI + theme toggle
- PageSpeed optimization (88→91 mobile)
- Light mode fixes (50+ files)
- GoPayFast payment adapter
- SEO (robots.txt, sitemap, OG image)
- PayFast onboarding (policies, address)
- Blog posts (5 SEO articles)
- RewriteAI + PlagiarismCheck APIs
- Vercel Analytics + Speed Insights

---

## 📊 PageSpeed Scores

| Date | Performance | Accessibility | Best Practices | SEO |
|------|------------|---------------|----------------|-----|
| Jul 25 (before) | 88 | 87 | 100 | 100 |
| Jul 25 (after) | 91 | 95 | 100 | 100 |
| Jul 25 (desktop) | 94 | 95 | 100 | 100 |

---

## Git History (Recent)

```
528e44b fix: full admin panel audit — 20+ field mismatches and schema fixes
bc9f117 feat: 5 SEO blog posts + seed API + daily limits + TS fixes
1244506 feat: blog seed + daily limits + RewriteAI
55d9a90 fix: backup system — API was using wrong table
a88b38c feat: integrate RewriteAI API for Humanizer + Writer tools
f306ce3 fix: schema.sql — role constraint + trigger mismatch
e23685b docs: update CHANGELOG with PayFast onboarding + email fixes
938e07a fix: replace all nextill.ai email refs with adultpulse.co.uk
60b9740 fix: schema.sql — add DROP TRIGGER IF EXISTS
f0db631 feat: PayFast onboarding — refund policy, service policy, office address
```

---

## Migrations (Applied to Live Supabase ✅)

| # | Name | Purpose |
|---|------|---------|
| 015 | `add_gopayfast_provider.sql` | GoPayFast provider constraint |
| 016 | `configure_daily_limits.sql` | Daily limits for all 22 tools |
| 017 | `add_security_log_columns.sql` | severity, blocked, ip_address on security_logs |
| 018 | `add_payment_columns_and_table.sql` | payments review columns + payment_provider_credentials table + workflow_settings status columns + ai_models columns |

**All 5 SQL queries run in Supabase SQL Editor** ✅

---

## 📁 Key File References

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Auto-continue instructions for new sessions |
| `CHANGELOG-ALL.md` | This file — single source of truth |
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/server.ts` | Server Supabase client |
| `src/lib/supabase/admin.ts` | Service role client |
| `src/proxy.ts` | Route protection |
| `src/app/globals.css` | CSS variables, glass classes, light mode overrides |
| `supabase/schema.sql` | Full database schema |
| `supabase/migrations/015-018` | Recent migrations |
| `.env.example` | All env vars documented |
| `vercel.json` | Vercel cron config |

---

## 🎯 NEXT SESSION ACTION ITEMS

1. **Check email** for GoPayFast credentials (muzamal57gansari@icloud.com)
2. **If credentials received:** Add to .env.local → test in admin panel → enable GoPayFast
3. **If no credentials:** PCI compliance fix, Resend API key, email hosting

---

*Last updated: Jul 27, 2026 by Claude Code*
