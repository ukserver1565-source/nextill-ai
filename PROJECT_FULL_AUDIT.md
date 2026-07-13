# PROJECT_FULL_AUDIT.md — Nextill AI

**Audit Date:** 2026-07-13
**Auditor:** Claude (Senior Software Auditor)
**Project:** Nextill AI (Next.js 16 + Supabase)
**Branch:** main

---

## 1. Executive Summary

Nextill AI is a Next.js 16 + Supabase AI-powered SEO content platform with 20+ tools, 3 major workflows, an admin panel, and user dashboard. The application **builds and compiles cleanly** (0 TypeScript errors, 0 ESLint errors). However, the **data layer is severely broken** — nearly every repository and admin service queries wrong table names or non-existent columns. The app would produce HTTP 500 errors on most admin CRUD operations and several dashboard features at runtime.

**Key statistics:**
- **10 Critical bugs** — Wrong tables, non-existent RPCs, broken inserts
- **22 High bugs** — Wrong column names in every repository interface
- **5 Medium issues** — FK join failures, naming inconsistencies
- **6 Low issues** — Duplicates, unused code
- **48+ total findings**

**Root cause pattern:** The vast majority of issues stem from TypeScript interfaces/services being written against a planned or aspirational schema that differs from the actual SQL migrations. Column naming conventions are inconsistent (e.g., `name` vs `full_name`, `enabled` vs `is_enabled`, `type` vs `discount_type`, `plan_id` vs `plan`). Several services also reference tables that were renamed (e.g., `prompts` → `prompt_templates`, `admin_settings` → `site_settings`).

---

## 2. Confirmed Critical Bugs

### C1: `prompts` table does not exist
- **Severity:** Critical
- **File:** `src/lib/services/admin/prompts.service.ts` (lines 18, 30, 46, 75, 83, 93, 104, 110, 122, 129, 137, 143, 155, 156, 168)
- **Error:** Every `.from("prompts")` call fails — table does not exist
- **Root cause:** Table was renamed to `prompt_templates` in migrations but service was never updated
- **Evidence:** `supabaseAdmin.from("prompts").select("*")`
- **Recommended fix:** Change all `.from("prompts")` to `.from("prompt_templates")`, update column mappings (`content` → `prompt_text`, `tool_slug` → `slug`/`category`)
- **Risk:** Medium — column mappings also need restructuring
- **Test:** Run admin prompt management; verify CRUD

### C2: `admin_settings` table does not exist
- **Severity:** Critical
- **File:** `src/lib/services/admin/settings.service.ts` (lines 32, 49, 70, 75, 84, 104)
- **Error:** Every `.from("admin_settings")` call fails
- **Root cause:** Service queries a table that was never created; actual table is `site_settings` (key-value pairs, not individual type rows)
- **Evidence:** `supabaseAdmin.from("admin_settings").select("*")`
- **Recommended fix:** Create `admin_settings` table via migration, OR rewrite service to use `site_settings` key-value model
- **Risk:** High — fundamentally different data model
- **Test:** Visit admin settings page

### C3: `api_keys` service uses wrong schema
- **Severity:** Critical
- **File:** `src/lib/services/admin/api-keys.service.ts` (lines 47-48, 59, 75-82, 103, 133-135, 153, 167)
- **Error:** Queries `api_keys` table but assumes columns (`provider_id`, `key_encrypted`, `key_preview`, `is_enabled`, `last_tested_at`, `last_test_success`, `updated_at`) that don't exist. Actual `api_keys` table has: `id, user_id, key_hash, name, last_used_at, created_at`.
- **Evidence:** `.select("id, provider_id, name, key_preview, is_enabled, last_tested_at, last_test_success, created_at, updated_at, providers:provider_id(name)")`
- **Root cause:** Service designed for `ai_api_keys`-like table but queries `api_keys` instead
- **Recommended fix:** Query `ai_api_keys` table, or rewrite to match actual `api_keys` schema
- **Risk:** High — complete schema mismatch
- **Test:** List/create/test API keys from admin panel

### C4: `ai_models` service uses wrong schema
- **Severity:** Critical
- **File:** `src/lib/services/admin/models.service.ts` (lines 23-24, 33, 54, 82-86, 98, 115, 126)
- **Error:** Uses non-existent columns: `provider_id` (actual: `provider` or `provider_slug`), `display_name`, `provider_model_id`, `config`, `updated_at`
- **Evidence:** `.select("*, providers:provider_id(name, slug)")` — no `provider_id` FK exists
- **Root cause:** Service designed for schema with UUID FK; migration uses text-based columns
- **Recommended fix:** Rewrite to use actual columns
- **Risk:** High — complete interface and query rewrite
- **Test:** Navigate to admin models page

### C5: `admin_logs` insert uses wrong column names
- **Severity:** Critical
- **File:** `src/lib/repositories/admin-log-repo.ts` (lines 5-11)
- **Error:** Insert uses `admin_id` (actual: `admin_user_id`), `entity` (actual: `target_type`), `entity_id` (actual: `target_id`), `details` (actual: `metadata`)
- **Evidence:** `.from("admin_logs").insert({ admin_id: adminId, action, entity, entity_id: entityId, details })`
- **Root cause:** Column naming changed in migrations but code not updated
- **Recommended fix:** Change to `{ admin_user_id, action, target_type: entity, target_id: entityId, metadata: details }`
- **Risk:** Low
- **Test:** Perform admin action; verify admin_logs entry

