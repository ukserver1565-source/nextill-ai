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
  TrendingUp, Activity, FileType, Quote, Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SiteLogo } from "@/components/shared/site-logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { LatestBlogPosts } from "@/components/home/latest-blog-posts"

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
  { icon: Users, value: "10,000+", label: "Active Creators" },
  { icon: FileText, value: "50,000+", label: "Articles Generated" },
  { icon: Globe, value: "2.4B", label: "Pages Scanned" },
  { icon: Star, value: "4.9/5", label: "User Rating" },
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

import type { PlanData } from "@/lib/data/plans"

interface WorkflowCost {
  workflow_slug: string
  credits_cost: number
}

const defaultCreditCosts: WorkflowCost[] = [
  { workflow_slug: "domain-intelligence", credits_cost: 2 },
  { workflow_slug: "post-generator", credits_cost: 10 },
  { workflow_slug: "plagiarism-checker", credits_cost: 4 },
]

interface HomeClientProps {
  initialPlans: PlanData[]
}

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
      { label: "How It Works", href: "/how-it-works" },
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
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

export default function HomePage({ initialPlans }: HomeClientProps) {
  const { profile } = useAuth()
  const dashboardHref = profile ? "/dashboard" : "/login"
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeDemo, setActiveDemo] = useState(0)
  const [plans] = useState<PlanData[]>(initialPlans)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [creditCosts, setCreditCosts] = useState<WorkflowCost[]>(defaultCreditCosts)
  const [showAllPlans, setShowAllPlans] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setActiveDemo((p) => (p + 1) % demos.length), 4000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {

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

  const _allPlanFeatures = useMemo(
    () => [...new Set(plans.flatMap(p => p.features || []))].sort(),
    [plans]
  )

  const _formatExports = (exports: string[]) => {
    if (!exports || exports.length === 0) return "—"
    return exports.join(", ")
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-topbar h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <SiteLogo size="md" />
          <nav className="hidden md:flex items-center gap-8 text-sm">
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "/how-it-works" },
              { label: "Tools", href: "#tools" },
              { label: "Pricing", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-muted hover:text-white transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/blog"
              className="text-muted hover:text-white transition-colors duration-200"
            >
              Blog
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
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
                {[
                  { label: "Features", href: "#features" },
                  { label: "How It Works", href: "/how-it-works" },
                  { label: "Tools", href: "#tools" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "FAQ", href: "#faq" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm text-muted hover:text-white transition-colors py-2"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/blog"
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm text-muted hover:text-white transition-colors py-2"
                >
                  Blog
                </Link>
                <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                {!profile && (
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <Button variant="gradient" className="w-full">
                      Get Started Free
                    </Button>
                  </Link>
                )}
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

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-muted"
          >
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1.5">
                {[0,1,2,3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background flex items-center justify-center text-[8px] font-bold text-white">
                    {["A","K","S","M"][i]}
                  </div>
                ))}
              </div>
              <span>10,000+ creators</span>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
              <span className="ml-1">4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>No credit card required</span>
            </div>
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

      {/* HOW IT WORKS */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="px-4 py-20"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="info" className="mb-4 px-3 py-1 text-xs">
              <Zap className="w-3 h-3 mr-1.5" />
              Simple Workflow
            </Badge>
            <h2 className="text-3xl font-bold">How <span className="gradient-primary-text">Nextill AI</span> Works</h2>
            <p className="text-muted mt-2 max-w-xl mx-auto">
              Three simple steps to research, create, and publish SEO-optimized content.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-violet-500/50 via-primary/50 to-emerald-500/50" />
            {[
              { step: "01", icon: Search, title: "Research Keywords", desc: "Discover high-value keywords with volume, difficulty, and SERP analysis powered by AI.", color: "from-violet-500 to-indigo-600" },
              { step: "02", icon: FileText, title: "Generate Content", desc: "Create SEO-optimized blog posts, articles, and guides with AI in seconds — not hours.", color: "from-blue-500 to-purple-600" },
              { step: "03", icon: Shield, title: "Verify Originality", desc: "Check content against billions of web sources to ensure authenticity before publishing.", color: "from-emerald-500 to-green-600" },
            ].map((s) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.step}
                  variants={staggerItem}
                  className="relative text-center"
                >
                  <div className="relative z-10 mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-background to-background border border-white/[0.08] flex items-center justify-center mb-5 shadow-lg">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary/50 bg-background px-2 rounded-full border border-white/[0.06]">
                    STEP {s.step}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted leading-relaxed max-w-xs mx-auto">{s.desc}</p>
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

          {/* Pricing Cards — plans are server-rendered via initialPlans */}
          {plans.length === 0 ? (
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
                    isLoggedIn={!!profile}
                  />
                ))}
              </div>

              {/* See More/Less Plans Button */}
              {plans.length > 3 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => {
                      setShowAllPlans(!showAllPlans)
                      if (showAllPlans) {
                        document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })
                      }
                    }}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium border border-white/[0.12] hover:bg-white/[0.04] transition-colors text-muted hover:text-white"
                  >
                    {showAllPlans ? "See Less Plans" : "See More Plans"}
                  </button>
                </div>
              )}
            </>
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

      {/* TESTIMONIALS / SOCIAL PROOF */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="px-4 pb-20 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold"><span className="gradient-primary-text">Loved by</span> Creators</h2>
            <p className="text-muted mt-2 max-w-xl mx-auto">
              See what our users say about Nextill AI.
            </p>
          </div>

          {/* Trust stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
            {[
              { icon: Users, label: "Active Users", value: "10,000+" },
              { icon: FileText, label: "Posts Generated", value: "50,000+" },
              { icon: Star, label: "Average Rating", value: "4.8/5" },
              { icon: TrendingUp, label: "Time Saved", value: "80%" },
            ].map(stat => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-muted">{stat.label}</p>
                </div>
              )
            })}
          </div>

          {/* Testimonial cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Chen",
                role: "SEO Manager at TechCorp",
                text: "Nextill AI cut our content production time by 80%. The keyword research + post generation workflow is incredible — we rank on page 1 within weeks.",
                rating: 5,
              },
              {
                name: "Marcus Johnson",
                role: "Freelance Content Creator",
                text: "I produce 3x more content now without sacrificing quality. The plagiarism checker gives me peace of mind before publishing. Game changer for freelancers.",
                rating: 5,
              },
              {
                name: "Elena Rodriguez",
                role: "Marketing Director at StartupXYZ",
                text: "The domain intelligence tool helped us discover keyword gaps our competitors missed. We doubled our organic traffic in 3 months.",
                rating: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all"
              >
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-sm text-muted leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-[10px] text-muted">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* LATEST BLOG POSTS */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="px-4 pb-20 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold"><span className="gradient-primary-text">Latest</span> from the Blog</h2>
            <p className="text-muted mt-2 max-w-xl mx-auto">
              Tips, insights, and updates on AI-powered SEO and content creation.
            </p>
          </div>
          <LatestBlogPosts />
          <div className="text-center mt-8">
            <Link href="/blog">
              <Button variant="glass" size="sm" className="text-sm px-6">
                View All Posts <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
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
              <h2 className="text-2xl sm:text-3xl font-bold">Start <span className="gradient-primary-text">Ranking Higher</span> Today</h2>
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
              <SiteLogo size="md" className="mb-4" />
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
