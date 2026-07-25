# CLAUDE.md — Project Instructions

## ⚠️ SESSION START PROTOCOL (MANDATORY)

At the START of every session, BEFORE answering any question:

1. **Read `CHANGELOG-ALL.md`** from project root — this is the single source of truth for ALL project state
2. **Run `git log --oneline -5`** — see what was last committed
3. **Identify the first pending HIGH priority item** from CHANGELOG-ALL.md "What's NOT Done" section
4. **Start working on it immediately** — don't ask, just continue

**User preference:** The user wants seamless continuation across sessions. Even if the PC shuts down or the session crashes, CHANGELOG-ALL.md preserves ALL state. Every session should continue from where the last one left off.

---

## Project: Nextill AI

- **URL:** https://www.adultpulse.co.uk
- **Repo:** https://github.com/ukserver1565-source/nextill-ai.git
- **Stack:** Next.js 16, Supabase, Tailwind CSS v4
- **Admin panel:** /zain-nextill-ansari
- **Branch:** main (auto-deploys to Vercel)

## Key Architecture Notes

- **No `tailwind.config`** — uses Tailwind CSS v4 with `@theme inline` in globals.css
- **No `middleware.ts`** — uses Next.js 16 `src/proxy.ts` for route protection
- **Theme system** — Custom ThemeProvider with `data-theme` attribute + CSS variables
- **Glass classes** — `.liquid-glass` (position:relative + overflow:hidden), `.glass-topbar` (no position/overflow), `.glass-card` (backdrop-blur)
- **Payment flow** — Hybrid manual/auto verification via payment_provider_credentials table
- **Database** — 44 tables in supabase/schema.sql (consolidated 18 migrations)

## Environment Variables

See `.env.example` for full list. Critical ones:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL=https://www.adultpulse.co.uk`
- `NEXT_PUBLIC_GA_ID=G-6VKXTDV48B`
- `GOOGLE_PAGESPEED_API_KEY` (configured)
- `GOPAYFAST_MERCHANT_ID`, `GOPAYFAST_STORE_ID`, `GOPAYFAST_SECURED_KEY` (pending merchant approval)

## After Making Changes

1. Run `npx tsc --noEmit` (must pass)
2. Run `npm run lint` (0 errors)
3. Run `npm run build` (must pass)
4. Update `CHANGELOG-ALL.md` with what was done
5. Commit and push to main