### C6: `audit.service.ts` uses wrong columns for `admin_logs` and `system_logs`
- **Severity:** Critical
- **File:** `src/lib/services/admin/audit.service.ts` (lines 23-28, 36, 45-47, 54-59)
- **Error:** admin_logs insert uses `user_id` (actual: `admin_user_id`), `details` (actual: `metadata`). system_logs insert includes non-existent `source` column.
- **Evidence:** `.from("admin_logs").insert({ user_id: userId, details: details || {} })`
- **Root cause:** Column naming mismatch
- **Recommended fix:** Replace `user_id` → `admin_user_id`, `details` → `metadata`; remove `source` from system_logs insert
- **Risk:** Low

### C7: RPC `remove_credits` does not exist
- **Severity:** Critical
- **File:** `src/lib/repositories/credit-repo.ts` (line 57)
- **Error:** `.rpc("remove_credits", ...)` — function not defined in any migration. Only `add_credits` and `deduct_credits` exist.
- **Evidence:** `await supabaseAdmin.rpc("remove_credits", { p_user_id: userId, p_amount: amount })`
- **Recommended fix:** Change to `.rpc("deduct_credits", ...)`
- **Risk:** Low
- **Test:** Remove credits from a user

### C8: `user-service.ts` inserts into `credits` with wrong columns
- **Severity:** Critical
- **File:** `src/lib/services/user-service.ts` (lines 56-61)
- **Error:** After adding credits via RPC, inserts into `credits` table with `{ user_id, amount, type, description }` — but `credits` only has `id, user_id, balance, updated_at`. Columns `amount`, `type`, `description` don't exist.
- **Evidence:** `.from("credits").insert({ user_id: userId, amount, type: "added", description })`
- **Recommended fix:** Change table to `"credit_logs"`, change `description` to `reason`
- **Risk:** Low
- **Test:** Add credits to user via admin; check credit_logs

### C9: `credit-repo.ts` confuses `credits` with `credit_logs`
- **Severity:** Critical
- **File:** `src/lib/repositories/credit-repo.ts` (lines 16-28, 37-39, 46, 52-54)
- **Error:** `list()` queries `credits` table filtering by `type` and `description` columns which don't exist. Should query `credit_logs`.
- **Evidence:** `.from("credits").select("*, profiles!inner(full_name)").eq("type", params.filter.type)`
- **Root cause:** Repo written to serve two purposes but DB splits into `credits` (balance) and `credit_logs` (history)
- **Recommended fix:** `list()` should query `credit_logs` with join to `profiles`
- **Risk:** Medium

### C10: `providers.service.ts` references non-existent `api_key_encrypted` on `ai_providers`
- **Severity:** Critical
- **File:** `src/lib/services/admin/providers.service.ts` (lines 61, 77, 101-103, 127-128, 148-149, 153)
- **Error:** `ai_providers` table has NO `api_key_encrypted` column. That column exists in `ai_api_keys` (separate table).
- **Evidence:** `api_key_preview: p.api_key_encrypted ? maskKey(decrypt(p.api_key_encrypted)) : null`
- **Recommended fix:** Refactor to store/retrieve API keys from `ai_api_keys` table
- **Risk:** Medium — architectural change

---

## 3. Confirmed High Bugs

### H1: `blog-repo.ts` — filters by non-existent `category` column
- **File:** `src/lib/repositories/blog-repo.ts` (line 23)
- **Error:** `.eq("category", ...)` — actual column is `category_id` (UUID FK)
- **Fix:** Change to `.eq("category_id", ...)`

### H2: `blog-repo.ts` — BlogPostRow interface has wrong columns
- **File:** `src/lib/repositories/blog-repo.ts` (lines 8, 13, 15)
- **Error:** `category` (actual: `category_id`), `author` (doesn't exist), `image_url` (doesn't exist)

### H3: `contact-repo.ts` — filters by non-existent `read` column
- **File:** `src/lib/repositories/contact-repo.ts` (lines 21, 32)
- **Error:** `.eq("read", ...)` and `.update({ read: true })` — actual column is `status` (enum: 'unread', 'read', 'replied')

### H4: `profile-repo.ts` — searches by `name` instead of `full_name`
- **File:** `src/lib/repositories/profile-repo.ts` (line 26)
- **Error:** `.or("name.ilike...")` — actual column is `full_name`

### H5: `profile-repo.ts` — filters by non-existent `plan_id`
- **File:** `src/lib/repositories/profile-repo.ts` (lines 32, 68)
- **Error:** `.eq("plan_id", ...)` — actual column is `plan` (text slug). Also `credits_used` and `last_login` don't exist.

### H6: `plan-repo.ts` — orders by non-existent `price` column
- **File:** `src/lib/repositories/plan-repo.ts` (line 21)
- **Error:** `.order("price", ...)` — actual columns are `price_monthly` and `price_yearly`

