# Nextill AI — Complete Audit Report

**Date:** 2026-07-07
**Auditor:** Lead Software Architect & QA Engineer
**Scope:** Full codebase, schema, infrastructure, UI/UX, security, performance

---

## Critical Issues

### CRIT-1: Middleware Cookie Propagation Bug (Session Kill)
**File:** `src/middleware.ts:100-113`
The `setAll` handler writes cookies to the Request object but never propagates them to the Response. When Supabase refreshes an expiring session, the new cookies are silently discarded. Users experience random session drops ~1 hour after login.
**Fix:** Capture `NextResponse.next()` and call `response.cookies.set(name, value)` for each cookie.

### CRIT-2: Dual Repository Systems (14 Old + 14 New)
**Files:** `src/lib/repositories/*`
Two complete, independent repository layers map to two different DB schemas. The "old" repos (`plan-repo.ts`, `tool-repo.ts`, etc.) use columns from `001_initial_schema.sql` that DON'T EXIST in `combined-migration.sql`. The "new" repos (`plans.repository.ts`, `tools.repository.ts`, etc.) use the correct schema. Both are active simultaneously.
**Impact:** ~30 column mismatches across all old repos. Every old-repo query will return empty results or fail silently at runtime.

### CRIT-3: All 21 Tool Pages Return Placeholder/Mock Data
**File:** `src/lib/services/tool-runner.service.ts`
Every tool handler prefixes output with `[Local Engine]` and generates randomized mock data (`Math.random()` scores, hardcoded keyword lists, fake backlinks). Only `ai-writer` attempts a real Gemini call (falls back to placeholder on failure). The other 20 tools never attempt any real API call.
**Impact:** Production output is entirely fake data with messages like "Connect Copyleaks API for production results."

### CRIT-4: `remove_credits` RPC Function Missing
**Files:** `supabase/combined-migration.sql`, `src/lib/repositories/credit-repo.ts:57`
Code calls `supabaseAdmin.rpc("remove_credits", ...)` but no such function exists in any migration file. The actual function is named `deduct_credits`. Runtime crash on first credit deduction.
**Partially fixed in session but original file still has `remove_credits` in old repo.

### CRIT-5: `tool-api-handler.ts` Queries Wrong Column `slug`
**File:** `src/lib/services/tool-api-handler.ts:34`
Queries `.eq("slug", toolSlug)` on the `tool_settings` table. The actual column is `tool_slug`. Returns "Tool configuration not found" for every tool. **All tool API calls are broken.**

### CRIT-6: `guest-usage.repository.ts` Uses Non-Existent Columns
**File:** `src/lib/repositories/guest-usage.repository.ts`
Uses `guest_id`, `input_chars`, `output_chars` — none exist in the `guest_usage` table. Actual columns: `ip_hash`, `fingerprint_hash`, `usage_count`, `usage_date`. Entire guest usage tracking system is non-functional.

### CRIT-7: `003_seed.sql` Uses Invalid UUIDs
**File:** `supabase/migrations/003_seed.sql`
Uses string IDs like `'plan_free'`, `'tool_ai_writer'` for `uuid` primary key columns. PostgreSQL will reject these with "invalid input syntax for type uuid". Migration cannot be applied.

### CRIT-8: `credit_logs` Type `'deducted'` Violates Check Constraint
**File:** `src/lib/repositories/credits.repository.ts:8`
Type interface allows `'deducted'` but the DB check constraint only allows `'added' | 'removed' | 'used'`. All credit deductions will fail with a constraint violation.

### CRIT-9: API Keys Committed in `.env.local`
**File:** `.env.local`
`SUPABASE_SERVICE_ROLE_KEY` (secret!), `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` are all in plaintext in the workspace.
**Action:** Rotate all keys immediately. Git-ignore `.env.local`.

### CRIT-10: Next.js v16.2.10 Does Not Exist
**File:** `package.json`
`"next": "^16.2.10"` — Next.js 16 is not released as of July 2026. Installation will fail (version not found on npm registry). `eslint-config-next` has the same issue.

