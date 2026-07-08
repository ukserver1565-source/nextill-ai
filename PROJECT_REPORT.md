# Nextill AI — Complete Project Report

> Generated: 2026-07-07 | Build: ✅ Zero errors | 97 Pages | 21 Tools

---

## 1. Overview

**Nextill AI** is a full-stack Next.js 16 AI & SEO platform with 21 built-in tools, admin dashboard, user dashboard, authentication, and credit-based billing.

| Metric | Value |
|--------|-------|
| Pages (routes) | 97 |
| API routes | 44 (21 tools + 23 admin) |
| Components | 38 |
| Services | 10 |
| Repositories | 28 |
| AI Providers | 7 (1 real: Gemini, 6 stubs) |
| Migrations | 4 SQL files |
| Database tables | 14 |

---

## 2. Architecture

```
src/
├── app/                         # Next.js App Router
│   ├── (tools)/                 # 21 tool pages (all use GenericToolPage)
│   ├── admin/                   # 18 admin pages + layout
│   ├── dashboard/               # 7 dashboard pages + layout
│   ├── api/
│   │   ├── admin/               # 23 admin API route files
│   │   └── tools/               # 22 tool API route files (21 tools + 1 save)
│   ├── login/                   # Login + forgot password
│   ├── signup/                  # Registration
│   ├── reset-password/          # Password reset (PKCE + hash flows)
│   ├── unauthorized/            # Access denied
│   ├── pricing/                 # Pricing page
│   ├── contact/                 # Contact form
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/
│   ├── ui/                      # 9 base UI components
│   ├── layout/                  # Sidebar, Topbar, StatusBar, InsightPanel
│   ├── charts/                  # KeywordsChart, TrafficChart, PulseGauge, MiniChart
│   ├── dashboard/               # MetricCards, QuickActions, ProjectsSection, etc.
│   ├── admin/                   # AdminSidebar, AdminTopbar
│   ├── tools/                   # GenericToolPage, ToolCard
│   └── shared/                  # LoadingState, ErrorState, EmptyState, CommandPalette, FloatingButton
├── lib/
│   ├── auth/                    # AuthProvider, actions.ts, admin-actions.ts
│   ├── supabase/                # client.ts, server.ts, admin.ts
│   ├── services/                # tool-api-handler, tool-runner, content, billing, etc.
│   ├── repositories/            # 28 repo files (14 dash-style + 14 dot-style)
│   ├── ai/providers/            # 7 AI providers (registry pattern)
│   ├── tools/registry.ts        # Tool definitions (536 lines)
│   ├── validations/             # 12 Zod schemas
│   └── migrations/              # 2 SQL files (legacy)
├── middleware.ts                 # Auth proxy (Next.js 16)
└── hooks/                       # use-admin-data hook
```

---

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.10 (Turbopack) |
| Language | TypeScript 5.9 (strict mode) |
| Styling | Tailwind CSS v4 + PostCSS |
| Auth | Supabase SSR (@supabase/ssr 0.12) |
| Database | Supabase PostgreSQL |
| AI | Gemini API (others stubbed) |
| Animation | Framer Motion 11 |
| Charts | Recharts 2 |
| Icons | Lucide React |
| Validation | Zod 4 |
| Component Variants | class-variance-authority |
| Utilities | clsx, tailwind-merge |

---

## 4. Files Changed (Fixes Applied)

### Session 1 — Critical: Auth & Middleware

| File | Change | Severity |
|------|--------|----------|
| `src/middleware.ts` | **Cookie propagation fix** — `_createClient` now creates a `response` object and writes cookies to `response.cookies` (not just `request.cookies`). Without this, Supabase session refresh tokens were silently lost, causing random session drops. | CRITICAL |
| `src/middleware.ts` | **Guest → /admin guard** — Added `!profile` check before `!isAdmin` for admin routes, so a stale/anonymous session with no profile row redirects to `/admin/login` instead of `/unauthorized`. | HIGH |
| `src/lib/supabase/server.ts` | **Added read-only client** — `createSupabaseServerClientReadOnly()` with no-op `setAll` prevents "Cookies can only be modified in a Server Action or Route Handler" error in Server Components. | HIGH |
| `src/app/admin/layout.tsx` | Same `!profile` → `/admin/login` guard on the client side. | HIGH |

