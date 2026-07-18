"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/lib/auth/AuthProvider"
import { PricingCard } from "@/components/pricing/pricing-card"
import {
  Search, FileText, Shield, Sparkles, ArrowRight, Check,
  Menu, X, BarChart3, Star, Zap, Globe, Clock, Award,
  BookOpen, Layers, ChevronDown, ChevronRight,
  TrendingUp, Activity, FileType, Loader2, Tag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
}

const workflows = [
  {
    icon: Search,
    name: "Domain Intelligence",
    desc: "Discover high-value keywords with volume, difficulty & SERP analysis powered by AI.",
    features: ["Search volume & trends", "Keyword difficulty scoring", "SERP feature analysis"],
    slug: "domain-overview",
    color: "from-violet-500 to-indigo-600",
    glow: "shadow-violet-500/20",
  },
  {
    icon: FileText,
    name: "Post Generator",
    desc: "Generate full SEO-optimized blog posts with AI in one click — titles, meta, and schema included.",
    features: ["Full article generation", "SEO title & meta", "FAQ & schema markup"],
    slug: "post-generator",
    color: "from-blue-500 to-purple-600",
    glow: "shadow-blue-500/20",
  },
  {
    icon: Shield,
    name: "Plagiarism & Authenticity",
    desc: "Check content originality against billions of web sources with detailed similarity reports.",
    features: ["Web-wide comparison", "Similarity scoring", "Source URL detection"],
    slug: "plagiarism-checker",
    color: "from-emerald-500 to-green-600",
    glow: "shadow-emerald-500/20",
  },
]

const stats = [
  { icon: BarChart3, value: "AI-Powered", label: "Keyword Analysis" },
  { icon: FileText, value: "SEO Optimized", label: "Content Generation" },
  { icon: Activity, value: "Real-time", label: "Plagiarism Checking" },
  { icon: Star, value: "Secure", label: "by Design" },
]

const templates = [
  { icon: BookOpen, name: "Blog Post", desc: "Conversational, informational blog content", href: "/post-generator" },
  { icon: TrendingUp, name: "SEO Article", desc: "Keyword-focused with metadata and FAQs", href: "/post-generator" },
  { icon: Star, name: "Product Review", desc: "Features, pros, cons, and verdict", href: "/post-generator" },
  { icon: Layers, name: "Tutorial", desc: "Step-by-step guide with examples", href: "/post-generator" },
  { icon: FileType, name: "Comprehensive Guide", desc: "In-depth topic coverage", href: "/post-generator" },
  { icon: ChevronRight, name: "Listicle", desc: "Numbered list format for easy scanning", href: "/post-generator" },
]

const highlights = [
  {
    icon: Search,
    title: "Domain Intelligence",
    desc: "Discover high-value keywords with real-time volume, difficulty scoring, and SERP feature analysis — all powered by AI.",
    color: "from-violet-500 to-indigo-600",
  },
  {
    icon: FileText,
    title: "Post Generator",
    desc: "Generate full SEO-optimized blog posts with AI — including titles, meta descriptions, FAQ schema, and internal links.",
    color: "from-blue-500 to-purple-600",
  },
  {
    icon: Shield,
    title: "Plagiarism & Authenticity",
    desc: "Check content originality with detailed similarity scoring, source URL detection, and downloadable reports.",
    color: "from-emerald-500 to-green-600",
  },
]

interface Plan {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_yearly: number
  credits: number
  features: string[]
  is_active: boolean
  is_popular: boolean
  badge: string | null
  max_projects: number
  max_documents: number
  max_article_length: number
  max_reports_per_month: number
  report_history_days: number
  exports: string[]
  support_level: string
  sort_order: number
}

interface WorkflowCost {
  workflow_slug: string
  credits_cost: number
}

const defaultCreditCosts: WorkflowCost[] = [
  { workflow_slug: "domain-intelligence", credits_cost: 2 },
  { workflow_slug: "post-generator", credits_cost: 10 },
  { workflow_slug: "plagiarism-checker", credits_cost: 4 },
]

