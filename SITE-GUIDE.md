# 🚀 Nextill AI — All-in-One Site Guide
## Complete Documentation for adminpulse.co.uk

---

## 🌐 SITE OVERVIEW

**URL:** https://www.adultpulse.co.uk
**Name:** Nextill AI — AI SEO Tools & Content Platform
**Stack:** Next.js 16 + Supabase + Tailwind CSS v4
**Deploy:** GitHub → Vercel (auto-deploy from main branch)

---

## 👤 USER LOGIN / SIGNUP

### How Users Sign Up
1. Go to **https://www.adultpulse.co.uk/signup**
2. Fill: Full Name, Email, Password
3. Click **"Create Account"**
4. Account created with **FREE plan** (100 credits)
5. Auto-redirected to Dashboard

### How Users Login
1. Go to **https://www.adultpulse.co.uk/login**
2. Enter Email + Password
3. Click **"Sign In"**
4. Goes to Dashboard

### Password Reset
1. Go to **https://www.adultpulse.co.uk/reset-password**
2. Enter email → receives reset link via Resend
3. Click link → set new password

### Access Points
| Button/Link | Location | Goes To |
|---|---|---|
| **Get Started** | Top header (right) | `/signup` |
| **Sign In** | Top header (right) | `/login` |
| **Dashboard** | Top header (after login) | `/dashboard` |
| **Light/Dark Mode** | Top header (sun/moon icon) | Toggles theme |

---

## 👑 ADMIN LOGIN

### Admin Login URL
**https://www.adultpulse.co.uk/zain-nextill-ansari/login**

> ⚠️ Admin login is SEPARATE from user login. Different page, same Supabase auth.

### How to Create Admin Account
1. First create a normal user account at `/signup`
2. Go to Supabase Dashboard → Table Editor → `profiles`
3. Find your user row
4. Change `role` from `free_user` to `admin`
5. Now login at `/zain-nextill-ansari/login` works

### Admin Panel URLs
| URL | What It Shows |
|---|---|
| `/zain-nextill-ansari` | Admin Dashboard |
| `/zain-nextill-ansari/users` | User Management |
| `/zain-nextill-ansari/blog` | Blog CMS |
| `/zain-nextill-ansari/payments` | Payment Management |
| `/zain-nextill-ansari/plans` | Plan Management |
| `/zain-nextill-ansari/coupons` | Coupon Management |
| `/zain-nextill-ansari/tools` | Tool Settings |
| `/zain-nextill-ansari/settings` | Site Settings |
| `/zain-nextill-ansari/email` | Email Settings |
| `/zain-nextill-ansari/logs` | System Logs |
| `/zain-nextill-ansari/analytics` | Analytics |
| `/zain-nextill-ansari/backups` | Backup System |

### What Admin Can Do
- View/edit all users (change plans, add credits, block/delete)
- Manage blog posts (create, edit, publish, delete)
- Approve/reject pending payments
- Manage AI tools (enable/disable, set costs, limits)
- Configure site settings
- Configure email (Resend API key)
- View system logs and analytics
- Create backups
- Manage API keys, providers, models

---

## 🛠️ TOOLS (20+ AI Tools)

### Premium Workflows (Main Tools)
| Tool | URL | Credits | What It Does |
|---|---|---|---|
| **Keyword Intelligence** | `/keyword-intelligence` | 2 | Keyword research with volume, difficulty, SERP |
| **Post Generator** | `/post-generator` | 10 | Full SEO blog post (15-step pipeline) |
| **Plagiarism Checker** | `/plagiarism-checker` | 4 | Check content originality (PlagiarismCheck.org API) |
| **Domain Intelligence** | `/domain-overview` | 5 | Website analysis + PageSpeed scores |

### AI Writing Tools
| Tool | URL | Credits | What It Does |
|---|---|---|---|
| **AI Writer** | `/ai-writer` | 5 | Generate articles from topic (RewriteAI API) |
| **AI Humanizer** | `/ai-humanizer` | 3 | Humanize AI text (RewriteAI API) |
| **AI Detector** | `/ai-detector` | 2 | Detect AI-generated content |
| **Article Rewriter** | `/article-rewriter` | 3 | Rewrite content |
| **Grammar Checker** | `/grammar-checker` | 1 | Check grammar |
| **Summarizer** | `/summarizer` | 2 | Summarize long text |
| **Translator** | `/translator` | 2 | Translate text |