### H7: `plan-repo.ts` — PlanRow interface has many non-existent columns
- **File:** `src/lib/repositories/plan-repo.ts` (lines 7-14)
- **Error:** `price`, `currency`, `monthly_credits` (actual: `credits`), `tool_access`, `max_projects`, `max_users`, `priority`, `enabled` (actual: `is_active`), `description`

### H8: `coupon-repo.ts` — every column name is wrong
- **File:** `src/lib/repositories/coupon-repo.ts` (lines 7-13)
- **Error:** `type` (actual: `discount_type`), `value` (actual: `discount_value`), `expiry_date` (actual: `expires_at`), `active` (actual: `is_active`), `usage_count` (actual: `used_count`)

### H9: `coupon-repo.ts` — insert uses `usage_count` instead of `used_count`
- **File:** `src/lib/repositories/coupon-repo.ts` (line 23)

### H10: `payment-repo.ts` — filters by non-existent `plan_id`
- **File:** `src/lib/repositories/payment-repo.ts` (line 29)
- **Error:** `.eq("plan_id", ...)` — actual column is `plan_slug`

### H11: `security-log-repo.ts` — joins on wrong column names
- **File:** `src/lib/repositories/security-log-repo.ts` (lines 6-8)
- **Error:** `profiles!left(name)` (actual: `full_name`), filter by `action` (actual: `event_type`), filter by `type` (actual: `event_type`)

### H12: `settings-repo.ts` — queries by `id = "default"` which won't work
- **File:** `src/lib/repositories/settings-repo.ts` (lines 19, 25)
- **Error:** `.eq("id", "default").single()` — `site_settings` has UUID `id`, not string "default". Uses key-value model.

### H13: `model-repo.ts` — orders by non-existent `name` column
- **File:** `src/lib/repositories/model-repo.ts` (line 18)
- **Error:** `.order("name")` — actual column is `model_name`

### H14: `model-repo.ts` — ModelRow interface completely wrong
- **File:** `src/lib/repositories/model-repo.ts` (lines 4-14)
- **Error:** `name`, `enabled` (actual: `is_enabled`), `api_key_placeholder`, `default_for`, `fallback` (actual: `is_fallback`), `usage_count`, `cost_per_request`, `monthly_cost`

### H15: `project-repo.ts` — ProjectRow interface has wrong columns
- **File:** `src/lib/repositories/project-repo.ts` (lines 9-13)
- **Error:** `articles`, `keywords`, `traffic`, `status` don't exist. Actual: `seo_score`, `pulse_score`.

### H16: `tool-repo.ts` — ToolSettingRow includes non-existent `usage_count`
- **File:** `src/lib/repositories/tool-repo.ts` (line 15)

### H17: `tool-api-handler.ts` — updates non-existent `usage_count`
- **File:** `src/lib/services/tool-api-handler.ts` (lines 163-165)
- **Error:** `.update({ usage_count: ... })` on `tool_settings` — column doesn't exist

### H18: `providers.service.ts` — deletes `ai_models` by non-existent `provider_id`
- **File:** `src/lib/services/admin/providers.service.ts` (line 141)
- **Error:** `.from("ai_models").delete().eq("provider_id", id)` — column doesn't exist

### H19: `providers.service.ts` — `is_enabled` vs `enabled` naming inconsistency
- **File:** `src/lib/services/admin/providers.service.ts` (lines 98, 187, 200)
- **Error:** Code uses `is_enabled` but migration column is `enabled`

### H20: `ai_models` — `provider_model_id` and `display_name` don't exist
- **File:** `src/lib/provider/provider-repo.ts` (lines 98-115)
- **Error:** `getModels()` maps to `display_name` and `provider_model_id` which don't exist in `ai_models`

### H21: `tool-settings` — `usage_count` column doesn't exist
- **Files:** `src/lib/services/admin-service.ts` (lines 49-52), `src/lib/services/tool-api-handler.ts` (lines 163-165)
- **Error:** Code reads/writes `usage_count` on `tool_settings` — column doesn't exist

### H22: `api/admin/users` — missing `name` field in create
- **File:** `src/lib/services/user-service.ts` (line 39)
- **Error:** Inserts `role: data.role || "user"` but valid roles are `free_user`, `admin`, `super_admin` — "user" is not in the CHECK constraint
- **Evidence:** `check (role in ('free_user', 'admin', 'super_admin'))`

---

## 4. Medium Issues

### M1: FK join failures for profile lookups
- **Files:** `documents.repository.ts:69`, `project-repo.ts:20`, `payment-repo.ts:20`, `credit-repo.ts:18`, `audit.service.ts:36,45`
- **Error:** `.select("*, profiles!inner(full_name,email)")` — no FK from these tables to `profiles` exists
- **Fix:** Use separate query or define explicit PostgREST relationships

### M2: `content.service.ts` — `getProject` doesn't filter by ID
- **File:** `src/lib/services/content.service.ts` (lines 19-22)
- **Error:** `projectRepo.list({ filter: { id } })` but list ignores `filter.id`

