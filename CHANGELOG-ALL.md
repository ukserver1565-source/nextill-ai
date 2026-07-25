# Nextill AI — All Changes Tracker
## Last Updated: Jul 25, 2026

---

## 📊 PageSpeed Scores (Mobile / Desktop)

| Date | Performance | Accessibility | Best Practices | SEO |
|------|------------|---------------|----------------|-----|
| Jul 25 (before) | 88 | 87 | 100 | 100 |
| Jul 25 (after round 1) | 91 | 95 | 100 | 100 |
| Jul 25 (after round 2) | 91+ | 95 | 100 | 100 |
| Jul 25 (desktop) | 94 | 95 | 100 | 100 |

---

## 🔧 All Fixes Applied

### Round 1: Accessibility + Performance (Jul 25)

**Performance Fixes:**
1. Logo image: `img` → Next.js `Image` with width/height/sizes (1.5MB → ~5KB WebP/AVIF)
2. Cache headers: fonts (1yr immutable), images (1day + stale-while-revalidate)
3. Non-composited animations: border → box-shadow on demo tabs
4. Product schema: added image, brand, mpn, hasMerchantReturnPolicy, shippingDetails

**Accessibility Fixes:**
1. `<main>` landmark in root layout (src/app/layout.tsx)
2. ~50 `aria-label`s on icon-only buttons across 18 files
3. Heading hierarchy: fixed h1→h3 skips on 12+ pages
4. Footer h4→h2 (heading skip fix)
5. Color contrast: `#5A6577`→`#8895A7` (post-generator, plagiarism-checker)
6. Color contrast: `--color-muted-dark: #6B7280`→`#9CA3AF`
7. Light mode: `--color-muted: #64748B`→`#56657A`
8. Image alt text fixes (blog, checkout QR)
9. Logo alt: `alt="Nextill AI"` → `alt=""` (decorative)

### Round 2: Light Mode Fix (Jul 25)

**CSS Safety Net (globals.css):**
- `text-white` → `color: #0F172A` in light mode
- `text-white/70` → `rgba(15,23,42,0.7)` in light mode
- `text-white/80` → `rgba(15,23,42,0.8)` in light mode
- `hover:text-white` → `color: #0F172A` in light mode
- `bg-white/[0.04]` → `rgba(0,0,0,0.04)` in light mode
- `bg-white/[0.02]` → `rgba(0,0,0,0.02)` in light mode
- `bg-white/[0.06]` → `rgba(0,0,0,0.06)` in light mode
- `bg-white/[0.01]` → `rgba(0,0,0,0.01)` in light mode
- `border-white/[0.06]` → `rgba(0,0,0,0.08)` in light mode
- `border-white/[0.08]` → `rgba(0,0,0,0.1)` in light mode
- `border-white/[0.10]` → `rgba(0,0,0,0.12)` in light mode
- `border-white/[0.12]` → `rgba(0,0,0,0.15)` in light mode

**Component Fixes (text-white → text-foreground):**

Public Pages:
- home-client.tsx: nav links, demo tabs, pricing table, testimonials, FAQ
- features/page.tsx: CTA button
- how-it-works/page.tsx: step titles, CTA
- about/page.tsx: CTA button
- terms/page.tsx: CTA button
- privacy-policy/page.tsx: CTA button
- not-found.tsx: heading, buttons
- login/page.tsx: heading, password toggle
- signup/page.tsx: heading, password toggles
- reset-password/page.tsx: heading, text, toggle
- pricing/page.tsx: table cells, borders
- checkout/page.tsx: headings, labels, wallet addresses, prices

Shared Components:
- public-header.tsx: nav links, profile name
- public-footer.tsx: footer links
- pricing-card.tsx: limit values
- pricing-client-section.tsx: toggle, coupon, table
- back-button.tsx: hover text
- site-logo.tsx: Image component
- dialog.tsx: close button aria
- sidebar.tsx: collapse toggle, sign-out aria
- topbar.tsx: notifications, profile aria
- theme-toggle.tsx: aria-label

Dashboard:
- dashboard/page.tsx: greeting
- billing/page.tsx: headings, values
- metric-cards.tsx: values
- ai-tool-cards.tsx: tool names
- quick-actions.tsx: action labels
- command-center.tsx: action labels

Blog:
- blog-list-client.tsx: titles, load more
- [slug]/page.tsx: related post titles
- [slug]/blog-post-content.tsx: prose headings

Tools:
- tool-layout.tsx: back link

Domain Intelligence:
- summary-cards.tsx: card values

---

## 📋 Merchant Listings Schema

Added to src/app/pricing/page.tsx:
- `image`: /og-pricing.png (needs to be created in public/)
- `brand`: { name: "Nextill AI" }
- `mpn`: per-plan unique ID
- `hasMerchantReturnPolicy`: 7-day free return
- `shippingDetails`: digital delivery (0 days)

**TODO:** Create public/og-pricing.png for Google validation

---

## 🎯 Remaining Issues (Low Priority)

**Performance:**
- Server response time 770ms (hosting optimization)
- Render-blocking CSS (~550ms) — defer non-critical styles
- Unused JavaScript (~96 KiB) — lazy-load heavy chunks
- Legacy JavaScript (~14 KiB) — polyfills

**Accessibility:**
- Some contrast borderline on text-xs sizes
- Some admin pages may need text-white fixes (not user-facing)

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| src/app/globals.css | Theme tokens, CSS overrides, glass effects |
| src/app/layout.tsx | Root layout with <main> landmark |
| src/components/shared/site-logo.tsx | Logo with Next.js Image |
| src/components/layout/public-header.tsx | Public navigation |
| src/components/layout/public-footer.tsx | Footer |
| src/components/layout/sidebar.tsx | Dashboard sidebar |
| src/components/home/home-client.tsx | Homepage |
| src/app/pricing/page.tsx | Pricing with Product schema |
| next.config.ts | Cache headers, image optimization |