const FALLBACK_PLANS: Plan[] = [
  {
    id: "fallback-free", name: "Free", slug: "free",
    price_monthly: 0, price_yearly: 0, credits: 100, is_active: true,
    is_popular: false, badge: null, sort_order: 0, support_level: "community",
    exports: ["txt"], max_projects: 1, max_documents: 10, max_article_length: 1500,
    max_reports_per_month: 1, report_history_days: 7,
    features: ["1 Domain Intelligence check/day", "1 Post Generator test/day", "1 Plagiarism check/day", "1 project", "10 documents"],
  },
  {
    id: "fallback-starter", name: "Starter", slug: "starter",
    price_monthly: 19, price_yearly: 190, credits: 2000, is_active: true,
    is_popular: false, badge: null, sort_order: 1, support_level: "email",
    exports: ["txt", "markdown"], max_projects: 5, max_documents: 50, max_article_length: 2000,
    max_reports_per_month: 20, report_history_days: 30,
    features: ["Domain Intelligence — basic analysis", "Post Generator — up to 2,000 words", "SEO title, meta, FAQ, schema", "5 projects", "50 documents", "Email support"],
  },
  {
    id: "fallback-pro", name: "Pro", slug: "pro",
    price_monthly: 49, price_yearly: 490, credits: 7500, is_active: true,
    is_popular: true, badge: "MOST POPULAR", sort_order: 2, support_level: "priority",
    exports: ["pdf", "csv", "txt", "markdown"], max_projects: 25, max_documents: 500, max_article_length: 5000,
    max_reports_per_month: 100, report_history_days: 365,
    features: ["Everything in Starter", "Domain Intelligence — full live metrics", "Competitor & backlink analysis", "Post Generator — up to 5,000 words", "25 projects", "500 documents", "Priority email support"],
  },
  {
    id: "fallback-business", name: "Business", slug: "business",
    price_monthly: 99, price_yearly: 990, credits: 20000, is_active: true,
    is_popular: false, badge: null, sort_order: 3, support_level: "priority",
    exports: ["pdf", "csv", "txt", "markdown"], max_projects: 100, max_documents: 5000, max_article_length: 10000,
    max_reports_per_month: 500, report_history_days: 9999,
    features: ["Everything in Pro", "Post Generator — up to 10,000 words", "100 projects", "5,000 documents", "Unlimited report history", "Priority support"],
  },
]

const faqs = [
    {
      q: "What is Nextill AI?",
      a: "Nextill AI is a premium AI platform offering 3 powerful workflows: Keyword Intelligence for SEO research, Post Generator for AI content creation, and Plagiarism Checker for originality verification.",
    },
    {
      q: "Can I use tools without signing up?",
      a: "Yes! All 3 workflows are available for guest use with daily limits. Sign up for unlimited access and to save your work.",
    },
    {
      q: "How do AI credits work?",
      a: "Each workflow usage costs a small number of credits. Free users get a starter credit balance to begin. Upgrade your plan for more monthly credits.",
    },
    {
      q: "Can I save my work?",
      a: "Logged-in users can save documents, track history, and manage projects. Guest usage is not saved — create an account to persist your work.",
    },
    {
      q: "Is my data secure?",
      a: "Absolutely. We use enterprise-grade encryption for all data. API keys are stored securely, and we never share your content or research data.",
    },
    {
      q: "Can I upgrade or cancel anytime?",
      a: "Yes. You can upgrade, downgrade, or cancel your subscription at any time. Plans are billed monthly with no lock-in contracts.",
    },
]

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Domain Intelligence", href: "/domain-overview" },
      { label: "Post Generator", href: "/post-generator" },
      { label: "Plagiarism & Authenticity", href: "/plagiarism-checker" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "All Tools", href: "/tools" },
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Tools", href: "/tools" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
]

