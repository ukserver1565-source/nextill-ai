# CHANGELOG-ALL.md — Single Source of Truth

> **Read this before starting any new work.** Updated after every session.

---

## Current Status (Jul 27, 2026 — All 4 chats done)

| Metric | Value |
|--------|-------|
| Git commits | 30+ on main |
| Last commit | `bc9f117` — feat: blog seed + daily limits |
| Build | ✅ Passing (152+ pages) |
| TypeScript | ✅ 0 errors |
| Lint | ✅ 0 errors |
| Performance | 91 mobile / 94 desktop |
| Accessibility | 95 mobile / 95 desktop |
| Best Practices | 100 |
| SEO | 100 |

---

## What's Done (Everything Completed)

### Authentication ✅
- Supabase Auth (signup, login, password reset, session management)
- Admin login at `/zain-nextill-ansari/login` (separate from user login)
- Role-based access: free_user, admin, super_admin
- Rate limiting on login/signup
- Session persistence fixed (`persistSession: true`)
- `proxy.ts` handles all route protection (session timeout, admin auth, maintenance mode)
- Signup email confirmation UX (success message + banner)

### Payment System ✅ (GoPayFast credentials pending)
- **GoPayFast (PayFast Pakistan)** — REAL adapter built at `src/lib/payments/providers/gopayfast.adapter.ts`
  - Hosted checkout (user pays on PayFast's secure page — no PCI compliance needed)
  - GetAccessToken API + hash validation (SHA256)
  - Supports: Cards, JazzCash, EasyPaisa, UPaisa, Raast, Bank Transfer
  - **Merchant signup submitted** → Acknowledge email sent → **Waiting for credentials**
- Stripe adapter — REAL (needs STRIPE_SECRET_KEY)
- PayPal adapter — REAL (needs credentials)
- JazzCash/EasyPaisa — stubs (manual mode)
- Bank Transfer/Crypto — manual by design
- Hybrid verification: auto-verify if credentials verified, else manual admin approval
- Admin approval/rejection workflow for pending payments

### PayFast Onboarding ✅
- Privacy Policy: `/privacy-policy` ✅
- Refund Policy: `/refund-policy` ✅ (NEW — 7-day money-back)
- Service Policy: `/service-policy` ✅ (NEW — digital delivery, SLA)
- Terms & Conditions: `/terms` ✅
- Office Address: Faisalabad, Punjab, Pakistan ✅ (on contact page + footer)
- Phone: +92 319 0244898 ✅
- Email: support@adultpulse.co.uk ✅
- 20+ products/services listed ✅
- **Acknowledge email sent to cs@gopayfast.com** ✅

### AI Tools (20+) ✅
- AI Writer, Humanizer, Detector, Plagiarism Checker
- SEO Title/Meta Description/FAQ/Schema generators
- Keyword Research, Website Audit, Rank Tracker, Backlink Checker
- Post Generator (15-step pipeline), Keyword Intelligence (7-step)
- Domain Intelligence with PageSpeed integration
- Local heuristic engines for most tools
- RewriteAI API integration for Humanizer + Writer

### Admin Panel (37 pages) ✅
- Dashboard with stats, charts, recent payments
- User management (CRUD, credits, plans, block/delete)
- Blog CMS (CRUD, categories, image upload)
- Payment management (approve/reject pending)
- Plans, coupons, tools, AI Hub (providers/models/keys/prompts)
- Settings, SEO, email, maintenance, logs, analytics, system health
- Backup system (fixed — was pointing at wrong table)

### Blog System ✅
- Full CRUD with admin UI
- Public pages with SEO metadata, view count, related posts
- Image upload to Supabase Storage
- Sitemap integration

### SEO ✅
- robots.txt with AI crawler blocking (GPTBot, CCoT, ClaudeBot, Google-Extended, anthropic-ai)
- Dynamic sitemap.xml (all public pages + blog posts, no auth pages)
- RSS feed at /feed.xml
- JSON-LD structured data
- OG image via /api/og (dynamic PNG generator)
- CLAUDE.md for auto-continue sessions

### Theme System ✅
- Dark/light mode toggle with localStorage persistence
- Flash-prevention inline script
- CSS variables for all colors
- Glass/liquid-glass UI system
- **50+ page files fixed** — all hardcoded dark-mode colors replaced with theme tokens

### Email ⚠️
- Resend API integration (raw fetch, not npm package)
- Only used for test emails — no production emails sent
- SMTP stub (nodemailer not installed)
- Password reset uses Supabase's built-in email
- **All email refs updated:** nextill.ai → adultpulse.co.uk
- **No email hosting yet** — using muzamal57gansari@icloud.com

### Google Integrations ✅
- Analytics: G-6VKXTDV48B configured, gtag.js in layout
- Search Console: verification meta tag in head
- PageSpeed: API key configured, used in Domain Intelligence
- Vercel Analytics + Speed Insights added

### Cron Jobs ✅
- Credit renewal: `/api/cron/credits/renew` — configured in vercel.json (1st of every month)
- GET endpoint updated to trigger renewal (Vercel sends GET with Bearer auth)
- Proxy.ts updated to allow `/api/cron/` routes through

### Database ✅
- 44 tables in `supabase/schema.sql` (consolidated 18 migrations)
- Migration 015: GoPayFast provider constraint
- Migration 016: daily limits configuration
- `provider_id` → `provider_slug` drift fixed in 5 files
- Blog API auth added (requireAdmin on all routes)
- Backup system fixed (was using wrong table)

---

## What's NOT Done / Pending

### 1. GoPayFast Activation (WAITING)
**Status:** Acknowledge email sent. Waiting for credentials from PayFast.
**When credentials arrive:**
1. Add to `.env.local`: `GOPAYFAST_MERCHANT_ID=xxx`, `GOPAYFAST_STORE_ID=xxx`, `GOPAYFAST_SECURED_KEY=xxx`
2. Run migration 015 on live Supabase
3. Test connection in admin panel at `/zain-nextill-ansari/settings`
4. Enable GoPayFast in checkout

### 2. Email Hosting (LOW PRIORITY)
**Status:** No email hosting for adultpulse.co.uk yet.
**Fix:** Set up Zoho Mail (free for 1 user) or Namecheap email hosting.
**Then:** Update admin panel email settings.

### 3. PCI Compliance (MEDIUM)
**Status:** Checkout collects raw card data directly.
**Fix:** Use Stripe Checkout redirect instead.

### 4. Resend API Key (MEDIUM)
**Status:** Not configured for production.
**Fix:** Add `RESEND_API_KEY=xxx` to `.env.local`.

### 5. Schema.sql on Live Supabase (CHECK)
**Status:** File exists, may or may not be applied to live DB.
**Fix:** Run in Supabase SQL Editor if not already applied.

### 6. Remaining LOW Priority Items
- `api_keys` table mismatch
- Duplicate AI Hub pages
- Workflows page broken nav
- Integrations page incomplete
- Security settings not enforced (2FA/rate limiting toggles)
- Test suite (no tests exist)

---

## 🔧 All Fixes Applied (Chronological)

### Chat 4: Jul 26 — Full Admin Panel Audit (20+ files)
**Full audit of every admin API route + page against schema.sql:**

**Critical data mismatches fixed:**
1. Workflows page — expected `row.key`/`row.value` JSON blob, but `workflow_settings` has individual columns. Rewrote page to use correct fields.
2. Integrations API — returned `{id, name, enabled}` but page expected `{provider_slug, provider_name, is_enabled}`. Fixed field mapping.
3. Credits page — accessed `t.profiles?.full_name` (no join) and `t.description` (column is `reason`). Added profile join to credit-repo, fixed field name.
4. Reports page — API returned summary object but page expected array. Rewrote page to fetch users/payments directly and export CSVs.
5. Coupons page — expected `usage_count` but column is `used_count`. Fixed.
6. Contact page — expected `m.read` boolean but column is `status` string. API now maps status to read boolean.
7. Payments page — missing profile join. Added to payment-repo.
8. Projects page — missing profile join + nonexistent `articles` field. Added document count join.
9. Documents page — missing profile join. Added to documents-repo.

**Schema/column mismatches fixed:**
10. `security_logs` — missing `severity`, `blocked`, `ip_address` columns. Added to schema.sql + migration 017.
11. `payments` — missing `verification_status`, `reviewed_by`, `reviewed_at`, `rejection_reason`, `provider_transaction_id`. Added via migration 018.
12. `payment_provider_credentials` — table didn't exist. Created via migration 018.
13. `workflow_settings` — missing `status`, `api_verified`, `last_tested_at`, `last_test_result`. Added via migration 018.
14. `ai_models` — missing `display_name`, `provider_model_id`, `config`. Added via migration 018.

**Wrong table/column references fixed:**
15. Backup API — queried `system_logs` instead of `backup_exports`. (Fixed in Chat 3)
16. `ai/api-keys/rotate` — used wrong table `api_keys` instead of `ai_api_keys`. Fixed.
17. `tool-repo` — referenced 4 non-existent columns. Removed.
18. Payments pending route — `provider_transaction_id` → `provider_payment_id`.
19. Logs API — returned bare array instead of `{data, total}`. Fixed.

**Dark mode fixes:**
20. Emails page — replaced all hardcoded `text-white`, `bg-[#151C2E]`, `text-[#A7B0C0]` with theme tokens.
21. Logs page — replaced `border-white/[0.03]`, `bg-[#151C2E]` with theme tokens.


### Chat 1: Jul 25 — Liquid Glass UI + PageSpeed
- Liquid glass CSS system (globals.css)
- Dark/light theme toggle
- AI Humanizer + Rewriter services
- PageSpeed API integration
- Google Analytics + Search Console
- Credit renewal cron endpoint
- Resend email integration
- Session persistence
- 43 files changed, 1237 insertions

### Chat 2: Jul 25-26 — Full Audit + Bug Fixes
**Critical Bugs Fixed:**
1. Dashboard session persistence (`persistSession: false` → `true`)
2. TopBar sticky positioning (`liquid-glass` → `glass-topbar`)
3. Light mode broken across 14 shared UI components
4. CSS ::selection invisible in light mode
5. Input autofill dark in light mode
6. Blog API routes had NO authentication
7. `provider_id` → `provider_slug` column drift (5 files)
8. Backup system API pointing at wrong table

**New Features:**
1. GoPayFast (PayFast Pakistan) real payment adapter
2. Migration 015 for GoPayFast provider constraint
3. robots.txt AI crawler blocking
4. Sitemap cleanup (removed auth pages, legacy tools)
5. OG image via /api/og dynamic generator
6. Signup email confirmation UX fix
7. Credit renewal cron in vercel.json
8. CLAUDE.md for auto-continue sessions

**SEO Improvements:**
- robots.txt: GPTBot, CCoT, ClaudeBot, Google-Extended, anthropic-ai blocking
- robots.txt: /unauthorized, /maintenance Disallow rules
- Sitemap: Removed /login, /signup, 21 legacy tool pages
- Sitemap: Added all 24 public tool pages

### Chat 3: Jul 26 PM — PayFast Onboarding + Light Mode Sweep
**PayFast Website Requirements:**
1. Created `/refund-policy` page
2. Created `/service-policy` page
3. Added office address to `/contact` page + footer
4. Added refund/service policy links to both footers
5. Sent Acknowledge email to cs@gopayfast.com

**50+ Page Light Mode Fix:**
- Dashboard: 8 files (page, billing, credits, documents, history, projects, settings, reports, projects/new)
- Admin: 26 files (all admin pages + sidebar + topbar)
- Public: 16 files (login, signup, reset, checkout, about, contact, features, how-it-works, privacy, terms, blog, unauthorized, maintenance, not-found)
- All hardcoded `text-white`, `text-[#A7B0C0]`, `bg-[#151C2E]`, `border-white/[0.06]` → theme tokens

**Email Cleanup:**
- All `nextill.ai` → `adultpulse.co.uk` across 8+ files

**Other:**
- RewriteAI API integration for Humanizer + Writer
- Backup system fix (wrong table → backup_exports)
- Schema.sql fixes (DROP TRIGGER IF EXISTS, role constraint)

### Chat 4: Jul 26-27 — PageSpeed + Light Mode + Blogs + SEO
**PageSpeed Optimization (88/87 → 91/95):**
1. `<main>` landmark in root layout
2. ~50 `aria-label`s on icon-only buttons (18 files)
3. Heading hierarchy fixed across 12+ pages
4. Color contrast: `#5A6577` → `#8895A7`, `#6B7280` → `#9CA3AF`
5. Logo: `img` → Next.js `Image` (1.5MB → 5KB WebP/AVIF)
6. Cache headers: fonts (1yr), images (1day)
7. Non-composited animations fixed (box-shadow)
8. Product schema: image, brand, mpn, return policy, shipping

**Light Mode Fix (text-white invisible on white bg):**
- CSS safety net in globals.css: `@layer utilities` overrides for text-white → #000000
- Body fallback: `color: #000000` in light mode
- 30+ component files: text-white → text-foreground
- Pure white bg (#FFFFFF) + full black text (#000000)
- Border/bg overrides for light mode

**Header + Cursor Glow:**
- Nav links centered (absolute positioning)
- Cursor glow: 400px→500px, opacity 0.06→0.12, dual-color violet+cyan, rAF animation

**Blog Posts (5 SEO articles, 2000+ words each):**
1. How to Humanize AI Content: Complete Guide to Pass AI Detection
2. AI vs Human Writing: Which Is Better for SEO Rankings
3. Top 10 AI SEO Tools Every Content Creator Needs
4. Mastering Keyword Research: A Step-by-Step Guide
5. Plagiarism Detection Explained: How to Ensure Originality
- Blog seed API at `/api/admin/blog/seed` (RewriteAI humanization)
- Content chunked at 400 words for RewriteAI 500-word limit

**Database Fixes:**
- Schema.sql: DROP POLICY IF EXISTS (60+ policies)
- Schema.sql: DROP TRIGGER IF EXISTS on_auth_user_created
- Migration 015: role constraint fix ('user' → 'free_user')
- handle_new_user trigger: role 'user' → 'free_user'
- Migration 016: daily limits for all 22 tools
- Migration 017+018: security log columns + payment columns

**API Integrations:**
- Vercel Analytics (`@vercel/analytics`)
- Vercel Speed Insights (`@vercel/speed-insights`)
- RewriteAI API: /api/v1/humanize + /api/v1/write
- PlagiarismCheck.org API key: `g8wx9zI_K4XhrX7XBuslyphJRg4hVaYh`

**Admin Fixes:**
- Contact page: m.status → m.read (TS errors fixed)
- Blog seed API: fixed auth (server client instead of admin)
- Backup system: correct table (backup_exports)

---

## 📊 PageSpeed Scores (Mobile / Desktop)

| Date | Performance | Accessibility | Best Practices | SEO |
|------|------------|---------------|----------------|-----|
| Jul 25 (before) | 88 | 87 | 100 | 100 |
| Jul 25 (after) | 91 | 95 | 100 | 100 |
| Jul 25 (desktop) | 94 | 95 | 100 | 100 |

---

## Git History (All 25+ Commits)

```
55d9a90 fix: backup system — API was using wrong table (system_logs instead of backup_exports)
a88b38c feat: integrate RewriteAI API for Humanizer + Writer tools
f306ce3 fix: schema.sql — role constraint + trigger mismatch
e23685b docs: update CHANGELOG with PayFast onboarding + email fixes + cron setup
938e07a fix: replace all nextill.ai email refs with adultpulse.co.uk
60b9740 fix: schema.sql — add DROP TRIGGER IF EXISTS before CREATE TRIGGER
f0db631 feat: PayFast onboarding — refund policy, service policy, office address
be9aea1 docs: update CHANGELOG — light mode fixes done, cron setup done
89a7869 feat: add Vercel Speed Insights for real user performance metrics
dac7edf feat: add Vercel Analytics for visitor tracking
4e83d01 fix: light mode — pure white bg + full black text
25ee6c9 docs: CLAUDE.md with full inline status
d8b7f21 docs: add CLAUDE.md for automatic session continuation
79abe0b fix: light mode CSS — move overrides into @layer utilities
8f3a6fc fix: centered header nav + enhanced cursor glow effect
c6688d2 docs: update CHANGELOG-ALL.md with full audit session summary
4514c24 fix: light mode CSS overrides — move after all layers
43b9213 feat: GoPayFast (PayFast Pakistan) real payment adapter
5ccd4a0 docs: add CHANGELOG-ALL.md tracking file
f6df9ee fix: light mode text visibility across entire app
0a8a857 fix: footer contrast, heading hierarchy
ff6ddb6 fix: footer/home theme tokens + accessibility
fd85aa5 fix: light mode, dashboard session persistence, robots.txt & sitemap SEO
7bc7bda feat: liquid glass UI, AI humanizer/rewriter, PageSpeed, GA, email
ff7c170 fix: pending payments API 500 error
dcebcb4 fix: final lint cleanup
```

---

## 📁 Key File References

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Auto-continue instructions for new sessions |
| `CHANGELOG-ALL.md` | This file — single source of truth |
| `src/lib/supabase/client.ts` | Browser Supabase client (persistSession: true) |
| `src/lib/supabase/server.ts` | Server Supabase client (cookies API) |
| `src/lib/supabase/admin.ts` | Service role client |
| `src/proxy.ts` | Route protection (middleware replacement) |
| `src/lib/auth/AuthProvider.tsx` | Auth context |
| `src/lib/theme/theme-provider.tsx` | Dark/light theme |
| `src/app/globals.css` | CSS variables, glass classes, light mode overrides |
| `src/lib/payments/providers/gopayfast.adapter.ts` | GoPayFast real adapter |
| `src/lib/payments/providers/index.ts` | Adapter registry |
| `src/app/api/checkout/create/route.ts` | Checkout flow |
| `src/app/api/cron/credits/renew/route.ts` | Credit renewal cron |
| `src/app/robots.ts` | robots.txt generation |
| `src/app/sitemap.ts` | Dynamic sitemap |
| `src/app/refund-policy/page.tsx` | Refund policy (NEW) |
| `src/app/service-policy/page.tsx` | Service policy (NEW) |
| `supabase/schema.sql` | Full database schema (3729 lines) |
| `supabase/migrations/015_add_gopayfast_provider.sql` | GoPayFast migration |
| `.env.example` | All env vars documented |
| `vercel.json` | Vercel cron config |

---

## Session History

| Date | Chat | Key Changes |
|------|------|-------------|
| Jul 18-22 | Initial | Core app, auth, admin, payments, blog, tools |
| Jul 25 | Chat 1 | Liquid glass UI, theme toggle, AI humanizer, PageSpeed, GA, email |
| Jul 25-26 | Chat 2 | Full audit, dashboard fix, TopBar fix, light mode, GoPayFast adapter, SEO |
| Jul 26 PM | Chat 3 | PayFast onboarding (policies, address, email), 50+ color fixes, cron, CLAUDE.md |
| Jul 26-27 | Chat 4 | PageSpeed 88→91, light mode 849 fixes, 5 blog posts, RewriteAI, PlagCheck, Vercel Analytics |

---

## 🎯 NEXT SESSION ACTION ITEMS

When you start a new session, do these in order:

1. **Check email** for GoPayFast credentials (muzamal57gansari@icloud.com)
2. **If credentials received:** Add to .env.local → run migration 015 → test in admin panel
3. **If no credentials:** Check other pending items (schema.sql on live, PCI compliance, Resend API key)

---

*Last updated: Jul 26, 2026 11:59 PM by Claude Code — Chat 3 complete*