### CRIT-11: Duplicate Data Definitions (`data.ts` vs `utils.ts`)
**Files:** `src/lib/data.ts`, `src/lib/utils.ts`
Both export `trendData`, `trafficData`, `keywordData`, `projectList`, `sidebarMenu`, `quickActions` with DIFFERENT content. The `sidebarMenu` in `utils.ts` references routes that don't exist (`/content-optimizer`, `/serp-analyzer`, `/competitor-analysis`, `/page-speed-analyzer`, `/broken-link-checker`). Components importing from one file get different data than components importing from the other.

### CRIT-12: Dynamic Tailwind Classes in `admin-metric-card.tsx`
**File:** `src/components/admin/admin-metric-card.tsx:28-31`
Constructs classes like `text-${color}` and `border-${color}/20` dynamically. Tailwind's JIT compiler cannot resolve these. The resulting classes (e.g., `text-text-blue-400`) will never be generated. **All admin metric card colors and borders are non-functional.**

### CRIT-13: Theme Toggle Does Nothing / Dark Mode Is Permanent
**File:** `src/components/layout/topbar.tsx:58-67`, `src/app/globals.css`
The theme toggle icon changes between Sun/Moon but never applies any class to `<html>` or persists the preference. `globals.css` defines ONLY dark mode variables — no light mode exists. The application is permanently stuck in dark mode with a non-functional toggle.

### CRIT-14: `admin-modal.tsx` Uses Hardcoded Background Color
**File:** `src/components/admin/admin-modal.tsx:46`
Uses `bg-[#0a0a1a]` instead of a theme variable like `bg-background` or `bg-card`. This breaks the modal when the theme changes (not that it can change, but the pattern is wrong).

### CRIT-15: Duplicate `signup` / `userSignup` Functions
**File:** `src/lib/auth/actions.ts:26-43, 67-81`
Two byte-for-byte identical signup functions. Only `userSignup` is imported anywhere. `signup` is dead code.

### CRIT-16: No Server-Side Input Validation on Auth Actions
**File:** `src/lib/auth/actions.ts`, `src/lib/auth/admin-actions.ts`
All server actions cast form data as `string` with zero validation. The Zod schemas (`loginSchema`, `signupSchema`) defined in `src/lib/validations/auth.schema.ts` are never imported or used. Client-side HTML validation is trivially bypassable.

### CRIT-17: Unconfirmed Users Can Fully Log In
**File:** `src/lib/auth/actions.ts` (login), `admin-actions.ts` (adminLogin)
Neither checks `data.user.email_confirmed_at`. Users with unverified emails can access the dashboard and consume credits before confirming.

### CRIT-18: Admin APIs Have No Independent Role Checks (Single Point of Failure)
**Files:** `src/app/api/admin/*`
Every admin API route trusts the middleware exclusively. If middleware is bypassed, reconfigured, or crashes, all admin endpoints are fully exposed. No route handler independently verifies session or profile role.

---

## High Priority

### HIGH-1: Duplicate `user.service.ts` Files
**Files:** `src/lib/services/user-service.ts` (hyphen), `src/lib/services/user.service.ts` (dot)
Both export `userService` with different implementations. `user-service.ts` uses `add_credits` RPC; `user.service.ts` calls non-existent `remove_credits` RPC. Admin API routes import from `user-service.ts`, but other code may import the wrong one.

### HIGH-2: Duplicate Error/Loading Components
**Files:** `src/components/shared/error-state.tsx`, `src/lib/hooks/use-admin-data.tsx`
`ErrorState` is defined in two places (shared component + hook file). `LoadingSkeleton` duplicates `loading-state.tsx` functionality. The hook file should not contain JSX components.

### HIGH-3: `admin-analytics.tsx` Has Hardcoded Chart Data
**File:** `src/app/admin/analytics/page.tsx`
`monthlyRevenue` array is hardcoded (Jan: $1200, Feb: $1800, etc.). Not real Supabase data.

### HIGH-4: No Public `/blog` Page
Admin has full blog CRUD. Blog posts exist in Supabase. But there is no `/blog` or `/blog/[slug]` route for public viewing.

### HIGH-5: No Maintenance Page When Mode Is Active
Admin can toggle maintenance mode (`/admin/maintenance`), but middleware never checks it. Users continue to see the app normally.

### HIGH-6: `KeywordsChart` Receives Empty Data
**File:** `src/app/dashboard/page.tsx:75`
`<KeywordsChart data={[]} />` — renders an empty chart with axes but no data.