### Session 2 — Critical: AI Writer 404 & "Tool configuration not found"

| File | Change | Severity |
|------|--------|----------|
| `src/lib/services/tool-api-handler.ts` | **`.eq("slug", ...)` → `.eq("tool_slug", ...)`** — The query was using the wrong column name, returning zero results and a 404. | CRITICAL |
| `src/lib/services/tool-api-handler.ts` | **Column name fixes**: `enabled` → `is_enabled`, `name` → `tool_name`, `guest_limit` → `guest_daily_limit` — all to match the actual DB schema. | HIGH |
| `src/lib/services/tool-api-handler.ts` | **`getSession()` → `getUser()`** — Supabase SSR recommendation for secure auth checks in Route Handlers. | MEDIUM |
| `src/app/api/tools/ai-writer/save/route.ts` | **`getSession()` → `getUser()`** — Same security fix. | MEDIUM |

### Session 2 — Password Reset & Hydration

| File | Change | Severity |
|------|--------|----------|
| `src/app/reset-password/page.tsx` | **Added PKCE `?code=` flow** via `exchangeCodeForSession()`. The old code only handled the legacy `#access_token=` hash fragment. Modern Supabase projects use PKCE. | HIGH |
| `src/app/reset-password/page.tsx` | **Expired link UI** — Shows email input + "Send New Reset Link" button when the code/token is invalid. | HIGH |
| `src/app/reset-password/page.tsx` | **`useRef` guard** — Prevents double exchange in React Strict Mode. | MEDIUM |
| `src/app/layout.tsx` | **`suppressHydrationWarning`** added to `<html>` to suppress browser extension (Grammarly) warnings. | LOW |

### Session 3 — Additional Bug Fixes

| File | Change | Severity |
|------|--------|----------|
| `src/lib/validations/profile.schema.ts` | **Fixed role enum**: `"free_user"` → `"user"` to match the DB CHECK constraint. Admin role update would have been rejected by PostgreSQL. | HIGH |
| `src/lib/admin-api.ts` | **Fixed DELETE /api-keys**: Was sending `DELETE` with JSON body to `/api/keys` (collection), now sends `DELETE` to `/api/keys/${id}` (resource). | MEDIUM |

---

## 5. Known Issues (Not Fixed — Requires Further Work)

### 5.1 Dual Repository Systems (28 files)

There are **two parallel repository systems** with conflicting column schemas:

| Style | Files | Schema Version | Status |
|-------|-------|----------------|--------|
| `-repo.ts` (dash) | 14 files: `tool-repo`, `profile-repo`, `plan-repo`, `credit-repo`, etc. | Old schema: `slug`, `name`, `enabled`, `guest_limit` | Used by `tool.service.ts` |
| `.repository.ts` (dot) | 14 files: `tools.repository`, `profiles.repository`, `plans.repository`, etc. | New schema: `tool_slug`, `tool_name`, `is_enabled`, `guest_daily_limit` | Used by admin API routes |

**Risk**: The `tool-api-handler.ts` now uses the new schema (after fixes in Session 2), but `tool.service.ts` still imports from the old `tool-repo`. If the deployed DB has only one schema, the other set will fail at runtime with "column does not exist" errors.

**Fix required**: Consolidate all repos to use one schema. Recommended: the `001_core_tables.sql` schema (`tool_slug`, `tool_name`, `is_enabled`, `guest_daily_limit`).

### 5.2 Missing Database Objects