### M3: `tool.service.ts` — imports browser client for server-side insert
- **File:** `src/lib/services/tool.service.ts` (line 4, 41-44)
- **Error:** Imports `supabase` from `@/lib/supabase/client` (browser) for server-side `usage_logs` insert

### M4: `keyword-engine.ts` — `volume: null` cast as number
- **File:** `src/lib/engine/keyword-engine.ts` (line 203)
- **Error:** `volume: null as unknown as number` — type lie that could crash downstream

### M5: `tool-api-handler.ts` — `configResult.data.data` double-unwrap
- **File:** `src/lib/services/tool-api-handler.ts` (line 46)
- **Error:** `configResult.data.data` — `tryDb` returns `{ data: { data } }` from Supabase `.single()` which returns `{ data: row }`. So `configResult.data` is `{ data: row }` and `configResult.data.data` is correct BUT the `!configResult.data.data` check means it misses the case where Supabase returns `{ data: null, error: null }`.

---

## 5. Low Issues

### L1: Unused `supabaseAdmin` in proxy.ts
- **File:** `src/proxy.ts` (lines 7-9)
- **Error:** Creates service-role client at module level but never uses it

### L2: Duplicate encryption code
- **Files:** `src/lib/services/admin/providers.service.ts` and `src/lib/services/admin/api-keys.service.ts`
- **Error:** Identical `encrypt()`, `decrypt()`, `ENCRYPTION_KEY` copy-pasted

### L3: Duplicate document CRUD
- **Files:** `src/lib/repositories/documents.repository.ts` and `src/lib/services/content.service.ts`
- **Error:** Both implement full CRUD for `documents`

### L4: Duplicate model management
- **Files:** `src/lib/repositories/model-repo.ts` and `src/lib/services/admin/models.service.ts`
- **Error:** Both manage `ai_models` with different (both wrong) column assumptions

### L5: Encryption key fallback derives from service-role key
- **Files:** `providers.service.ts:4`, `api-keys.service.ts:4`
- **Error:** If `ENCRYPTION_KEY` not set, rotating `SUPABASE_SERVICE_ROLE_KEY` breaks all encrypted data

### L6: `admin_service.ts` uses `window.prompt` for role/status/credits changes
- **File:** `src/app/admin/users/page.tsx` (lines 131, 141, 151)
- **Error:** Uses `window.prompt()` — crude UX, no validation, no audit trail

---

## 6. Runtime Errors

### R1: Admin CRUD will 500 on most operations
- **Affected:** All admin pages that use wrong-table services (prompts, settings, api-keys, models, credits, coupons, plans, payments, contacts, blog, providers)
- **Root cause:** Wrong table names → Supabase returns error → service throws → API returns 500

### R2: Dashboard billing page may show empty on fresh account
- **File:** `src/app/dashboard/billing/page.tsx`
- **Root cause:** Queries `subscriptions` and `payments` — both empty for new users. The `.single()` call may fail if no rows exist, but the catch block silently swallows the error.

### R3: `tool_settings.usage_count` update silently fails
- **File:** `src/lib/services/tool-api-handler.ts` (lines 163-165)
- **Root cause:** Column doesn't exist → Supabase ignores or errors → wrapped in tryDb → silently fails

---

## 7. HTTP 500 Errors

| Route | Cause | File |
|-------|-------|------|
| `GET /api/admin/prompts` | Wrong table `prompts` | `prompts.service.ts` |
| `POST /api/admin/prompts` | Wrong table `prompts` | `prompts.service.ts` |
| `GET /api/admin/settings` | Wrong table `admin_settings` | `settings.service.ts` |
| `PUT /api/admin/settings` | Wrong table `admin_settings` | `settings.service.ts` |
| `GET /api/admin/api-keys` | Wrong schema on `api_keys` | `api-keys.service.ts` |
| `POST /api/admin/api-keys` | Wrong schema on `api_keys` | `api-keys.service.ts` |
| `GET /api/admin/models` | Wrong schema on `ai_models` | `models.service.ts` |
| `POST /api/admin/models` | Wrong schema on `ai_models` | `models.service.ts` |
| `GET /api/admin/credits` | Wrong table/columns | `credit-repo.ts` |
| `DELETE /api/admin/credits/:id` | Non-existent RPC | `credit-repo.ts` |
| `GET /api/admin/coupons` | Wrong column names | `coupon-repo.ts` |
| `GET /api/admin/plans` | Wrong column names | `plan-repo.ts` |
| `GET /api/admin/payments` | Wrong column names | `payment-repo.ts` |
| `GET /api/admin/security` | Wrong column names | `security-log-repo.ts` |
| `GET /api/admin/logs` | Wrong column names | `admin-log-repo.ts` |
| `POST /api/admin/users` | Invalid role value | `user-service.ts` |
| `GET /api/admin/overview` | `usage_count` on `tool_settings` | `admin-service.ts` |

---

## 8. Auth Problems