### HIGH-7: Dashboard `/dashboard/history` Is Empty State
**File:** `src/app/dashboard/history/page.tsx`
Shows only "No History Yet" with no data fetching. Should query `usage_logs` for the current user.

### HIGH-8: Dashboard `/dashboard/billing` Is Static Placeholder
**File:** `src/app/dashboard/billing/page.tsx`
Shows hardcoded "Free Plan" card. "View Plans" button has no handler or link.

### HIGH-9: `Quick Create` Button Has No Handler
**File:** `src/components/layout/topbar.tsx:40`
The `+` button renders with no `onClick` handler. Does nothing.

### HIGH-10: `Upgrade` Button Routes Nowhere
**File:** `src/components/layout/topbar.tsx:70`
The "Upgrade" credits button has no route or handler.

### HIGH-11: `settings-repo.ts` Queries `id = 'default'` on UUID Column
**File:** `src/lib/repositories/settings-repo.ts:19,25`
The `site_settings` table has auto-generated UUID primary keys. Searching by literal `'default'` will never match. Returns empty every time.

### HIGH-12: `admin_user_id` Has No Foreign Key
**Table:** `admin_logs`
No FK constraint on `admin_logs.admin_user_id` → `auth.users(id)`. Referential integrity not enforced.

### HIGH-13: `subscriptions` Table Has No INSERT/UPDATE RLS
**Table:** `subscriptions`
No policies allow authenticated users or admin users to insert or update subscriptions. All subscription mutations must use `supabaseAdmin` (service_role) or fail.

### HIGH-14: `profiles` Table Has No INSERT RLS Policy
**Table:** `profiles`
The trigger creates profiles via `security definer`, but there's no way to manually create profiles via the API (admin panel user creation).

### HIGH-15: Dead Components (5 Unused)
**Files:**
- `src/components/layout/status-bar.tsx` — never imported in any layout
- `src/components/layout/right-insight-panel.tsx` — never imported in any layout
- `src/components/layout/floating-ai-button.tsx` — never imported in any layout
- `src/components/layout/command-palette.tsx` — never instantiated (TopBar accepts `onSearchOpen` but never passes it)
- `src/components/shared/empty-state.tsx` — never imported (GenericToolPage uses `EmptyState` from `tool-layout.tsx`)
- `src/components/shared/error-state.tsx` — never imported (GenericToolPage uses `ErrorBox` from `tool-layout.tsx`)

---

## Medium Priority

### MED-1: No Admin Audit Trail for `supabaseAdmin` Operations
Every mutation via service_role key bypasses RLS with zero logging. The `admin_logs` table exists with RLS but no code writes to it. If middleware is compromised, no forensic trace remains.

### MED-2: No Rate Limiting on Auth Endpoints
`login`, `adminLogin`, `signup`, `forgotPassword` have no application-level rate limiting. Brute-force, spam-account creation, and email flooding are unthrottled.

### MED-3: No CSRF Protection on API Mutations
All POST/PATCH/DELETE admin API routes accept JSON without CSRF tokens. SameSite cookies provide partial protection but no defense-in-depth.

### MED-4: Middleware vs Client-Side Auth Redirect Conflict
**Files:** `src/middleware.ts`, `src/app/dashboard/layout.tsx`, `src/app/admin/layout.tsx`
Both independently check auth and redirect. This causes:
- Duplicate DB round-trips for profile role
- Flash of protected content before hydration redirect
- Potential redirect loop on `/admin/login`

### MED-5: `forgotPassword` Uses Public Env Var for Redirect
**File:** `src/lib/auth/actions.ts:50`
Uses `NEXT_PUBLIC_SITE_URL` for the password reset redirect URL. This is a client-accessible variable. An attacker who can manipulate this value could redirect reset links to a phishing site. Should be a server-only variable.

### MED-6: Sidebar Collapse Hides Most Items
**File:** `src/components/layout/sidebar.tsx:160`
When collapsed, only the first item per section is shown (`section.items.slice(0, 1)`). Most sidebar items are completely inaccessible in collapsed mode.

### MED-7: No Mobile Sidebar Overlay
Sidebar has no responsive behavior for small screens (<768px). No hamburger menu, no off-canvas overlay. On mobile, the sidebar occupies full width or collapsed width with no way to toggle.

