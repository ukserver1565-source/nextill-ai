# CLAUDE.md — Project Instructions

## ⚠️ DO THIS FIRST — Every Session, No Exceptions

Run these 2 commands, then start working on item #1 below:

```bash
git log --oneline -5
cat CHANGELOG-ALL.md
```

Then START WORKING on the first pending item. Do NOT ask the user what to do.

---

## CURRENT STATUS (Last updated: Jul 26, 2026)

**Last commit:** `d8b7f21` — docs: add CLAUDE.md
**Build:** ✅ Passing (152 pages, 0 TS errors, 0 lint errors)
**Site:** https://www.adultpulse.co.uk
**Repo:** https://github.com/ukserver1565-source/nextill-ai.git

---

## PENDING ITEMS (Do in this order)

### 1. GoPayFast merchant approval — CHECK EMAIL
GoPayFast (PayFast Pakistan) merchant signup was submitted for:
- Name: Zain Ali
- Company: Nextill AI
- Email: muzamal57gansari@icloud.com
- URL: adultpulse.co.uk

**If approved:** Get Merchant ID, Store ID, Secured Key from GoPayFast dashboard.
Then:
- Add to `.env.local`: `GOPAYFAST_MERCHANT_ID=xxx`, `GOPAYFAST_STORE_ID=xxx`, `GOPAYFAST_SECURED_KEY=xxx`
- Run migration `supabase/migrations/015_add_gopayfast_provider.sql` on live Supabase
- Test connection in admin panel at `/zain-nextill-ansari/settings`

### 2. Run schema.sql on live Supabase (if not done)
The file `supabase/schema.sql` (3729 lines) is fully idempotent — safe to run anytime.

### 3. Fix ~50 page files with hardcoded dark-mode colors
Pages still use `text-white`, `bg-[#151C2E]`, `text-[#A7B0C0]` instead of theme tokens.
Visual issue in light mode only — pages still load and function.

### 4. Set up credit renewal cron
API route exists at `/api/cron/credits/renew` but no cron job is configured.
Add to vercel.json: `{ "crons": [{ "path": "/api/cron/credits/renew", "schedule": "0 0 1 *" }] }`

### 5. Configure RESEND_API_KEY
Add `RESEND_API_KEY=xxx` to `.env.local` for production emails.

### 6. PCI compliance fix
Checkout collects raw card data directly — should use Stripe Checkout redirect instead.

---

## WHAT'S ALREADY DONE (Don't redo)

- ✅ Auth system (Supabase Auth, admin login, role-based access)
- ✅ Dashboard (projects, documents, credits, billing, history, reports, settings)
- ✅ Admin panel (37 pages, all wired to real DB)
- ✅ 20+ AI tools with real execution
- ✅ Blog system (CRUD + public + SEO)
- ✅ Payment system (GoPayFast adapter built, Stripe/PayPal adapters exist)
- ✅ Dark/light theme toggle
- ✅ Liquid glass UI
- ✅ SEO (robots.txt, sitemap, OG image, JSON-LD)
- ✅ Google Analytics (G-6VKXTDV48B)
- ✅ Google Search Console (verification tag)
- ✅ PageSpeed API integration
- ✅ proxy.ts route protection (session timeout, admin auth, maintenance mode)
- ✅ Session persistence fixed
- ✅ TopBar sticky fixed
- ✅ 14 shared UI components fixed for light mode
- ✅ Blog API auth added
- ✅ provider_id drift fixed
- ✅ Signup email confirmation UX fixed

---

## ARCHITECTURE

- **Stack:** Next.js 16, Supabase, Tailwind CSS v4
- **No `tailwind.config`** — CSS-based config in globals.css with `@theme inline`
- **No `middleware.ts`** — uses `src/proxy.ts` (Next.js 16 equivalent)
- **Theme:** Custom ThemeProvider, `data-theme` attribute, CSS variables
- **Glass:** `.liquid-glass` (has overflow:hidden), `.glass-topbar` (safe for sticky), `.glass-card`
- **Payment:** Hybrid manual/auto via `payment_provider_credentials.is_verified`
- **Database:** 44 tables, supabase/schema.sql is single source of truth
- **Admin panel:** `/zain-nextill-ansari` (37 pages)
- **Env vars:** See `.env.example` for full list

## AFTER MAKING CHANGES

1. `npx tsc --noEmit` — must pass
2. `npm run lint` — 0 errors
3. `npm run build` — must pass
4. Update `CHANGELOG-ALL.md` with what was done
5. `git add -A && git commit -m "description" && git push origin main`