### A1: Debug endpoint exposes user data without auth
- **File:** `src/app/api/debug/admin-auth/route.ts`
- **Error:** No auth check. Exposes `user_id`, `email`, `profile_role`, `isAdmin`. Accessible via `GET /api/debug/admin-auth`.
- **Fix:** Add `requireAdmin()` middleware guard, or delete in production.

### A2: `/api/tools` routes bypass all auth
- **File:** `src/proxy.ts` (line 33)
- **Error:** `if (pathname.startsWith("/api/tools")) return NextResponse.next()` — no auth at all
- **Impact:** Tool APIs can be called by anyone, but `tool-api-handler.ts` does check user session internally for credit deduction. Guest access is intentional but should be documented.

### A3: No CSRF protection
- **Error:** Server actions don't use CSRF tokens. Forms use `window.prompt` for sensitive operations.
- **Risk:** Low for API routes (Supabase handles), medium for server actions.

### A4: `user-service.ts` create uses invalid role
- **File:** `src/lib/services/user-service.ts` (line 39)
- **Error:** `role: data.role || "user"` — "user" not in CHECK constraint `('free_user', 'admin', 'super_admin')`
- **Fix:** Change default to `"free_user"`

### A5: `signup` action doesn't create profile
- **File:** `src/lib/auth/actions.ts` (line 42-68)
- **Error:** Signup relies on the `handle_new_user` trigger to create profile. If trigger fails (e.g., profile already exists), user gets session but no profile → dashboard crashes.
- **Risk:** Medium — trigger is `security definer` so should work, but no fallback.

---

## 9. Supabase Problems

### S1: 3 services query non-existent tables
- `prompts.service.ts` → `prompts` (should be `prompt_templates`)
- `settings.service.ts` → `admin_settings` (should be `site_settings`)
- `api-keys.service.ts` → `api_keys` with wrong schema

### S2: 15+ repositories have wrong column names
- Every repository interface is misaligned with actual migration columns
- See Section 3 (High Bugs) for full list

### S3: Non-existent RPC `remove_credits`
- **File:** `credit-repo.ts` (line 57)
- **Fix:** Use `deduct_credits` instead

### S4: Non-existent column `usage_count` on `tool_settings`
- **Files:** `tool-api-handler.ts`, `admin-service.ts`, `tool-repo.ts`
- **Fix:** Add column via migration or remove usage tracking

### S5: Supabase auto-joins will fail
- **Files:** 5+ repositories use `.profiles!inner()` or `.profiles!left()` join syntax
- **Error:** No FK relationship between these tables and `profiles` via Supabase's relationship detection
- **Fix:** Use separate queries or define explicit relationships

### S6: Duplicate repositories/services for same tables
- `documents.repository.ts` vs `content.service.ts` (documents)
- `model-repo.ts` vs `models.service.ts` (ai_models)
- `providers.service.ts` vs `provider-repo.ts` (ai_providers)

---

## 10. Admin Problems

### AD1: Every admin CRUD page will fail at runtime
- **Affected pages:** Prompts, Settings, API Keys, Models, Credits, Coupons, Plans, Payments, Security, Logs, Blog categories
- **Root cause:** All use services/repos with wrong table/column names

### AD2: Admin overview dashboard will partially fail
- **File:** `src/lib/services/admin-service.ts`
- **Error:** `topTools` reads `usage_count` which doesn't exist; `profileRepo.getStats()` uses wrong columns

### AD3: Admin users page uses `window.prompt` for mutations
- **File:** `src/app/admin/users/page.tsx` (lines 131, 141, 151)
- **Error:** No input validation, no proper modal, no audit trail

### AD4: Admin API routes have no per-route auth
- **Error:** All 63 admin API routes rely solely on middleware proxy for auth
- **Risk:** If middleware is bypassed (e.g., direct fetch to internal port), no secondary auth check

### AD5: Admin pages fetch data but error handling is inconsistent
- Some pages use `try/catch` with `setError()`, others silently fail
- No global error boundary for admin section (error.tsx exists but is basic)

---

## 11. User Dashboard Problems

### D1: Dashboard billing page silently fails on empty data
- **File:** `src/app/dashboard/billing/page.tsx` (line 26)
- **Error:** `.single()` on empty result → catch block swallows error → loading never resolves properly

### D2: Dashboard credits page may show wrong data
- **File:** `src/app/dashboard/credits/page.tsx`
- **Root cause:** Queries `credit_logs` (correct) but profile credits may be stale

### D3: Dashboard settings page — save may fail silently
- **File:** `src/app/dashboard/settings/page.tsx`
- **Root cause:** Profile update via client-side Supabase — if RLS blocks, error is swallowed

### D4: Dashboard documents page uses browser client
- **File:** `src/app/dashboard/documents/page.tsx`
- **Root cause:** Direct Supabase client queries — works if RLS allows, but no error feedback

---

## 12. Workflow Problems

### W1: All workflows fall back to local engine with fake data
- **Keyword Intelligence:** `analyzeKeywordsLocal()` generates keywords with `volume: 0`, `difficulty: 0`, `cpc: 0`
- **Post Generator:** Falls back to `localEngine.generateArticle()` which produces template text
- **Plagiarism Checker:** `runPlagiarismLocal()` only checks internal duplication, not web sources
- **AI Detector:** `detectAiLocal()` uses heuristic patterns, not real ML model