### MED-8: Missing ARIA Attributes
- `admin-modal.tsx`: no `role="dialog"`, `aria-modal`, `aria-labelledby`
- `tooltip.tsx`: no `role="tooltip"`, missing `aria-describedby`
- `pulse-gauge.tsx`: SVG missing `role="img"` and `aria-label`
- `command-palette.tsx`: search input missing `aria-label`
- `status-bar.tsx`: indicators missing `role="status"` or `aria-live`

### MED-9: Duplicate `Wrench` Import in `admin-sidebar.tsx`
**File:** `src/components/admin/admin-sidebar.tsx:8,11`
`Wrench` is imported twice: once directly, once aliased as `WrenchIcon`.

### MED-10: Unused Imports
- `pulse-score.tsx`: imports `TrendingDown` — never used
- `admin-sidebar.tsx`: imports `ChevronDown`, `ChevronRight` — never used
- `admin-sidebar.tsx`: imports `Wrench` twice
- `dashboard/page.tsx`: imports `ScrollArea` — never used

### MED-11: `tool.service.ts` Is Dead Code
**File:** `src/lib/services/tool.service.ts`
Imports from old repos (`tool-repo`, `credit-repo`, `profile-repo`) and calls non-existent `remove_credits` RPC. No file in the codebase imports from this service.

### MED-12: `analytics-service.ts` Queries Non-Existent Table
**File:** `src/lib/services/analytics-service.ts`
Queries `supabaseAdmin.from("analytics")` — no `analytics` table exists in any migration. Runtime crash.

### MED-13: `credit-repo.ts` (Old) Calls Non-Existent RPC
**File:** `src/lib/repositories/credit-repo.ts:57`
Calls `supabaseAdmin.rpc("remove_credits", ...)`. No such function exists. Runtime crash.

### MED-14: `user.service.ts` (Dot) Calls Non-Existent RPC
**File:** `src/lib/services/user.service.ts:29`
Calls `creditRepo.remove()` which calls `remove_credits` RPC. Runtime crash.

### MED-15: No `sharp` Dependency
Missing from `package.json`. Required for Next.js production image optimization.

### MED-16: Empty Next.js Config
**File:** `next.config.ts`
No `images`, `rewrites`, `redirects`, `headers`, `output`, or `experimental` settings. Turbopack is commented out as unsupported.

### MED-17: `.env.example` Has `NEXT_PUBLIC_SITE_URL` as `http://localhost:3000`
Needs updated URL for production deployment.

### MED-18: Missing `ANTHROPIC_API_KEY` from `.env.example`
Seed data references Claude models but no env var is documented.

---

## Low Priority

### LOW-1: `logout()` Swallows Error
**File:** `src/lib/auth/actions.ts:63`
If `signOut()` fails, the error is only `console.error`'d and the redirect still happens. User is redirected to `/login` even if session wasn't actually invalidated.

### LOW-2: Unauthorized Page Shows Wrong Link for Admin
**File:** `src/app/unauthorized/page.tsx:27-29`
If an admin reaches this page (edge case), the link points to `/admin/login` instead of `/admin`.

### LOW-3: Guest ID Spoofing in Tool API
**File:** `src/lib/services/tool-api-handler.ts:50`
Guest IDs are generated server-side and returned to the client. A guest can spoof another guest's ID to consume their daily rate limit quota.

### LOW-4: Redundant Credit Storage
`handle_new_user` trigger inserts `credits = 100` into BOTH `profiles.credits` AND `credits.balance`. Two sources of truth for the same value.

### LOW-5: `profile-repo.ts` `getStats()` Loads All Rows In-Memory
**File:** `src/lib/repositories/profile-repo.ts:68-87`
Fetches ALL profile rows with `.select("*")`, then filters/aggregates in JavaScript. Will be slow at scale.

### LOW-6: `tool.service.ts` Inefficient Tool Lookup
**File:** `src/lib/services/tool.service.ts`
Calls `.select("*")` for all tools, then filters in-memory. Should use `.eq("tool_slug", slug)`.

### LOW-7: `ai_models` Seed Uses Wrong Conflict Target
**File:** `supabase/migrations/003_seed.sql`
Uses `on conflict (id)` but the unique constraint is on `(provider, model_name)`. Conflict resolution won't work.

### LOW-8: Missing Index in Individual Migration
The `idx_ai_models_provider_model` index exists in `combined-migration.sql` but is missing from the individual `001_core_tables.sql`.

