"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  BookOpen, Users, Shield, CreditCard, Wrench, Mail, Cpu,
  FileText, Search, BarChart3, Settings, LayoutDashboard,
  ChevronDown, ChevronRight, ExternalLink, CheckCircle2,
  AlertTriangle, Info, ArrowRight, Globe, Lock, Key,
  UserPlus, LogIn, Sparkles, Activity, FileEdit, PenSquare,
  TrendingUp, Share2, Clock, Rocket, Zap, Database,
  HelpCircle, BookMarked
} from "lucide-react"

const sections = [
  {
    id: "overview",
    icon: Globe,
    title: "Site Overview",
    content: `Nextill AI is an all-in-one AI-powered SEO platform running at www.adultpulse.co.uk.
Built with Next.js 16 + Supabase + Tailwind CSS v4. Features include keyword research,
AI content generation, plagiarism checking, domain intelligence, and full admin panel.`,
  },
  {
    id: "user-auth",
    icon: LogIn,
    title: "User Login & Signup",
    content: `WHERE USERS CAN LOGIN FROM:
• Main site header — "Login" button (top right)
• Direct URL: www.adultpulse.co.uk/login
• Any tool page — click "Use Tool" → redirected to login if not authenticated
• Dashboard access — any /dashboard/* URL redirects to login

SIGNUP FLOW:
1. Click "Sign Up" on header or /login page
2. Fill: Full Name, Email, Password
3. Email verification link sent to inbox
4. Click link → account activated
5. Auto-redirected to /dashboard
6. Welcome email sent automatically (if Resend configured)
7. User gets 100 free credits on signup
8. Default plan: "free", role: "free_user"

LOGIN METHODS:
• Email + Password (Supabase Auth)
• Magic Link (if configured)
• Google OAuth (if configured)

PASSWORD RESET:
• Click "Forgot Password" on login page
• Reset email sent → click link → set new password`,
  },
  {
    id: "admin-auth",
    icon: Shield,
    title: "Admin Panel Login",
    content: `ADMIN PANEL URL: www.adultpulse.co.uk/zain-nextill-ansari
ADMIN LOGIN URL: www.adultpulse.co.uk/zain-nextill-ansari/login

HOW TO ACCESS:
• Go to /zain-nextill-ansari URL
• If not logged in → redirected to /zain-nextill-ansari/login
• Enter admin email + password
• System checks: profile.role IN ('admin', 'super_admin')
• Wrong role → redirected to /unauthorized
• 3 failed attempts → 3-day lockout (security feature)
• Successful login → redirect to admin dashboard

ADMIN ACCOUNTS:
• Created via: Supabase Dashboard → Authentication → Users → Create
• Or via: /api/admin/users (POST) — authenticated admin creates new admin
• Admin can create OTHER admins: Go to Admin Panel → Users → "Add User" button
• New admin needs: email, password, role='admin'
• Super Admin can be created only via Supabase Dashboard (highest level)

IMPORTANT: Admin panel uses a SEPARATE login URL (/zain-nextill-ansari/login)
NOT the main site login (/login). This is intentional for security isolation.`,
  },
  {
    id: "sidebar-nav",
    icon: LayoutDashboard,
    title: "Admin Panel — Sidebar Navigation",
    content: `The sidebar has 8 sections with collapsible menus:

━━ OVERVIEW ━━
• Dashboard — Stats, charts, recent payments, key metrics

━━ AI HUB ━━
• AI Hub — System-wide AI configuration hub
• Providers — Add/manage AI providers (Gemini, OpenAI, Claude, etc.)
• API Keys — Manage provider API keys with test/rotate
• Models — Configure AI models per provider
• Prompts — Edit system prompts for all tools

━━ BUSINESS ━━
• Plans — Pricing plans (free, pro, enterprise)
• Credits — User credit management, add/remove credits
• Users — All users, create/edit/delete, role management
• Payments — All transactions, filter by status
• Pending Approvals — Payments needing manual review
• Coupons — Discount coupon codes

━━ TOOLS ━━
• Tools — Enable/disable tools, set credit costs & daily limits
• Workflows — Multi-step workflow configuration

━━ SETTINGS ━━
• Site Settings — Site name, logo, meta, maintenance mode
• Security — Security logs, IP blocks, login attempts
• Performance — Caching, CDN, PageSpeed settings
• Integrations — Third-party API connections
• SEO — Meta titles, sitemap, robots.txt config
• Email — SMTP/Resend email configuration
• Backups — Database backup management
• Maintenance — Maintenance mode toggle

━━ MONITORING ━━
• Analytics — Charts, page views, tool usage
• Logs — System logs, error tracking
• Reports — Generated reports & exports

━━ CONTENT ━━
• Documents — All user-created documents
• Projects — User projects management
• Blog — Blog posts CRUD + categories
• Contact — Contact form submissions

━━ SYSTEM ━━
• System Health — Uptime, API status, queue health`,
  },
  {
    id: "tools",
    icon: Wrench,
    title: "AI Tools — What Each Tool Does",
    content: `━━ TOOLS LIST (10 total) ━━

1. KEYWORD INTELLIGENCE (/keyword-intelligence)
   • Enter seed keyword → get: keywords, long-tail, questions, related, LSI, NLP terms, topical map
   • Credits: 3 | Guest limit: 2/day | Free: 5/day | Premium: 50/day
   • Results: Table with Difficulty, CPC, Trend, Intent + exportable lists

2. DOMAIN INTELLIGENCE (/domain-intelligence)
   • Enter domain → get: overview, growth, countries, competitors, backlinks, technical, AI search
   • Credits: 4 | Guest limit: 2/day | Free: 5/day | Premium: 50/day
   • Results: Full domain report with charts, competitor comparison, recommendations

3. POST GENERATOR (/post-generator)
   • Enter keyword → generates complete SEO article
   • Credits: 10 | Guest limit: 1/day | Free: 5/day | Premium: 50/day
   • Results: Full article with outline, humanized text, SEO title, meta desc, FAQ, schema
   • Steps: Keyword analysis → Outline → Write → Humanize → Rewrite → Grammar → AI detect → Plagiarism check → SEO title → Meta desc → FAQ → Schema → Internal links → Readability → Final optimization

4. PLAGIARISM CHECKER (/plagiarism-checker)
   • Paste text → check originality (uses PlagiarismCheck.org API + local)
   • Credits: 4 | Guest limit: 2/day | Free: 5/day | Premium: 50/day
   • Results: Originality score %, similarity score %, matched sources, word count

5. AI WRITER (/ai-writer)
   • Enter topic → generate content (uses RewriteAI + fallback)
   • Credits: 3 | Guest limit: 3/day | Free: 10/day | Premium: 100/day
   • Results: Generated article with word count

6. AI HUMANIZER (/ai-humanizer)
   • Paste AI text → humanize it (uses RewriteAI + fallback)
   • Credits: 3 | Guest limit: 3/day | Free: 10/day | Premium: 100/day
   • Results: Humanized text with improved readability

7. SEO ANALYZER (/seo-analyzer)
   • Enter URL → analyze on-page SEO
   • Credits: 3 | Guest limit: 2/day | Free: 5/day | Premium: 50/day
   • Results: SEO score, meta analysis, content analysis, recommendations

8. RANK TRACKER (/rank-tracker)
   • Enter domain + keyword → track SERP position
   • Credits: 3 | Guest limit: 2/day | Free: 5/day | Premium: 30/day
   • Results: Position history chart, estimated traffic, SERP features

9. BACKLINK ANALYZER (/backlink-analyzer)
   • Enter domain → analyze backlinks
   • Credits: 3 | Guest limit: 2/day | Free: 5/day | Premium: 30/day
   • Results: Total backlinks, referring domains, top backlinks, domain authority

10. WEBSITE AUDIT (/website-audit)
    • Enter domain → full technical SEO audit
    • Credits: 5 | Guest limit: 1/day | Free: 3/day | Premium: 20/day
    • Results: Audit score, issues by category (performance, SEO, mobile, security)`,
  },
  {
    id: "results",
    icon: BarChart3,
    title: "Results & Output Display",
    content: `━━ HOW RESULTS ARE DISPLAYED ━━

1. KEYWORD INTELLIGENCE — RESULTS:
   • Main keyword table: Keyword, Difficulty %, Volume, CPC, Trend, Intent
   • Tabbed sections: Long-tail | Questions | Related | LSI | NLP Terms
   • Topical Map visualization
   • Export: Copy to clipboard or Download as CSV

2. POST GENERATOR — RESULTS:
   • Live progress bar (15 steps)
   • Final article rendered with proper HTML formatting
   • SEO metadata panel: Title, Meta Description, URL slug
   • FAQ section with schema markup
   • Actions: Copy, Download as .txt/.docx, Save to Documents

3. PLAGIARISM CHECKER — RESULTS:
   • Overall originality score (e.g., 96% original)
   • Similarity score
   • Word count
   • Matched sources list (if any found via PlagCheck API)
   • Color-coded: Green (safe), Yellow (warning), Red (plagiarized)

4. DOMAIN INTELLIGENCE — RESULTS:
   • Overview: DA, PA, traffic estimates
   • Growth chart: 12-month trend
   • Countries: Traffic by geography
   • Competitors: Top organic competitors
   • Backlinks profile
   • Technical issues
   • AI-powered recommendations

5. AI WRITER / HUMANIZER — RESULTS:
   • Generated text displayed with formatting
   • Word count
   • Copy button
   • Save to Documents

6. SEO ANALYZER — RESULTS:
   • Overall score (out of 100)
   • Meta tags analysis
   • Content analysis (word count, keyword density)
   • Technical checks (title tag, meta desc, headings, images)
   • Recommendations list

7. RANK TRACKER — RESULTS:
   • Current position
   • Position history (chart)
   • Search volume
   • Estimated traffic
   • SERP features detected

8. BACKLINK ANALYZER — RESULTS:
   • Total backlinks count
   • Referring domains
   • Top backlinks table (source, authority, anchor text)
   • Domain authority score

9. WEBSITE AUDIT — RESULTS:
   • Overall audit score (percentage)
   • Issues by category: Critical, Warning, Info
   • Performance metrics
   • SEO issues
   • Mobile usability
   • Security checks`,
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Payment System",
    content: `━━ PAYMENT PROVIDERS ━━
GoPayFast (PAKISTAN) — Active (primary, manual review)
• Users submit payment via GoPayFast checkout
• Admin reviews in Pending Approvals
• On approval → credits added to user account

Stripe — Partial (auto-verification capable)
PayPal — Not active

━━ BILLING PLANS ━━
• Free: $0 — Limited daily usage, basic tools
• Pro: $29/mo — Higher limits, all tools, priority support
• Enterprise: $99/mo — Unlimited usage, API access, dedicated support

━━ CREDIT SYSTEM ━━
• Each tool use costs credits (1-10 per use)
• Free users: 100 credits on signup
• Pro: Renews monthly with plan credits
• Additional credits: Admin can manually add via Credits page
• Credits tracked in credits table with credit_logs history

━━ ADMIN PAYMENT FLOW ━━
1. User submits payment via GoPayFast
2. Payment appears in Admin → Payments (status: pending_manual_review)
3. Admin reviews details in Payments or Pending Approvals
4. Admin clicks "Approve" → credits auto-added, email sent
5. OR Admin clicks "Reject" → reason recorded, no credits added`,
  },
  {
    id: "email-system",
    icon: Mail,
    title: "Email System",
    content: `━━ EMAIL PROVIDER ━━
Resend (resend.com) — Configured
• From: noreply@adultpulse.co.uk
• API Key: Set in admin panel (Settings → Email) or .env.local

━━ EMAIL TEMPLATES (6 AUTOMATED) ━━
1. Welcome Email — Sent on signup (w/ 100 credits, tool overview)
2. Payment Confirmed — Payment approved, plan activated
3. Credits Low Warning — Running low on monthly credits
4. Password Reset — User requests password reset
5. Subscription Renewed — Monthly credits renewed
6. Payment Pending — Manual payment under admin review

━━ HOW TO SETUP ━━
1. Admin Panel → Settings → Email
2. Select "Resend" provider
3. Paste API Key (re_...)
4. From Email: noreply@adultpulse.co.uk
5. From Name: Nextill AI
6. Click Save Settings
7. Click "Test Email" to verify`,
  },
  {
    id: "integrations",
    icon: Cpu,
    title: "Third-Party API Integrations",
    content: `━━ ACTIVE INTEGRATIONS ━━

1. REWRITEAI (rewriteai.com) ✅ Active
   • API Key: rw_sk_4b2e881...
   • Services: /api/v1/humanize, /api/v1/write
   • Used by: AI Humanizer, AI Writer tools
   • Fallback: Local engine if API fails
   • Config: .env.local → REWRITEAI_API_KEY

2. PLAGIARISMCHECK.ORG ✅ Active
   • API Key: g8wx9zI_K4XhrX7XBuslyphJRg4hVaYh
   • Single-user API
   • Used by: Plagiarism Checker tool
   • Fallback: Local similarity analysis
   • Config: .env.local → PLAGIARISMCHECK_API_KEY

3. RESEND (resend.com) ✅ Active
   • API Key: stored in site_settings or .env.local
   • Used by: All automated emails
   • Domain: adultpulse.co.uk (verified)
   • Config: Settings → Email in admin panel

4. GEMINI (Google AI) — Configured
   • Used as default AI provider
   • Fallback AI provider for all tools

━━ INTEGRATION SETTINGS ━━
Admin Panel → Settings → Integrations:
• DataForSEO — SEO data provider (not active)
• Copyleaks — Plagiarism API (not active)
• Originality.ai — AI detection (not active)
• Resend — Email (active)
• PlagiarismCheck.org — Plagiarism (active via code)
• RewriteAI — Content humanization (active via code)
• Stripe — Payments (partial)
• OpenAI — AI provider (not active)

━━ AI PROVIDERS (Admin Panel → AI Hub → Providers) ━━
• Gemini — Default, configured
• OpenAI — Available, not configured
• Claude — Available, not configured
• DeepSeek — Available, not configured
• plus 8 more providers (Perplexity, Mistral, Grok, OpenRouter, Together, Fireworks, Ollama, DataForSEO, Copyleaks)`,
  },
  {
    id: "seo",
    icon: Search,
    title: "SEO Configuration",
    content: `━━ SITE SEO ━━
• Production URL: www.adultpulse.co.uk
• Google Analytics: G-6VKXTDV48B
• Google Search Console: Verified with meta tag
• Vercel Analytics + Speed Insights: Active

━━ SITEMAP ━━
• /sitemap.xml — All pages + blog posts
• Auto-generated, includes lastmod dates
• All tool pages, blog posts, static pages

━━ ROBOTS.TXT ━━
• /robots.txt — Configured with AI crawler blocking
• Blocks: GPTBot, CCBot, Google-Extended, anthropic-ai, Claude-Web, PerplexityBot
• Allows: All other legitimate search engines

━━ SCHEMA MARKUP ━━
• Product schema with merchant data
• Organization schema
• Blog post schema (Article, FAQPage, BreadcrumbList)
• JSON-LD format

━━ OG IMAGE ━━
• /og-image.png — Auto-generated
• Twitter card meta tags on all pages
• Canonical URLs on all pages

━━ ADMIN SEO PAGE ━━
• Admin Panel → Settings → SEO
• Edit: Meta Title, Meta Description, Keywords
• View sitemap preview
• robots.txt editor`,
  },
  {
    id: "database",
    icon: Database,
    title: "Database Structure",
    content: `━━ DATABASE: Supabase (PostgreSQL) ━━
Admin URL: https://supabase.com/dashboard/project/...

━━ CORE TABLES (44 total) ━━
• profiles — User profiles with roles (free_user, admin, super_admin)
• credits + credit_logs — Credit tracking
• plans — Pricing plans
• payments — Payment transactions
• subscriptions — User subscriptions

━━ TOOLS TABLES ━━
• workflow_settings — Tool config (limits, costs, status)
• workflow_runs — Execution history
• keyword_research — Keyword data
• generated_posts — Generated articles
• plagiarism_reports — Plagiarism results
• domain_reports — Domain analysis

━━ CONTENT TABLES ━━
• blog_posts + blog_categories — Blog system
• documents — User documents
• projects — User projects

━━ ADMIN TABLES ━━
• site_settings — Site configuration (key-value JSONB)
• ai_providers — AI provider config
• ai_api_keys — API key management
• ai_models — Model configuration
• prompt_templates — System prompts
• integration_settings — Third-party integrations
• email_settings — Email provider config
• seo_settings — SEO meta config

━━ SECURITY TABLES ━━
• security_logs — Security events
• admin_logs — Admin actions
• admin_audit_logs — Audit trail
• system_logs — System errors

━━ MIGRATIONS ━━
• 001-019 migration files in supabase/migrations/
• schema.sql is the single source of truth (but has duplicates)`,
  },
  {
    id: "deploy",
    icon: Rocket,
    title: "Deployment & Maintenance",
    content: `━━ HOSTING ━━
• Vercel (Production)
• Branch: main → auto-deploy on push
• URL: www.adultpulse.co.uk

━━ ENVIRONMENT VARIABLES (.env.local) ━━
Essential vars needed for production:
• NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
• SUPABASE_SERVICE_ROLE_KEY
• GEMINI_API_KEY
• RESEND_API_KEY (for emails)
• PLAGIARISMCHECK_API_KEY
• REWRITEAI_API_KEY
• NEXT_PUBLIC_SITE_URL
• ADMIN_EMAIL

━━ BUILD COMMANDS ━━
• npx tsc --noEmit — TypeScript check
• npm run lint — Lint check
• npm run build — Full build
• npm run dev — Local development

━━ DEPLOY STEPS ━━
1. Make changes → fix all TS errors
2. npm run build — verify passes
3. Update CHANGELOG-ALL.md
4. git add -A && git commit -m "description"
5. git push origin main
6. Vercel auto-deploys from main branch

━━ MIGRATION ORDER ━━
Run migrations in Supabase SQL Editor in this order:
1. 017_add_security_log_columns.sql (if security_logs missing columns)
2. 018_add_payment_columns_and_table.sql
3. 016_configure_daily_limits.sql
4. 019_fix_all.sql (THE CATCH-ALL — fixes everything)
5. OR just run schema.sql + 019_fix_all.sql`,
  },
]