### W2: `keyword-engine.ts` — `volume: null` cast as number
- **File:** `src/lib/engine/keyword-engine.ts` (line 203)
- **Error:** `volume: null as unknown as number` — type lie

### W3: Translator returns `null` for translated text
- **File:** `src/lib/services/tool-runner.service.ts` (line 443)
- **Error:** `translatedText: null` with note "Translation requires Gemini API"

### W4: Website audit, rank tracker, backlink checker return empty data
- **File:** `src/lib/services/tool-runner.service.ts` (lines 187-236)
- **Error:** All return empty arrays with messages like "requires DataForSEO API"

### W5: Post generator uses `any` type for runner
- **File:** `src/lib/workflows/post-generator.workflow.ts` (line 48)
- **Error:** `const { initializeSteps, startStep, updateProgress, completeStep, complete } = runner as any`

### W6: Two separate AI provider systems
- `src/lib/provider/` — dynamic, DB-based (reads from `ai_providers`, `ai_api_keys`, `ai_models`)
- `src/lib/ai/providers/` — static, env-var-based (reads from `process.env.GEMINI_API_KEY`)
- **Impact:** `tool-runner.service.ts` uses `src/lib/ai/providers/registry.ts` (static), while `post-generator.workflow.ts` uses `src/lib/provider/` (dynamic). Different code paths, different behavior.

---

## 13. Fake Data Found

### Engine-generated data (all local, no real API calls):
| File | What's fake |
|------|-------------|
| `src/lib/engine/keyword-engine.ts` | All keyword metrics (volume, difficulty, CPC, competition) are 0. Questions are randomly assembled from templates. Long-tail keywords are random prefix+suffix combos. |
| `src/lib/engine/seo-engine.ts` | SEO titles/meta descriptions are template-based with scores. Uses `Math.random()` for scoring variation. |
| `src/lib/engine/plagiarism-engine.ts` | Only checks internal text duplication. No web sources. "Source" field says "[Local] Sentence-level duplication detected". |
| `src/lib/engine/ai-detector-engine.ts` | Heuristic scoring based on sentence length, vocabulary, transition words. Not a real ML model. |
| `src/lib/engine/readability-engine.ts` | Flesch-Kincaid is calculated correctly but suggestions are template-based. |
| `src/lib/provider/local-engine.ts` | `generateArticle()` produces 2-paragraph template text. `generateOutline()` generates fixed section titles. |
| `src/lib/services/tool-runner.service.ts` | `website-audit` returns empty issues/checks. `rank-tracker` returns null positions. `backlink-checker` returns null counts. `translator` returns null translatedText. `ai-writer` fallback returns 4-paragraph template. |
| `src/lib/workflows/post-generator.workflow.ts` | Steps 1, 2, 5, 8-13 all complete instantly with template data. Only steps 3 (AI writer), 4 (humanizer), 6 (grammar), 7 (AI detector) do real work. |

---

## 14. UI/UX Problems

### U1: Admin users page uses `window.prompt` for role/status changes
- **File:** `src/app/admin/users/page.tsx` (lines 131, 141, 151)
- **Impact:** No validation, poor UX, no mobile support

### U2: `suppressHydrationWarning` on `<html>` and `<body>`
- **File:** `src/app/layout.tsx` (lines 29-30)
- **Impact:** Hides real hydration mismatches

### U3: No loading skeleton for admin pages
- **Error:** Some admin pages show raw spinners, others show nothing during load

### U4: Error states inconsistent across admin pages
- Some show error banners, some show inline errors, some swallow errors silently

### U5: Dashboard "Recent Documents" has no link to view/edit
- **File:** `src/app/dashboard/page.tsx` (lines 188-199)
- **Impact:** Documents are clickable but have no navigation target

---

## 15. Responsive Problems

### R1: Admin sidebar mobile overlay
- **File:** `src/app/admin/layout.tsx` (lines 59-64)
- **Impact:** Works correctly with translate-x pattern

### R2: Dashboard tables may overflow on small screens
- **Impact:** Admin data tables (users, payments, etc.) use wide layouts that may overflow on mobile

---

## 16. Performance Problems

### P1: Every page is a client component
- **Impact:** All admin and dashboard pages use `"use client"` — no server rendering benefits

### P2: Parallel Supabase queries in dashboard
- **File:** `src/app/dashboard/page.tsx` (lines 89-96)
- **Impact:** 6 parallel queries on page load — correct approach, good

### P3: AuthProvider creates Supabase client on every render
- **File:** `src/lib/supabase/client.ts`
- **Impact:** `createBrowserClient` is called once (module-level singleton), so this is fine

### P4: Middleware creates Supabase client for every request
- **File:** `src/proxy.ts`
- **Impact:** Necessary for auth, but adds ~50ms per request for cookie handling

### P5: `admin.ts` (supabase admin) throws on import if env vars missing
- **File:** `src/lib/supabase/admin.ts` (lines 6-7)
- **Impact:** If `SUPABASE_SERVICE_ROLE_KEY` is not set, server crashes on import. Should use lazy initialization.