### SEO Tools
| Tool | URL | Credits | What It Does |
|---|---|---|---|
| **SEO Title Generator** | `/seo-title-generator` | 1 | Generate SEO titles |
| **Meta Description Generator** | `/meta-description-generator` | 1 | Generate meta descriptions |
| **FAQ Generator** | `/faq-generator` | 2 | Generate FAQs |
| **Schema Generator** | `/schema-generator` | 1 | Generate JSON-LD schema |
| **Content Brief** | `/content-brief` | 3 | Create content briefs |
| **Topical Map** | `/topical-map` | 2 | Build topic clusters |
| **Internal Link Generator** | `/internal-link-generator` | 1 | Find linking opportunities |
| **Sitemap Generator** | `/sitemap-generator` | 1 | Generate XML sitemaps |
| **Robots.txt Generator** | `/robots-txt-generator` | 1 | Generate robots.txt |

### Audit Tools
| Tool | URL | Credits | What It Does |
|---|---|---|---|
| **Website Audit** | `/website-audit` | 5 | Full site audit (PageSpeed API) |
| **Rank Tracker** | `/rank-tracker` | 5 | Track keyword rankings |
| **Backlink Checker** | `/backlink-checker` | 5 | Analyze backlinks |

### How Tools Work
1. User enters input (text, topic, URL, etc.)
2. Credits checked (if logged in)
3. Tool processes via API or local engine
4. Result shown with copy/save options
5. Credits deducted (logged in) or guest count tracked

### Tool APIs
| Tool | API Route | Method |
|---|---|---|
| AI Writer | `/api/tools/ai-writer` | POST |
| AI Humanizer | `/api/tools/ai-humanizer` | POST |
| Plagiarism | `/api/tools/plagiarism-checker` | POST |
| All others | `/api/tools/{slug}` | POST |

---

## 📊 DASHBOARD (User)

### URLs
| URL | What It Shows |
|---|---|
| `/dashboard` | Overview (stats, quick actions) |
| `/dashboard/projects` | Create/manage projects |
| `/dashboard/documents` | Saved documents |
| `/dashboard/credits` | Credit balance + history |
| `/dashboard/billing` | Current plan + payment methods |
| `/dashboard/history` | Usage history |
| `/dashboard/reports` | Reports |
| `/dashboard/settings` | Account settings |

---

## 💳 PAYMENT SYSTEM

### How Checkout Works
1. User clicks **"Get Started"** or **"Upgrade"** on pricing page
2. Goes to `/checkout?plan=pro&billing=monthly`
3. Selects payment method (card, JazzCash, EasyPaisa, bank, crypto)
4. Enters payment details
5. Submits → creates payment record with `pending` status
6. **If GoPayFast credentials active:** auto-verified via API
7. **If manual:** admin approves in panel → credits added

### Payment Methods
| Method | Type | Auto/Manual |
|---|---|---|
| GoPayFast (Cards, JazzCash, EasyPaisa) | Hosted checkout | Auto (when configured) |
| Stripe | API | Auto (needs key) |
| PayPal | API | Auto (needs key) |
| JazzCash/EasyPaisa (direct) | Stub | Manual |
| Bank Transfer | Manual | Always Manual |
| Crypto | Manual | Always Manual |

### Admin Payment Flow
1. Go to `/zain-nextill-ansari/payments`
2. See pending payments
3. Click **Approve** or **Reject**
4. If approved → user gets credits + plan upgraded

---

## 📧 EMAIL SYSTEM

### Email Provider: Resend
- Domain: adultpulse.co.uk (verified)
- From: noreply@adultpulse.co.uk
- API Key: Set in `.env.local` OR admin settings

### Email Templates (6 Total)
| Template | When Sent | Subject |
|---|---|---|
| Welcome | User signup | "Welcome to Nextill AI..." |
| Payment Confirmed | Payment approved | "Payment Confirmed..." |
| Credits Low | Credits < 10 | "Credits Running Low..." |
| Password Reset | User requests | "Reset Your Password" |
| Subscription Renewed | Monthly cron | "Credits Renewed!" |
| Payment Pending | New payment | "Payment Under Review..." |