| Object | Referenced By | Missing From Migrations |
|--------|--------------|------------------------|
| `usage_logs` table | `tool.service.ts`, `usage.repository.ts` | Not in any SQL migration |
| `guest_usage` table | `guest-usage.repository.ts`, `tool-api-handler.ts` | Not in any SQL migration |
| `credit_logs` table | `tool-api-handler.ts`, `credits.repository.ts` | Not in `001_core_tables.sql` |
| `add_credits` RPC | `credit-repo.ts`, `credits.repository.ts`, `user-service.ts` | Not in `004_functions.sql` |
| `deduct_credits` RPC | `tool-api-handler.ts`, `credits.repository.ts` | Not in `004_functions.sql` |

### 5.3 Tool Runner Returns Random/Mock Data

21 tool handlers in `tool-runner.service.ts` — only `ai-writer` attempts a real Gemini API call. All others return `Math.random()` placeholder data:

| Tool | Provider | Status |
|------|----------|--------|
| AI Writer | Gemini | ✅ Real AI |
| AI Humanizer | Gemini fallback | ⚠️ Placeholder |
| AI Detector | Copyleaks | ❌ Not implemented |
| Plagiarism Checker | Copyleaks | ❌ Not implemented |
| Keyword Research | DataForSEO | ❌ Not implemented |
| Website Audit | DataForSEO | ❌ Not implemented |
| Rank Tracker | DataForSEO | ❌ Not implemented |
| Backlink Checker | DataForSEO | ❌ Not implemented |
| Sitemap Generator | OpenAI | ❌ Not implemented |
| Robots.txt Generator | OpenAI | ❌ Not implemented |

### 5.4 Missing Error Boundaries

Zero `error.tsx` or `loading.tsx` files exist in the entire app. Uncaught errors in any page will crash the full layout.

### 5.5 Secrets Committed

`.env.local` with live API keys (SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY) is tracked in git. The `.gitignore` has `.env*` but the file was committed before being added to gitignore.

### 5.6 Missing `sharp` Dependency

`sharp` is required by Next.js for production image optimization but is only present as a transitive dependency. A clean install (`npm ci`) may not include it.

---

## 6. Build Verification

```
✓ Compiled successfully in 12.5s
✓ TypeScript — zero errors (strict mode)
✓ All 97 pages generated
✓ 44 dynamic API routes registered
✓ Proxy (Middleware) — running
```

| Route Category | Count | Status |
|----------------|-------|--------|
| Static pages | 71 | ✅ All generated |
| API tool routes | 22 | ✅ All dynamic |
| API admin routes | 23 | ✅ All dynamic |

---

## 7. Summary of All Project Files

```
Total files: ~250+
Source files: ~180 (TS/TSX)
Route pages: 97
API endpoints: 44
Components: 38
Services: 10
Repository files: 28 (14 duplicate pairs)
Validation schemas: 12 (+1 alternate)
AI provider implementations: 7 (1 real, 6 stubs)
SQL migration files: 4 (+1 combined + 2 legacy)
Configuration files: 9 (package.json, tsconfig, next.config, postcss, eslint, etc.)
```

---

## 8. Environment Variables Required

| Variable | Set? | Used By |
|----------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase clients |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Admin operations |
| `SUPABASE_JWT_SECRET` | ❌ (placeholder) | JWT verification |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Auth redirects |
| `GEMINI_API_KEY` | ✅ | AI Writer (Gemini) |
| `OPENAI_API_KEY` | ❌ | OpenAI provider (stub) |
| `DEEPSEEK_API_KEY` | ❌ | DeepSeek provider (stub) |
| `COPYLEAKS_API_KEY` | ❌ | AI Detection, Plagiarism |
| `DATAFORSEO_LOGIN` | ❌ | Keyword Research, etc. |
| `DATAFORSEO_PASSWORD` | ❌ | Keyword Research, etc. |
| `PAGESPEED_API_KEY` | ❌ | Website Audit |
