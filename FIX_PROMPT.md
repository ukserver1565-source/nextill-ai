# Nextill AI — Full Fix Prompt

Fix Nextill AI completely based on current live issues.

---

## Current Problems

1. Admin login shows: "An unexpected response was received from the server."
2. Landing page is too basic and slow.
3. Explore Tools button must open tools section/page.
4. All tool cards must be clickable and usable without login.
5. Guest users must use tools without login.
6. Guest users cannot save history/documents.
7. Guest usage limits must come from admin tool_settings.
8. Admin must be able to edit guest limits / free limits / premium limits.
9. User dashboard header/topbar buttons are not working: search, notifications, profile menu, settings, logout.
10. Landing page footer is missing/weak.
11. No fake data. Use Supabase where real data is needed.
12. Website must be faster.

Fix everything.

---

## ADMIN LOGIN FIX

Debug and fix `/admin/login`.

**Requirements:**
- `/admin/login` must always render login form (not blocked by admin layout).
- Login with: `admin@adultpulse.co.uk` / `Admin@123456`
- Must redirect to `/admin`.
- If server action returns unexpected response, fix the action response format.
- Admin login form must properly handle: success, wrong password, non-admin user, network error, missing profile.

**Files to check:**
- `src/app/admin/login/page.tsx`
- `src/lib/auth/admin-actions.ts`
- `src/lib/supabase/server.ts`
- `src/proxy.ts`
- `src/app/admin/layout.tsx`

**Rules:**
- Server action must either redirect correctly or return a clean object expected by the client.
- No blank page.
- No "unexpected response" error.
- Admin layout must pass through children for `/admin/login` without auth check.
- AuthProvider must await profile fetch before setting `loading=false`.

---

## PUBLIC WEBSITE FIX

Make `/` a proper fast landing page.

**Sections (in order):**
- Sticky header
- Hero
- Tools section
- Features section
- How it works
- Pricing preview
- FAQ
- Strong footer

**Header:**
- Logo
- Pricing
- Contact
- Explore Tools
- Sign In
- Get Started

**Explore Tools:**
- Scroll to tools section OR navigate to `/tools`
- Every tool card links to its real tool page

**Footer:**
- Products | Tools | Company | Legal | Contact | Copyright

---

## TOOLS WITHOUT LOGIN

Every tool page must work for guests.

**Guest flow:**
- Open tool page
- Type input
- Click generate/check
- Result appears
- Copy works
- Clear works
- Save button says "Login to save"
- No document/history saved

**Logged-in user flow:**
- Result can be saved
- Document saved
- `usage_logs` saved
- Credits deducted

**Tool limits:**
- Read from `tool_settings`: `guest_daily_limit`, `free_daily_limit`, `premium_daily_limit`, `credits_cost`, `is_enabled`
- Admin can edit these values live from `/admin/tools`
- Changes reflect after refresh

**API key missing:**
- Show: "Running on local engine. Add API key in Admin Panel for premium output."
- Do NOT block tool usage because API key is missing.

---

## TOOLS INDEX PAGE

Create `/tools` page showing all tools.

**Each card:**
- Icon
- Title
- Description
- Category
- Credits cost
- Guest limit
- Open button

**Data source:** registry / `tool_settings` where possible.

**Tools list:**
AI Writer, Humanizer, AI Detector, Plagiarism Checker, SEO Title Generator, Meta Description Generator, Keyword Research, Website Audit, Rank Tracker, Backlink Checker, Schema Generator, Sitemap Generator, Robots.txt Generator, Internal Link Generator, Content Brief, Topical Map, FAQ Generator, Article Rewriter, Grammar Checker, Summarizer, Translator.

---

## DASHBOARD HEADER FIX

Fix dashboard topbar/header. Make these work:
- Search → opens command/search modal
- Notifications → dropdown opens
- Profile menu → dropdown opens
- Settings → link works
- Logout → works
- Credits → display real credits
- Plan → display real plan

No dead buttons.

---

## ADMIN TOOL SETTINGS FULL CRUD

`/admin/tools` must fully work.

**Admin can:**
- Enable/disable tool
- Edit `guest_daily_limit`
- Edit `free_daily_limit`
- Edit `premium_daily_limit`
- Edit `credits_cost`
- Edit `default_model`
- Edit `prompt_template`
- Save changes to Supabase
- Refresh page and see same data

No fake alerts. Use real forms/modals/API calls.

---

## PERFORMANCE FIX

Make website faster:
- Remove unnecessary client components.
- Use server components where possible.
- Lazy load heavy charts.
- Optimize images/icons.
- Avoid repeated Supabase calls.
- Avoid blocking middleware queries for public routes.
- Public landing page should not call Supabase unnecessarily.
- No `Math.random()` in server-rendered UI.
- No hydration mismatch.
- Middleware (`proxy.ts`) should skip DB queries for public routes.
- Make tool pages render fast: separate guest vs logged-in rendering.

---

## QUALITY CHECK

Run:
```
npx tsc --noEmit
npm run build
```

Then run local dev and verify:
- `/` loads fast
- `/tools` works
- `/ai-writer` works without login
- `/admin/login` works
- `/admin` opens after admin login
- `/dashboard` opens after user login
- All buttons mentioned above work

---

## Return format

When done, return:
1. Root cause of admin login error
2. Files changed (full paths)
3. Pages fixed
4. Buttons fixed (search, notifications, profile, settings, logout)
5. Tools guest mode status
6. Admin tool settings status
7. Performance improvements made
8. Build result (pass/fail, any remaining errors)