### P6: Framer Motion on every page
- **Impact:** `motion` components add bundle size. Could be lazy-loaded.

---

## 17. Security Problems

### SEC1: Debug endpoint exposes user data
- **File:** `src/app/api/debug/admin-auth/route.ts`
- **Error:** No auth check. Exposes `user_id`, `email`, `profile_role`, `isAdmin`
- **Fix:** Delete or add admin auth guard

### SEC2: `/api/debug` bypasses middleware auth
- **File:** `src/proxy.ts` (line 34)
- **Error:** `if (pathname.startsWith("/api/debug")) return NextResponse.next()`

### SEC3: No rate limiting on any endpoint
- **Error:** No rate limiting on login, signup, tool APIs, or admin APIs
- **Risk:** Brute force attacks, abuse

### SEC4: Error messages leak internal details
- **Files:** Multiple API routes return `details: (err as Error).message`
- **Impact:** Exposes stack traces and internal error messages

### SEC5: `ENCRYPTION_KEY` fallback from service-role key
- **Files:** `providers.service.ts:4`, `api-keys.service.ts:4`
- **Risk:** Rotating service-role key breaks encryption

### SEC6: No CSRF tokens on forms
- **Impact:** Low risk (Supabase handles), but best practice is to add

### SEC7: `window.prompt` for admin operations
- **File:** `src/app/admin/users/page.tsx`
- **Risk:** No input sanitization, no server-side validation of prompt input

---

## 18. Test Problems

### T1: No Playwright tests exist
- **Error:** No `tests/` directory, no `playwright.config.*` file
- **Impact:** Zero automated test coverage

### T2: No unit tests exist
- **Error:** No `__tests__/` directories, no `.test.ts` or `.spec.ts` files
- **Impact:** No regression protection

---

## 19. Duplicate Files

| Duplicate A | Duplicate B | Overlap |
|-------------|-------------|---------|
| `src/lib/repositories/documents.repository.ts` | `src/lib/services/content.service.ts` (lines 33-71) | Full document CRUD |
| `src/lib/repositories/model-repo.ts` | `src/lib/services/admin/models.service.ts` | ai_models management |
| `src/lib/services/admin/providers.service.ts` | `src/lib/provider/provider-repo.ts` | ai_providers management |
| `src/lib/services/admin/api-keys.service.ts` | `src/lib/provider/provider-repo.ts` | API key management |
| `src/lib/ai/providers/` (static) | `src/lib/provider/` (dynamic) | Two separate AI provider systems |

---

## 20. Unused Files

| File | Reason |
|------|--------|
| `src/lib/db/migrations/001_initial_schema.sql` | Old migrations, superseded by `supabase/migrations/` |
| `src/lib/db/migrations/002_seed.sql` | Old seed, superseded by `supabase/migrations/003_seed.sql` |
| `src/lib/ai/providers/copyleaks.provider.ts` | Only used if copyleaks env var set |
| `src/lib/ai/providers/dataforseo.provider.ts` | Only used if dataforseo env var set |
| `src/lib/ai/providers/pagespeed.provider.ts` | Only used if pagespeed env var set |
| `src/lib/ai/readability.ts` | May be superseded by `readability-engine.ts` |
| `src/lib/ai/seo.ts` | May be superseded by `seo-engine.ts` |
| `src/lib/ai/parser.ts` | Unused if not imported anywhere |
| `src/lib/ai/output.ts` | Unused if not imported anywhere |
| `src/lib/ai/formatter.ts` | Unused if not imported anywhere |
| `src/lib/ai/engine.ts` | Unused if not imported anywhere |
| `src/lib/ai/prompts.ts` | Unused if not imported anywhere |
| `src/proxy.ts` lines 7-9 | Unused `supabaseAdmin` declaration |

---

## 21. Exact Fix Order

### Phase 1: Database Alignment (CRITICAL — must be first)
1. Fix `prompts.service.ts` → query `prompt_templates`
2. Fix `settings.service.ts` → query `site_settings` or create `admin_settings`
3. Fix `api-keys.service.ts` → query `ai_api_keys`
4. Fix `models.service.ts` → use correct `ai_models` columns
5. Fix `admin-log-repo.ts` → correct column names
6. Fix `audit.service.ts` → correct column names for admin_logs and system_logs
7. Fix `credit-repo.ts` → fix table confusion, fix RPC call
8. Fix `user-service.ts` → fix credits insert table, fix role default
9. Fix `providers.service.ts` → use `ai_api_keys` for API keys

### Phase 2: Repository Interface Alignment (HIGH)
10. Fix `blog-repo.ts` interface + filters
11. Fix `contact-repo.ts` interface + filters
12. Fix `profile-repo.ts` interface + search
13. Fix `plan-repo.ts` interface + ordering
14. Fix `coupon-repo.ts` interface + column names
15. Fix `payment-repo.ts` interface + filters
16. Fix `security-log-repo.ts` interface + joins
17. Fix `settings-repo.ts` query pattern
18. Fix `model-repo.ts` interface + ordering
19. Fix `project-repo.ts` interface
20. Fix `tool-repo.ts` interface

