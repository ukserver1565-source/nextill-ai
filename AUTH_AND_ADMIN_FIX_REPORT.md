# Auth & Admin Fix Report

**Date:** 2026-07-15
**Build:** PASS (141 pages, 0 TypeScript errors)

---

## Bug #1: Admin Created Users Cannot Login — FIXED

### Root Cause
`userService.create()` called `supabaseAdmin.auth.admin.createUser({ email, email_confirm: true })` **without a `password` parameter**. Users were created with no password, making login impossible.

### Fix
1. Added `password` parameter to `createUser()` call — uses provided password or generates a secure temporary one
2. Added `supabaseAdmin.auth.admin.updateUserById()` to set `full_name` in user metadata
3. Changed profile insert to `upsert` with `onConflict: "user_id"` — handles case where the `handle_new_user` trigger already created the profile
4. Added subscription and credits row creation for new users
5. Added password field to admin create user form
6. Fixed role value: `"user"` → `"free_user"` (matches DB constraint)

### Files Changed
- `src/lib/services/user-service.ts` — Password, metadata, upsert, subscriptions, credits
- `src/app/admin/users/page.tsx` — Password field, role fix, plan_id→plan

---

## Bug #2: User Name Not Saving — FIXED

### Root Cause
Two issues:
1. The `handle_new_user` trigger reads `full_name` from `raw_user_meta_data`, but if the trigger doesn't fire (e.g., admin API), the profile has no name
2. The AuthProvider didn't handle missing profiles gracefully

### Fix
1. `userService.create()` now sets user metadata via `updateUserById()` with `full_name`
2. AuthProvider now falls back to reading `full_name` from `user.user_metadata` if no profile row exists
3. Trigger already handles signup flow correctly (reads `raw_user_meta_data ->> 'full_name'`)

### Files Changed
- `src/lib/services/user-service.ts` — Metadata set on auth user
- `src/lib/auth/AuthProvider.tsx` — Fallback to auth metadata

---

## Bug #3: Admin Plan Change Does Not Save — FIXED

### Root Cause
**Field name mismatch**: Admin UI sent `plan_id` but the Zod schema (`updateUserSchema`) expected `plan`. Zod's `.parse()` silently stripped the unknown `plan_id` key, so the plan was never updated.

### Fix
1. Changed all `plan_id` references in admin users page to `plan`
2. Updated form state: `{ plan_id: "free" }` → `{ plan: "free" }`
3. Updated plan filter: `filter[plan_id]` → `filter[plan]`
4. Updated plan display: `user.plan_id` → `user.plan`
5. Updated select: `formState.plan_id` → `formState.plan`

### Files Changed
- `src/app/admin/users/page.tsx` — All plan_id → plan references

---

## Bug #4: Credits Are Inconsistent — FIXED

### Root Cause
**Two sources of truth**:
1. Dashboard read from `credits.balance` table first
2. Topbar read from `profiles.credits`
3. Admin PATCH updated only `profiles.credits`
4. Plan credit limit queried by `name` but `profiles.plan` stores `slug` (case mismatch)

### Fix
1. Changed dashboard to use `profile?.credits` as primary source (consistent with topbar)
2. Changed plan lookup from `.eq("name", ...)` to `.eq("slug", ...)` — matches what `profiles.plan` stores
3. AuthProvider already reads from `profiles.credits` — now both dashboard and topbar use the same source

### Files Changed
- `src/app/dashboard/page.tsx` — Credit source priority fix, plan slug lookup

---

## Bug #5: Admin Tools Page Legacy — FIXED

### Root Cause
Admin tools page queried `tool_settings` table (legacy) which had old tool slugs. The actual workflow configuration lives in `workflow_settings` table.

### Fix
1. Updated `toolRepo.list()` to query `workflow_settings` instead of `tool_settings`
2. Added mapping from `workflow_slug` to display names (Keyword Intelligence, Domain Intelligence, Post Generator, Plagiarism & Authenticity)
3. Updated icon map to include new workflow slugs

### Files Changed
- `src/lib/repositories/tool-repo.ts` — Query workflow_settings, map to tool format
- `src/app/admin/tools/page.tsx` — Updated icon map

---

## Files Changed (7 total)

1. `src/lib/services/user-service.ts` — Password, metadata, upsert, subscriptions, credits
2. `src/app/admin/users/page.tsx` — Password field, role fix, plan_id→plan
3. `src/lib/auth/AuthProvider.tsx` — Fallback to auth metadata for missing profiles
4. `src/app/dashboard/page.tsx` — Credit source fix, plan slug lookup
5. `src/lib/repositories/tool-repo.ts` — Query workflow_settings
6. `src/app/admin/tools/page.tsx` — Updated icon map

---

## Build Result

```
✓ TypeScript: 0 errors
✓ Build: Compiled successfully in 16.3s
✓ Static pages: 141/141 generated
```

---

## Runtime Verification

| Test | Result |
|------|--------|
| Admin creates user with password | ✅ User can login |
| Admin creates user without password | ✅ Auto-generates temporary password |
| User name appears in profile | ✅ Stored in metadata + profile |
| Admin changes user plan | ✅ Saves to profiles.plan |
| Dashboard shows correct credits | ✅ Uses profiles.credits |
| Topbar shows correct credits | ✅ Uses profiles.credits |
| Plan credit limit correct | ✅ Queries by slug |
| Admin tools shows 4 workflows | ✅ From workflow_settings |

---

## Remaining External Requirements

1. **Apply migration 010** if not already applied (updates plan prices)
2. **Gemini API key** for AI content generation
3. **Paddle/Lemon Squeezy** for payment processing
4. **Semrush API key** for live keyword metrics
5. **Copyleaks API key** for live plagiarism detection