### Admin Email Setup
1. Go to `/zain-nextill-ansari/email`
2. Select **Resend** provider
3. Enter API key: `re_FDrwiBo4_...`
4. From email: `noreply@adultpulse.co.uk`
5. Click **Save Settings** (run FIX_ALL SQL first!)
6. Click **Test Email** to verify

---

## 🔍 SEO FEATURES

| Feature | Status | URL |
|---|---|---|
| robots.txt | ✅ Active | `/robots.txt` |
| Sitemap | ✅ Active | `/sitemap.xml` |
| RSS Feed | ✅ Active | `/feed.xml` |
| OG Image | ✅ Dynamic | `/api/og` |
| JSON-LD Schema | ✅ Active | Homepage, Pricing |
| Product Schema | ✅ Active | `/pricing` |
| AI Crawler Blocking | ✅ Active | GPTBot, ClaudeBot, CCoT blocked |

---

## 📊 ANALYTICS & TRACKING

| Tool | Status | ID |
|---|---|---|
| Google Analytics | ✅ Active | G-6VKXTDV48B |
| Google Search Console | ✅ Verified | Meta tag in head |
| Vercel Analytics | ✅ Active | Auto |
| Vercel Speed Insights | ✅ Active | Auto |

---

## 🗄️ DATABASE (44 Tables)

### Core Tables
- `profiles` — User profiles (role, plan, credits)
- `credits` — Credit balances
- `credit_logs` — Credit transaction history
- `projects` — User projects
- `documents` — Saved documents
- `subscriptions` — Active subscriptions
- `payments` — Payment records

### Tool Tables
- `tool_settings` — Tool configs (enabled, costs, limits)
- `usage_logs` — Tool usage tracking
- `guest_usage` — Guest usage tracking
- `generated_posts` — Post generator output
- `keyword_research` — Keyword research results
- `plagiarism_reports` — Plagiarism check results

### Content Tables
- `blog_posts` — Blog articles
- `blog_categories` — Blog categories
- `contact_messages` — Contact form submissions
- `plans` — Pricing plans
- `coupons` — Discount coupons

### System Tables
- `site_settings` — Site configuration
- `security_logs` — Security events
- `admin_logs` — Admin actions
- `system_logs` — System events
- `admin_audit_logs` — Audit trail
- `payment_provider_credentials` — Payment provider config

---

## 🔧 ENVIRONMENT VARIABLES

### Required
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=...
NEXT_PUBLIC_SITE_URL=https://www.adultpulse.co.uk
```

### AI & Tools
```
DEFAULT_AI_MODEL=gemini-2.0-flash
GOOGLE_PAGESPEED_API_KEY=AIza...
REWRITEAI_API_KEY=rw_sk_...
PLAGIARISMCHECK_API_KEY=g8wx9z...
```

### Email
```
RESEND_API_KEY=re_...
ADMIN_EMAIL=muzamal57gansari@icloud.com
```

### Payments (pending)
```
GOPAYFAST_MERCHANT_ID=
GOPAYFAST_STORE_ID=
GOPAYFAST_SECURED_KEY=
```

### Analytics
```
NEXT_PUBLIC_GA_ID=G-6VKXTDV48B
CRON_SECRET=nxt-cron-x7k9m2p4v8r3j5w1
```

---

## ⚡ CRON JOBS

| Job | Schedule | Endpoint | What It Does |
|---|---|---|---|
| Credit Renewal | 1st of month | `/api/cron/credits/renew` | Resets user credits |

---

## 🚀 DEPLOYMENT

### How to Deploy
1. Push to `main` branch on GitHub
2. Vercel auto-deploys (usually 1-2 minutes)
3. Check: https://vercel.com/dashboard → your project

### Build Commands
```bash
npm run build    # Build
npx tsc --noEmit # Type check
npm run lint     # Lint
```

---

## 🐛 TROUBLESHOOTING

| Problem | Fix |
|---|---|
| Email save fails | Run `FIX_ALL_RUN_THIS.sql` in Supabase |
| "policy already exists" | Run `FIX_ALL_RUN_THIS.sql` |
| "column severity does not exist" | Run `FIX_ALL_RUN_THIS.sql` |
| "trigger already exists" | Run `FIX_ALL_RUN_THIS.sql` |
| Light mode text invisible | Already fixed in globals.css |
| Credits not showing | Check `credits` table has user row |
| Payment stuck pending | Admin approve at `/zain-nextill-ansari/payments` |
| Tools return error | Check API keys in `.env.local` |
