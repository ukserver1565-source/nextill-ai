"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import {
  Search, FileText, Shield, Sparkles, ArrowRight, Check,
  Menu, X, BarChart3, Star, Zap, Globe, Clock, Award,
  BookOpen, Layers, ChevronDown, Quote, ChevronRight,
  TrendingUp, Users, Activity, ExternalLink, FileType
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StaggerContainer, StaggerItem } from "@/components/layout/stagger-wrapper"

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
    name: "Keyword Intelligence",
    desc: "Discover high-value keywords with volume, difficulty & SERP analysis powered by AI.",
    features: ["Search volume & trends", "Keyword difficulty scoring", "SERP feature analysis"],
    slug: "keyword-intelligence",
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
    name: "Plagiarism Checker",
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
  { icon: Star, value: "Enterprise", label: "Grade Security" },
]

const templates = [
  { icon: BookOpen, name: "Blog Post", desc: "Engaging blog content optimized for search", href: "/post-generator" },
  { icon: TrendingUp, name: "SEO Article", desc: "Deep-dive articles with keyword targeting", href: "/post-generator?template=seo-article" },
  { icon: Star, name: "Product Review", desc: "Review content with pros, cons & ratings", href: "/post-generator?template=product-review" },
  { icon: Layers, name: "Tutorial", desc: "Step-by-step guides with clear instructions", href: "/post-generator?template=tutorial" },
  { icon: FileType, name: "Guide", desc: "Comprehensive guides on any topic", href: "/post-generator?template=guide" },
  { icon: ChevronRight, name: "Listicle", desc: "Scannable list-style content that ranks", href: "/post-generator?template=listicle" },
]

const highlights = [
  {
    icon: Search,
    title: "Keyword Intelligence",
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
    title: "Plagiarism Checker",
    desc: "Check content originality with detailed similarity scoring, source URL detection, and downloadable reports.",
    color: "from-emerald-500 to-green-600",
  },
]

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: [
      "100 AI credits",
      "Keyword Intelligence (10/day)",
      "Post Generator (5/day)",
      "Plagiarism Checker (5/day)",
      "3 projects",
    ],
    cta: "Get Started",
    href: "/signup",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    features: [
      "2,000 AI credits",
      "All 3 premium workflows",
      "Unlimited checks",
      "Priority support",
      "10 projects",
      "Export to CSV & JSON",
    ],
    cta: "Start Pro",
    href: "/signup",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    features: [
      "10,000 AI credits",
      "Team collaboration",
      "Custom AI models",
      "Dedicated support",
      "Unlimited projects",
      "API access",
    ],
    cta: "Contact Sales",
    href: "/contact",
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
    a: "Each workflow usage costs credits. Keyword Intelligence costs 2 credits, Post Generator costs 5 credits, and Plagiarism Checker costs 3 credits. Free users get 100 credits to start.",
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
    a: "Yes. You can upgrade, downgrade, or cancel your subscription at any time. Pro and Enterprise plans are billed monthly with no lock-in contracts.",
  },
]

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Keyword Intelligence", href: "/keyword-intelligence" },
      { label: "Post Generator", href: "/post-generator" },
      { label: "Plagiarism Checker", href: "/plagiarism-checker" },
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
    name: "Keyword Intelligence",
    icon: Search,
    color: "from-violet-500 to-indigo-600",
    lines: [
      { label: "Keyword", value: "AI content writing tools", width: "w-48" },
      { label: "Volume", value: "Analyzing...", width: "w-28" },
      { label: "Difficulty", value: "Calculating...", width: "w-28" },
      { label: "Trend", value: "Loading...", width: "w-32" },
      { label: "SERP Features", value: "Checking results...", width: "w-56" },
    ],
  },
  {
    name: "Post Generator",
    icon: FileText,
    color: "from-blue-500 to-purple-600",
    lines: [
      { label: "Title", value: "Your SEO-Optimized Title", width: "w-full" },
      { label: "Meta", value: "AI-generated meta description...", width: "w-72" },
      { label: "Sections", value: "Generating outline...", width: "w-56" },
      { label: "Word Count", value: "In progress...", width: "w-28" },
      { label: "Read Time", value: "Calculating...", width: "w-28" },
    ],
  },
  {
    name: "Plagiarism Checker",
    icon: Shield,
    color: "from-emerald-500 to-green-600",
    lines: [
      { label: "Status", value: "Scanning...", width: "w-36" },
      { label: "Similarity", value: "Analyzing...", width: "w-32" },
      { label: "Sources Found", value: "Searching...", width: "w-24" },
      { label: "Sentences Checked", value: "In progress...", width: "w-24" },
      { label: "Report", value: "Generating...", width: "w-36" },
    ],
  },
]

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeDemo, setActiveDemo] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActiveDemo((p) => (p + 1) % demos.length), 4000)
    return () => clearInterval(t)
  }, [])

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
            <Link href="/login" className="hidden sm:block">
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
              className="md:hidden glass border-t border-border"
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
                <Link href="/login" onClick={() => setMobileOpen(false)}>
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
              3 Premium AI Workflow Tools
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
            <Link href="/login">
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
              { icon: Globe, label: "Multi-language", desc: "50+ languages supported" },
              { icon: Clock, label: "No Signup Required", desc: "Use instantly as guest" },
              { icon: Award, label: "Free Credits", desc: "100 credits to start" },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="glass-card rounded-xl p-4 text-center">
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
                            <p className="text-xs text-muted">Real-time results preview</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {demo.lines.map((line) => (
                            <div
                              key={line.label}
                              className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                            >
                              <span className="text-xs text-muted w-24 shrink-0">{line.label}</span>
                              <div className={`h-2 rounded-full bg-gradient-to-r ${demo.color} ${line.width}`} />
                              <span className="text-xs text-white/70 ml-auto">{line.value}</span>
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
            <h2 className="text-3xl font-bold">Three Workflows. Infinite Possibilities.</h2>
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
                  className="glass-card rounded-2xl p-6 text-center"
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
            <h2 className="text-3xl font-bold">Content Templates</h2>
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
            <h2 className="text-3xl font-bold">Why Nextill AI</h2>
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
                  <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
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

      {/* PRICING */}
      <motion.section
        id="pricing"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="px-4 pb-20 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-muted mt-2 max-w-xl mx-auto">
              Start for free. Scale when you need more.
            </p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {plans.map((p) => (
              <motion.div key={p.name} variants={staggerItem}>
                <div
                  className={`glass-card rounded-2xl p-6 sm:p-8 relative ${
                    p.popular
                      ? "border-primary/50 ring-1 ring-primary/30"
                      : ""
                  }`}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="default" className="px-4 py-1 text-xs font-semibold">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold">{p.price}</span>
                    <span className="text-muted text-sm ml-1">{p.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {p.features.map((f) => (
                      <li key={f} className="text-sm text-muted flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-primary-light shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={p.href}>
                    <Button
                      variant={p.popular ? "gradient" : "glass"}
                      className="w-full"
                    >
                      {p.cta}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

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
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-muted mt-2">Everything you need to know about Nextill AI.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`glass-card rounded-xl overflow-hidden transition-all duration-300 ${
                  openFaq === i ? "border-primary/30" : ""
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
              <h2 className="text-2xl sm:text-3xl font-bold">Ready to Transform Your Workflow?</h2>
              <p className="text-muted mt-3 max-w-lg mx-auto">
                Join thousands of creators using Nextill AI to work smarter, create faster, and rank higher.
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