### Phase 3: Service Cleanup (MEDIUM)
21. Fix `tool-api-handler.ts` — remove `usage_count` update
22. Fix `admin-service.ts` — remove `usage_count` dependency
23. Fix `tool.service.ts` — use server client instead of browser client
24. Fix `content.service.ts` — add `getById` method
25. Remove duplicate code (encryption, document CRUD)

### Phase 4: Security (MEDIUM)
26. Delete or guard `/api/debug/admin-auth`
27. Add rate limiting to auth endpoints
28. Set dedicated `ENCRYPTION_KEY` env var
29. Sanitize error messages in API responses

### Phase 5: Quality (LOW)
30. Add Playwright tests for critical flows
31. Remove unused files
32. Add proper loading states to admin pages
33. Replace `window.prompt` with proper modals

---

## 22. Estimated Risk Per Fix

| Phase | Risk | Reason |
|-------|------|--------|
| Phase 1 (DB Alignment) | Medium | Changes affect data flow; must test each CRUD |
| Phase 2 (Repository Interfaces) | Low | Mostly type changes and column renames |
| Phase 3 (Service Cleanup) | Low | Removing dead code, fixing imports |
| Phase 4 (Security) | Low | Adding guards, env vars |
| Phase 5 (Quality) | Very Low | Adding tests, removing unused files |

---

## 23. Estimated Time Per Phase

| Phase | Estimated Time |
|-------|---------------|
| Phase 1: Database Alignment | 3-4 hours |
| Phase 2: Repository Interfaces | 2-3 hours |
| Phase 3: Service Cleanup | 1-2 hours |
| Phase 4: Security | 1 hour |
| Phase 5: Quality | 2-3 hours |
| **Total** | **9-13 hours** |

---

## 24. Files That Must Be Changed

```
src/lib/services/admin/prompts.service.ts          (C1: wrong table)
src/lib/services/admin/settings.service.ts          (C2: wrong table)
src/lib/services/admin/api-keys.service.ts          (C3: wrong schema)
src/lib/services/admin/models.service.ts            (C4: wrong schema)
src/lib/services/admin/providers.service.ts         (C10: wrong column)
src/lib/services/admin/audit.service.ts             (C6: wrong columns)
src/lib/repositories/admin-log-repo.ts              (C5: wrong columns)
src/lib/repositories/credit-repo.ts                 (C7, C9: wrong table/RPC)
src/lib/services/user-service.ts                    (C8: wrong table, H22: wrong role)
src/lib/repositories/blog-repo.ts                   (H1, H2: wrong columns)
src/lib/repositories/contact-repo.ts                (H3: wrong column)
src/lib/repositories/profile-repo.ts                (H4, H5: wrong columns)
src/lib/repositories/plan-repo.ts                   (H6, H7: wrong columns)
src/lib/repositories/coupon-repo.ts                 (H8, H9: wrong columns)
src/lib/repositories/payment-repo.ts                (H10: wrong column)
src/lib/repositories/security-log-repo.ts           (H11: wrong columns)
src/lib/repositories/settings-repo.ts               (H12: wrong query)
src/lib/repositories/model-repo.ts                  (H13, H14: wrong columns)
src/lib/repositories/project-repo.ts                (H15: wrong columns)
src/lib/repositories/tool-repo.ts                   (H16: wrong column)
src/lib/services/tool-api-handler.ts                (H17: wrong column)
src/lib/services/admin-service.ts                   (H21: wrong column)
src/lib/provider/provider-repo.ts                   (H20: wrong columns)
src/lib/services/tool.service.ts                    (M3: wrong client)
src/app/api/debug/admin-auth/route.ts               (SEC1: no auth)
src/proxy.ts                                        (L1: unused code)
```

---

## 25. Files That Must Not Be Touched

```
supabase/migrations/001_core_tables.sql             (production schema)
supabase/migrations/002_rls_policies.sql            (production RLS)
supabase/migrations/003_seed.sql                    (production seed)
supabase/migrations/004_functions.sql               (production RPCs)
supabase/migrations/005_enterprise_tables.sql       (production schema)
src/app/layout.tsx                                  (root layout)
src/lib/supabase/admin.ts                           (service-role client)
src/lib/supabase/client.ts                          (browser client)
src/lib/supabase/server.ts                          (server client)
src/lib/auth/AuthProvider.tsx                        (auth context)
src/lib/auth/actions.ts                             (login/signup/logout)
src/lib/auth/admin-actions.ts                       (admin login/logout)
src/lib/engine/plagiarism-engine.ts                 (local engine — works correctly)
src/lib/engine/ai-detector-engine.ts                (local engine — works correctly)
src/lib/engine/grammar-engine.ts                    (local engine — works correctly)
src/lib/engine/readability-engine.ts                (local engine — works correctly)
src/lib/engine/summarizer-engine.ts                 (local engine — works correctly)
src/lib/engine/seo-engine.ts                        (local engine — works correctly)
src/lib/engine/keyword-engine.ts                    (local engine — works correctly)
```

---

**End of Audit Report**