### LOW-9: `Button asChild` Prop Never Implemented
**File:** `src/components/ui/button.tsx:39`
The prop is defined but the component always renders a `<button>` element. `asChild` has no effect.

### LOW-10: `tsconfig.json` `target: "ES2017"` Is Outdated
Modern Next.js apps should use at minimum `ES2022` or `ESNext`.

### LOW-11: Generic README
**File:** `README.md`
Contains only the generic Next.js starter template. No project-specific documentation (setup, env vars, architecture, deployment).

### LOW-12: `pricing` Page Credits Disagree with Schema
**File:** `src/app/pricing/page.tsx`
Lists "50 credits/month" for Free plan, but `handle_new_user` trigger sets `credits = 100`. Inconsistency between marketing and actual allocation.

### LOW-13: No `redirects` in `next.config.ts`
Old routes (e.g., `/backlink-analyzer`, `/internal-link-builder`) were removed but there are no 301 redirects.

---

## Development Roadmap (0% → 100%)

### Phase 1: Foundation & Critical Fixes (0% → 30%)

| Step | Task | Est. Effort |
|------|------|-------------|
| 1.1 | Fix `package.json` versions (next → v15.x, zod → v3.x, etc.) | 30 min |
| 1.2 | Fix middleware cookie propagation | 1 hr |
| 1.3 | Rotate exposed API keys; fix `.gitignore` for `.env.local` | 15 min |
| 1.4 | Fix `003_seed.sql` — remove hardcoded non-UUID IDs | 30 min |
| 1.5 | Delete all 14 old repos; switch services to new repos | 3 hr |
| 1.6 | Fix `tool-api-handler.ts` — `.eq("tool_slug", ...)` and correct column names | 30 min |
| 1.7 | Fix `guest-usage.repository.ts` — use `ip_hash`, `fingerprint_hash`, `usage_date` | 30 min |
| 1.8 | Fix `credit_logs` — change `'deducted'` to `'removed'` | 5 min |
| 1.9 | Fix `remove_credits` → `deduct_credits` RPC in all callers | 15 min |
| 1.10 | Consolidate `data.ts`/`utils.ts` into single source of truth | 1 hr |
| 1.11 | Add missing RLS policies (profiles INSERT, subscriptions INSERT/UPDATE) | 1 hr |
| 1.12 | Fix `admin-metric-card.tsx` — replace dynamic Tailwind with static class maps | 30 min |
| 1.13 | Fix `admin-modal.tsx` — replace `#0a0a1a` with theme variable | 5 min |

**Phase 1 total:** ~9 hrs (estimated)

### Phase 2: Auth & Security Hardening (30% → 45%)

| Step | Task | Est. Effort |
|------|------|-------------|
| 2.1 | Add server-side Zod validation to all auth server actions | 1 hr |
| 2.2 | Check `email_confirmed_at` in login flows | 15 min |
| 2.3 | Remove duplicate `signup` function | 5 min |
| 2.4 | Consolidate duplicate `user.service.ts` / `user-service.ts` | 1 hr |
| 2.5 | Add independent role checks in admin API route handlers | 2 hr |
| 2.6 | Add rate limiting on auth endpoints | 1 hr |
| 2.7 | Implement admin audit logs (`admin_logs` table writes in all admin mutations) | 2 hr |
| 2.8 | Add CSRF protection to mutation endpoints | 1 hr |
| 2.9 | Change `forgotPassword` to use server-only env var | 5 min |
| 2.10 | Fix middleware/layout redirect conflict — consolidate auth logic | 2 hr |
| 2.11 | Add FK constraint on `admin_logs.admin_user_id` | 5 min |

**Phase 2 total:** ~10.5 hrs

### Phase 3: AI Provider Integration (45% → 60%)

| Step | Task | Est. Effort |
|------|------|-------------|
| 3.1 | Implement OpenAI provider (real API calls) | 2 hr |
| 3.2 | Implement Copyleaks provider (plagiarism, AI detection) | 2 hr |
| 3.3 | Implement DataForSEO provider (keyword research, rank tracking, backlinks) | 3 hr |
| 3.4 | Implement PageSpeed provider (website audit) | 1 hr |
| 3.5 | Implement DeepSeek provider | 1 hr |
| 3.6 | Connect all 21 tool handlers to their respective providers | 4 hr |
| 3.7 | Replace all `[Local Engine]` placeholders with real generated content | 1 hr |
| 3.8 | Connect Dashboard AI Command Center to real generation | 1 hr |