export default function DocumentationPage() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["overview"]))

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] shadow-xl shadow-[#6D5EF5]/20 mb-4">
          <BookMarked className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Nextill AI — Complete Site Guide</h1>
        <p className="text-muted max-w-2xl mx-auto">
          Everything you need to know about the platform — authentication, tools, payments,
          admin panel, integrations, deployment, and more. Click any section to expand.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-muted">
          <span className="px-2 py-1 rounded-md bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
            Live Site
          </span>
          <span className="px-2 py-1 rounded-md bg-[#6D5EF5]/10 text-[#6D5EF5] border border-[#6D5EF5]/20">
            10 AI Tools
          </span>
          <span className="px-2 py-1 rounded-md bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
            44 DB Tables
          </span>
        </div>
      </motion.div>

      {/* Quick Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
      >
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              onClick={() => toggleSection(section.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                openSections.has(section.id)
                  ? "bg-[#6D5EF5]/10 border-[#6D5EF5]/20 text-[#6D5EF5]"
                  : "bg-card/50 border-border text-muted hover:text-foreground hover:border-white/[0.12]"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{section.title}</span>
            </button>
          )
        })}
      </motion.div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section, idx) => {
          const Icon = section.icon
          const isOpen = openSections.has(section.id)

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="rounded-xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-card/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B5CF6]/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#6D5EF5]" />
                </div>
                <span className="font-semibold text-sm text-foreground">{section.title}</span>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted ml-auto shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted ml-auto shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1">
                  <div className="border-t border-border pt-4">
                    <pre className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans">
                      {section.content}
                    </pre>

                    {/* Special: Quick Links for Tools */}
                    {section.id === "tools" && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                        {[
                          { name: "Keyword Intelligence", url: "/keyword-intelligence", color: "from-blue-500 to-purple-600" },
                          { name: "Domain Intelligence", url: "/domain-intelligence", color: "from-teal-500 to-blue-600" },
                          { name: "Post Generator", url: "/post-generator", color: "from-pink-500 to-rose-600" },
                          { name: "Plagiarism Checker", url: "/plagiarism-checker", color: "from-orange-500 to-red-600" },
                          { name: "AI Writer", url: "/ai-writer", color: "from-green-500 to-emerald-600" },
                          { name: "AI Humanizer", url: "/ai-humanizer", color: "from-violet-500 to-purple-600" },
                          { name: "SEO Analyzer", url: "/seo-analyzer", color: "from-cyan-500 to-blue-600" },
                          { name: "Rank Tracker", url: "/rank-tracker", color: "from-amber-500 to-orange-600" },
                          { name: "Backlink Analyzer", url: "/backlink-analyzer", color: "from-indigo-500 to-violet-600" },
                          { name: "Website Audit", url: "/website-audit", color: "from-red-500 to-pink-600" },
                        ].map((tool) => (
                          <a
                            key={tool.name}
                            href={tool.url}
                            target="_blank"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/50 border border-border text-xs text-muted hover:text-foreground hover:border-[#6D5EF5]/30 transition-all group"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${tool.color}`} />
                            <span className="truncate">{tool.name}</span>
                            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="text-center py-8">
        <p className="text-xs text-muted">
          Nextill AI v2.0 | Built with Next.js 16 + Supabase + Tailwind CSS v4
        </p>
        <p className="text-xs text-muted mt-1">
          Last updated: July 30, 2026
        </p>
      </div>
    </div>
  )
}