const demos = [
  {
    name: "Domain Intelligence",
    icon: Search,
    color: "from-violet-500 to-indigo-600",
    badge: "Example Preview",
    lines: [
      { label: "Keyword", value: "AI content writing tools" },
      { label: "Volume", value: "12,100" },
      { label: "Difficulty", value: "42/100" },
      { label: "CPC", value: "$3.25" },
      { label: "Trend", value: "↗ Rising" },
    ],
  },
  {
    name: "Post Generator",
    icon: FileText,
    color: "from-blue-500 to-purple-600",
    badge: "Example Preview",
    lines: [
      { label: "Title", value: "Complete Guide to AI Content Writing" },
      { label: "Meta", value: "Discover the best AI writing tools..." },
      { label: "Sections", value: "8 sections generated" },
      { label: "Word Count", value: "2,048 words" },
      { label: "Read Time", value: "9 min read" },
    ],
  },
  {
    name: "Plagiarism & Authenticity",
    icon: Shield,
    color: "from-emerald-500 to-green-600",
    badge: "Example Preview",
    lines: [
      { label: "Originality", value: "94% Original" },
      { label: "AI Likelihood", value: "Likely human-written" },
      { label: "Sources Checked", value: "2.4B web pages" },
      { label: "Sentences", value: "142 analyzed" },
      { label: "Status", value: "Safe to publish" },
    ],
  },
]