**Phase 3 total:** ~15 hrs

### Phase 4: UI/UX & Component Cleanup (60% → 75%)

| Step | Task | Est. Effort |
|------|------|-------------|
| 4.1 | Implement real dark/light theme toggle with persistence | 2 hr |
| 4.2 | Add light mode CSS variables to `globals.css` | 1 hr |
| 4.3 | Fix responsive sidebar (mobile overlay/off-canvas) | 3 hr |
| 4.4 | Wire Quick Create button to new document/project flow | 1 hr |
| 4.5 | Wire Upgrade button to `/pricing` | 5 min |
| 4.6 | Implement real command palette | 2 hr |
| 4.7 | Add ARIA attributes to modal, tooltip, gauge, icon-only buttons | 1 hr |
| 4.8 | Remove dead components (status-bar, right-insight-panel, floating-ai-button) | 30 min |
| 4.9 | Consolidate duplicate ErrorState/LoadingSkeleton components | 30 min |
| 4.10 | Remove duplicate `Wrench` import, remove unused imports | 15 min |

**Phase 4 total:** ~11.5 hrs

### Phase 5: Missing Pages & Dashboard Completion (75% → 88%)

| Step | Task | Est. Effort |
|------|------|-------------|
| 5.1 | Create public `/blog` and `/blog/[slug]` pages | 3 hr |
| 5.2 | Create public maintenance page; wire middleware to check it | 1 hr |
| 5.3 | Implement real user activity history on `/dashboard/history` | 1 hr |
| 5.4 | Implement real plan/subscription display on `/dashboard/billing` | 2 hr |
| 5.5 | Connect `KeywordsChart` to real keyword data | 1 hr |
| 5.6 | Replace hardcoded admin analytics with real Supabase queries | 2 hr |
| 5.7 | Implement PDF export for admin reports | 2 hr |
| 5.8 | Add 301 redirects for old removed routes | 30 min |

**Phase 5 total:** ~12.5 hrs

### Phase 6: Polish, SEO & Performance (88% → 100%)

| Step | Task | Est. Effort |
|------|------|-------------|
| 6.1 | Add `sharp` dependency for image optimization | 5 min |
| 6.2 | Configure `next.config.ts` (images, headers, redirects, output) | 1 hr |
| 6.3 | Add comprehensive metadata/SEO to all pages | 2 hr |
| 6.4 | Update `README.md` with project documentation | 1 hr |
| 6.5 | TypeScript strictness pass — replace `any` casts with proper types | 3 hr |
| 6.6 | Add Supabase type generation (`supabase gen types`) | 30 min |
| 6.7 | Replace in-memory aggregations with DB-level queries | 1 hr |
| 6.8 | Update `tsconfig.json` target to `ES2022` | 5 min |
| 6.9 | Fix pricing page credits to match actual allocation | 5 min |
| 6.10 | Final build verification (`npx tsc --noEmit && npm run build`) | 30 min |

**Phase 6 total:** ~9.5 hrs

---

### Grand Total Estimated Effort: ~68 hours (17 days at 4 hrs/day)

### Risk Factors
- **AI provider integration** is ~22% of total effort and depends on third-party API availability and documentation
- **Old repo deletion** could cascade to services that aren't immediately obvious — thorough grep required
- **Middleware rewrite** affects every protected route — must be regression-tested thoroughly
- **Theme implementation** requires careful CSS variable management to avoid visual regressions

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Critical Issues | 18 |
| High Priority | 15 |
| Medium Priority | 18 |
| Low Priority | 13 |
| **Total** | **64** |

| Metric | Value |
|--------|-------|
| Routes | 97 (all build successfully) |
| TypeScript Errors | 0 (`npx tsc --noEmit` passes) |
| Build Errors | 0 (`npm run build` passes) |
| Dead Components | 5 |
| Dead Code Files | ~8 |
| Schema Mismatches | ~30+ |
| Duplicate Files | ~6 pairs |
| Unused Imports | 4 components |
| Missing Pages | 2 public + 1 maintenance |