export default function HomePage() {
  const { profile } = useAuth()
  const dashboardHref = profile ? "/dashboard" : "/login"
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeDemo, setActiveDemo] = useState(0)
  const [plans, setPlans] = useState<Plan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [couponCode, setCouponCode] = useState("")
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount: number; type: string; message: string } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [creditCosts, setCreditCosts] = useState<WorkflowCost[]>(defaultCreditCosts)
  const [showAllPlans, setShowAllPlans] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setActiveDemo((p) => (p + 1) % demos.length), 4000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    fetch("/api/public/plans")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPlans(data
            .filter((p: any) => p.is_active !== false)
            .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.price_monthly ?? 99) - (b.price_monthly ?? 99))
          )
        } else {
          // API returned empty or errored — use fallback plans
          setPlans(FALLBACK_PLANS)
        }
      })
      .catch(() => {
        setPlans(FALLBACK_PLANS)
      })
      .finally(() => setPlansLoading(false))

    fetch("/api/public/workflow-settings")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCreditCosts(data.map((w: any) => ({
            workflow_slug: w.workflow_slug,
            credits_cost: w.credits_cost,
          })))
        }
      })
      .catch(() => {})
  }, [])

  const getCreditCost = (slug: string) => {
    return creditCosts.find(c => c.workflow_slug === slug)?.credits_cost || 0
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponResult(null)
    try {
      const res = await fetch("/api/public/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), billing_cycle: billingCycle }),
      })
      const data = await res.json()
      setCouponResult({
        valid: data.valid || false,
        discount: data.discount || 0,
        type: data.type || "",
        message: data.message || "Invalid coupon",
      })
    } catch {
      setCouponResult({ valid: false, discount: 0, type: "", message: "Failed to validate coupon" })
    } finally {
      setCouponLoading(false)
    }
  }

  const _allPlanFeatures = useMemo(
    () => [...new Set(plans.flatMap(p => p.features || []))].sort(),
    [plans]
  )

  const _formatExports = (exports: string[]) => {
    if (!exports || exports.length === 0) return "—"
    return exports.join(", ")
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-topbar h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="gradient-primary-text">Nextill AI</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            {["Features", "Tools", "Pricing", "FAQ"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-muted hover:text-white transition-colors duration-200"
              >
                {item}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href={dashboardHref} className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="gradient" size="sm">
                Get Started
              </Button>
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-muted hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="md:hidden bg-[#090B16]/80 backdrop-blur-2xl border-t border-white/[0.06] shadow-2xl"
            >
              <div className="px-4 py-4 space-y-3">
                {["Features", "Tools", "Pricing", "FAQ"].map((item) => (
                  <Link
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm text-muted hover:text-white transition-colors py-2"
                  >
                    {item}
                  </Link>
                ))}
                <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[140px]" />
          <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/10 blur-[160px]" />
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Badge variant="info" className="mb-6 px-4 py-1.5 text-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              AI-Powered SEO Tools
            </Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="h-responsive-lg font-bold tracking-tight max-w-4xl mx-auto leading-tight"
          >
            Intelligent Content.{" "}
            <span className="gradient-primary-text">Powered by AI.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-muted text-lg mt-4 max-w-2xl mx-auto"
          >
            Three powerful workflows — Keyword Intelligence, Post Generator, and Plagiarism Checker — to research,
            create, and verify content at scale.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signup">
              <Button variant="gradient" size="lg" className="w-full sm:w-auto text-base px-8">
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href={dashboardHref}>
              <Button variant="glass" size="lg" className="w-full sm:w-auto text-base px-8">
                Dashboard
              </Button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
          >
            {[
              { icon: Zap, label: "3 Premium Tools", desc: "Keyword, post & plagiarism" },
              { icon: Globe, label: "Multi-language", desc: "Broad language support" },
              { icon: Clock, label: "No Signup Required", desc: "Use instantly as guest" },
              { icon: Award, label: "Free Credits", desc: "Start with credits included" },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="glass-card rounded-xl p-4 text-center hover:-translate-y-1 hover:border-white/[0.12] transition-all duration-300">
                  <Icon className="w-5 h-5 text-primary-light mx-auto mb-2" />
                  <p className="text-sm font-semibold">{s.label}</p>
                  <p className="text-xs text-muted mt-0.5">{s.desc}</p>
                </div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* LIVE DEMO */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="px-4 pb-20"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Badge variant="default" className="mb-4 px-3 py-1 text-xs">
              <Zap className="w-3 h-3 mr-1.5" />
              Live Preview
            </Badge>
            <h2 className="text-3xl font-bold">See It In Action</h2>
            <p className="text-muted mt-2 max-w-xl mx-auto">
              Watch how each workflow delivers instant results — cycling automatically.
            </p>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex border-b border-border">
              {demos.map((demo, i) => {
                const Icon = demo.icon
                return (
                  <button
                    key={demo.name}
                    onClick={() => setActiveDemo(i)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-all duration-300 ${
                      activeDemo === i
                        ? "text-white bg-white/[0.04] border-b-2 border-primary"
                        : "text-muted hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{demo.name}</span>
                  </button>
                )
              })}
            </div>
            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDemo}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {(() => {
                    const demo = demos[activeDemo]
                    const DemoIcon = demo.icon
                    return (
                      <>
                        <div className="flex items-center gap-3 mb-6">
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${demo.color} flex items-center justify-center`}
                          >
                            <DemoIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{demo.name}</h3>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-[#A7B0C0] border border-white/[0.06]">{demo.badge}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {demo.lines.map((line) => (
                            <div
                              key={line.label}
                              className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                            >
                              <span className="text-xs text-muted">{line.label}</span>
                              <span className="text-xs text-white font-medium">{line.value}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* WORKFLOW GRID */}
      <motion.section
        id="features"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="px-4 pb-20 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Three Workflows. <span className="gradient-primary-text">Infinite Possibilities.</span></h2>
            <p className="text-muted mt-2 max-w-xl mx-auto">
              Everything you need to research, create, and verify content — all in one platform.
            </p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {workflows.map((w) => {
              const Icon = w.icon
              return (
                <motion.div key={w.name} variants={staggerItem}>
                  <Link
                    href={`/${w.slug}`}
                    className="glass-card rounded-2xl p-6 sm:p-8 h-full flex flex-col group hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${w.color} flex items-center justify-center mb-4 shadow-lg ${w.glow}`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold group-hover:gradient-primary-text transition-all duration-300">
                      {w.name}
                    </h3>
                    <p className="text-sm text-muted mt-2 flex-1">{w.desc}</p>
                    <ul className="mt-4 space-y-2">
                      {w.features.map((f) => (
                        <li key={f} className="text-xs text-muted flex items-center gap-2">
                          <Check className="w-3 h-3 text-primary-light shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 pt-4 border-t border-border flex items-center gap-1.5 text-sm text-primary-light font-medium">
                      Learn More <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* STATISTICS */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="px-4 pb-20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.label}
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="glass-card rounded-2xl p-6 text-center hover:border-white/[0.12] transition-all duration-300"
                >
                  <Icon className="w-6 h-6 text-primary-light mx-auto mb-3" />
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted mt-1">{s.label}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* TEMPLATES */}
      <motion.section
        id="tools"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="px-4 pb-20 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold"><span className="gradient-primary-text">Content Templates</span></h2>
            <p className="text-muted mt-2 max-w-xl mx-auto">
              Start with a proven template and let AI do the rest.
            </p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {templates.map((t) => {
              const Icon = t.icon
              return (
                <motion.div key={t.name} variants={staggerItem}>
                  <Link href={t.href} className="block">
                    <div className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group">
                      <Icon className="w-5 h-5 text-primary-light mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold">{t.name}</h3>
                      <p className="text-xs text-muted mt-1">{t.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* HIGHLIGHTS */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="px-4 pb-20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why <span className="gradient-primary-text">Nextill AI</span></h2>
            <p className="text-muted mt-2 max-w-xl mx-auto">
              Three powerful workflows to supercharge your content creation.
            </p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {highlights.map((h) => {
              const Icon = h.icon
              return (
                <motion.div key={h.title} variants={staggerItem}>
                  <div className="glass-card rounded-2xl p-6 h-full flex flex-col hover:-translate-y-1 hover:border-primary/30 transition-all duration-300">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${h.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{h.title}</h3>
                    <p className="text-sm text-muted flex-1 leading-relaxed">{h.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* PRICING */}
      <motion.section
        id="pricing"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative px-4 pb-20 scroll-mt-20"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] rounded-full bg-[#6D5EF5]/10 blur-[120px]" />
          <div className="absolute -bottom-40 left-1/4 w-[400px] h-[400px] rounded-full bg-[#4CC9F0]/10 blur-[100px]" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2 sm:mb-3">Simple, <span className="gradient-primary-text">Transparent</span> Pricing</h2>
            <p className="text-muted text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-2">
              Choose the plan that fits your needs. Upgrade or downgrade at any time.
            </p>
          </div>

          {/* Monthly/Yearly Toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${billingCycle === "monthly" ? "bg-[#6D5EF5] text-white shadow-lg shadow-[#6D5EF5]/20" : "text-[#A7B0C0] hover:text-white"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${billingCycle === "yearly" ? "bg-[#6D5EF5] text-white shadow-lg shadow-[#6D5EF5]/20" : "text-[#A7B0C0] hover:text-white"}`}
            >
              Yearly
              <span className="ml-1.5 text-[10px] font-bold text-emerald-400">Save 2 months</span>
            </button>
          </div>

          {/* Pricing Cards */}
          {plansLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-primary-light animate-spin" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted text-sm">No plans available at this time.</p>
              <Link href="/contact"><Button variant="glass" className="mt-4">Contact Us</Button></Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-lg sm:max-w-none mx-auto">
                {(showAllPlans ? plans : plans.slice(0, 3)).map((plan) => (
                  <PricingCard
                    key={plan.id}
                    plan={plan}
                    billingCycle={billingCycle}
                  />
                ))}
              </div>

              {/* See More Plans Button */}
              {!showAllPlans && plans.length > 3 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowAllPlans(true)}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium border border-white/[0.12] hover:bg-white/[0.04] transition-colors text-muted hover:text-white"
                  >
                    See More Plans
                  </button>
                </div>
              )}
            </>
          )}

          {/* Coupon Section — only show when plans are loaded */}
          {plans.length > 0 && (
          <div className="mt-10 sm:mt-12 max-w-md mx-auto">
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-[#6D5EF5]" />
                <span className="text-sm font-medium text-white">Have a coupon?</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null) }}
                  placeholder="Enter coupon code"
                  className="flex-1 h-10 px-3 rounded-lg bg-[#090B16] border border-white/[0.06] text-sm text-white placeholder-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 font-mono uppercase"
                />
                <button
                  onClick={validateCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="h-10 px-4 rounded-lg bg-[#6D5EF5] text-white text-xs font-medium hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                </button>
              </div>
              {couponResult && (
                <div className={`mt-3 flex items-center gap-2 text-xs ${couponResult.valid ? "text-emerald-400" : "text-[#EF4444]"}`}>
                  {couponResult.valid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  {couponResult.message}
                </div>
              )}
            </div>
          </div>
          )}

          {/* How Credits Work */}
          <div className="mt-12 sm:mt-16 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">How <span className="gradient-primary-text">Credits</span> Work</h2>
              <p className="text-muted text-sm">Each action costs credits. Credits reset monthly with your plan.</p>
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left p-4 text-xs text-[#A7B0C0] font-medium uppercase">Action</th>
                    <th className="text-right p-4 text-xs text-[#A7B0C0] font-medium uppercase">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/[0.03]">
                    <td className="p-4 text-white text-xs sm:text-sm">Domain Intelligence — basic/local</td>
                    <td className="p-4 text-right"><span className="inline-flex items-center gap-1 text-xs font-medium text-[#6D5EF5]"><Zap className="w-3 h-3" />{getCreditCost("domain-intelligence")}</span></td>
                  </tr>
                  <tr className="border-b border-white/[0.03]">
                    <td className="p-4 text-white text-xs sm:text-sm">Post Generator — 1,000 words</td>
                    <td className="p-4 text-right"><span className="inline-flex items-center gap-1 text-xs font-medium text-[#6D5EF5]"><Zap className="w-3 h-3" />5</span></td>
                  </tr>
                  <tr className="border-b border-white/[0.03]">
                    <td className="p-4 text-white text-xs sm:text-sm">Post Generator — 2,000 words</td>
                    <td className="p-4 text-right"><span className="inline-flex items-center gap-1 text-xs font-medium text-[#6D5EF5]"><Zap className="w-3 h-3" />8</span></td>
                  </tr>
                  <tr className="border-b border-white/[0.03]">
                    <td className="p-4 text-white text-xs sm:text-sm">Post Generator — 5,000 words</td>
                    <td className="p-4 text-right"><span className="inline-flex items-center gap-1 text-xs font-medium text-[#6D5EF5]"><Zap className="w-3 h-3" />20</span></td>
                  </tr>
                  <tr className="border-b border-white/[0.03]">
                    <td className="p-4 text-white text-xs sm:text-sm">Plagiarism & Authenticity check</td>
                    <td className="p-4 text-right"><span className="inline-flex items-center gap-1 text-xs font-medium text-[#6D5EF5]"><Zap className="w-3 h-3" />{getCreditCost("plagiarism-checker")}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-center text-xs text-[#A7B0C0] mt-4">Credit costs are configured by the admin and may vary.</p>
          </div>
        </div>
      </motion.section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* FAQ */}
      <motion.section
        id="faq"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="px-4 pb-20 scroll-mt-20"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold"><span className="gradient-primary-text">Frequently</span> Asked Questions</h2>
            <p className="text-muted mt-2">Everything you need to know about Nextill AI.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`glass-card rounded-xl overflow-hidden transition-all duration-300 ${
                  openFaq === i ? "border-primary/30" : "hover:border-white/[0.12]"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-sm font-medium pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted shrink-0 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaq === i ? "auto" : 0,
                    opacity: openFaq === i ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-muted leading-relaxed">{faq.a}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* CTA */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="px-4 pb-20"
      >
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
            >
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/20 blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-secondary/15 blur-[80px]" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold">Ready to <span className="gradient-primary-text">Transform</span> Your Workflow?</h2>
              <p className="text-muted mt-3 max-w-lg mx-auto">
                Built for creators, marketers, and SEO teams to research, create, and optimize content in one workspace.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button variant="gradient" size="lg" className="text-base px-8">
                    Start Free <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/tools">
                  <Button variant="glass" size="lg" className="text-base px-8">
                    Explore Tools
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold gradient-primary-text">Nextill AI</span>
              </Link>
              <p className="text-xs text-muted leading-relaxed max-w-xs">
                AI-powered SEO and content tools for modern creators. Research keywords, generate content, and verify originality.
              </p>
            </div>
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-xs text-muted hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted">
              &copy; {new Date().getFullYear()} Nextill AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
