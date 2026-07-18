"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Search, FileText, Shield,
  ChevronRight, ExternalLink, Zap, Layers,
  FileType, Activity, Globe,
  TrendingUp, MessageSquare, Award, Edit, Check, X as XIcon
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BackButton } from "@/components/shared/back-button"
import { useState, useEffect } from "react"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

const premiumTools = [
  {
    name: "Keyword Intelligence",
    slug: "keyword-intelligence",
    icon: Search,
    color: "from-violet-500 to-indigo-600",
    desc: "Discover high-value keywords with search volume, difficulty scores, trend data, and SERP analysis — all in one intelligent workflow.",
    features: ["Search volume & difficulty", "Trend analysis", "SERP feature breakdown", "Export to CSV"],
    badge: "Live",
    badgeVariant: "success" as const,
  },
  {
    name: "Post Generator",
    slug: "post-generator",
    icon: FileText,
    color: "from-blue-500 to-purple-600",
    desc: "Generate fully SEO-optimized blog posts from a topic. AI writes, formats, and optimizes for search in a single click.",
    features: ["Full article generation", "SEO title & meta", "FAQ section", "Schema markup"],
    badge: "Live",
    badgeVariant: "success" as const,
  },
  {
    name: "Plagiarism Checker",
    slug: "plagiarism-checker",
    icon: Shield,
    color: "from-emerald-500 to-green-600",
    desc: "Check content originality against billions of indexed web pages. Get detailed similarity reports with source URLs.",
    features: ["Web-wide comparison", "Similarity scoring", "Source URL detection", "Detailed reports"],
    badge: "Live",
    badgeVariant: "success" as const,
  },
]

const legacyTools = [
  { name: "AI Detector", icon: Shield, migrated: "Post Generator" },
  { name: "AI Humanizer", icon: Edit, migrated: "Post Generator" },
  { name: "AI Writer", icon: FileText, migrated: "Post Generator" },
  { name: "Article Rewriter", icon: Edit, migrated: "Post Generator" },
  { name: "Backlink Checker", icon: ExternalLink, migrated: "Keyword Intelligence" },
  { name: "Content Brief", icon: FileType, migrated: "Keyword Intelligence" },
  { name: "FAQ Generator", icon: MessageSquare, migrated: "Post Generator" },
  { name: "Grammar Checker", icon: Edit, migrated: "Post Generator" },
  { name: "Internal Link Generator", icon: Layers, migrated: "Post Generator" },
  { name: "Keyword Research", icon: Search, migrated: "Keyword Intelligence" },
  { name: "Meta Description Generator", icon: FileType, migrated: "Post Generator" },
  { name: "Rank Tracker", icon: TrendingUp, migrated: "Keyword Intelligence" },
  { name: "Robots.txt Generator", icon: FileType, migrated: "Post Generator" },
  { name: "Schema Generator", icon: Layers, migrated: "Post Generator" },
  { name: "SEO Title Generator", icon: Award, migrated: "Post Generator" },
  { name: "Sitemap Generator", icon: Layers, migrated: "Post Generator" },
  { name: "Summarizer", icon: FileText, migrated: "Post Generator" },
  { name: "Topical Map", icon: Layers, migrated: "Keyword Intelligence" },
  { name: "Translator", icon: Globe, migrated: "Post Generator" },
  { name: "Website Audit", icon: Activity, migrated: "Keyword Intelligence" },
]

const workflowMapping = {
  "Keyword Intelligence": Search,
  "Post Generator": FileText,
  "Plagiarism Checker": Shield,
}

export default function ToolsPage() {
  const [providerStatus, setProviderStatus] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/public/provider-status")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProviderStatus(data) })
      .catch(() => {})
  }, [])

  const _getProviderStatus = (slug: string) => {
    return providerStatus.find(p => p.slug === slug)
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <PublicHeader />

      {/* HERO */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="px-4 pt-16 pb-12"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <BackButton fallback="/" />
          </div>
          <div className="max-w-2xl">
            <Badge variant="info" className="mb-4 px-3 py-1 text-xs">
              <Zap className="w-3 h-3 mr-1.5" />
              21 Tools Consolidated into 3 Premium Workflows
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">All Tools</h1>
            <p className="text-muted mt-2 text-sm sm:text-base">
              We&apos;ve consolidated 21 legacy tools into 3 powerful AI workflows. Experience the next generation of SEO and content creation.
            </p>
          </div>
        </div>
      </motion.section>

      {/* PREMIUM TOOLS */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="px-4 pb-12"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold mb-6">Premium Workflows</h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {premiumTools.map((tool) => {
              const Icon = tool.icon
              return (
                <motion.div key={tool.slug} variants={staggerItem}>
                  <Link
                    href={`/${tool.slug}`}
                    className="glass-card rounded-2xl p-6 sm:p-8 h-full flex flex-col group hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant={tool.badgeVariant} size="sm" showDot>
                        {tool.badge}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold group-hover:gradient-primary-text transition-all duration-300">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-muted mt-2 flex-1">{tool.desc}</p>
                    <ul className="mt-4 space-y-2">
                      {tool.features.map((f) => (
                        <li key={f} className="text-xs text-muted flex items-center gap-2">
                          <Check className="w-3 h-3 text-primary-light shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-muted">Free to try</span>
                      <span className="inline-flex items-center gap-1 text-sm text-primary-light font-medium group-hover:gap-2 transition-all">
                        Open Tool <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* API STATUS */}
      {providerStatus.length > 0 && (
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="px-4 pb-12"
        >
          <div className="max-w-7xl mx-auto">
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-2">API Provider Status</h2>
              <p className="text-sm text-muted mb-6">Real-time connection status for each AI provider.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {providerStatus.map((provider: any) => (
                  <div key={provider.slug} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${provider.connected && provider.enabled ? "bg-[#22C55E] animate-pulse" : "bg-[#EF4444]"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{provider.name}</p>
                      <p className="text-[10px] text-muted">
                        {provider.connected && provider.enabled ? "Connected" : "Not Connected"}
                      </p>
                    </div>
                    {provider.connected && provider.enabled ? (
                      <Check className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                    ) : (
                      <XIcon className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20">
                <p className="text-xs text-[#F59E0B]">
                  <strong>Note:</strong> Unavailable providers will use the local fallback engine. Configure API keys in the Admin Panel to enable full AI capabilities.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* LEGACY TOOLS MIGRATION */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="px-4 pb-20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold">Legacy Tools</h2>
                <p className="text-sm text-muted mt-1">
                  All 21 previous tools have been migrated into 3 consolidated workflows.
                </p>
              </div>
              <Badge variant="info" size="lg" className="whitespace-nowrap">
                <Check className="w-4 h-4 mr-1.5" />
                Fully Consolidated
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {legacyTools.map((tool) => {
                const Icon = tool.icon
                const MigratedIcon = workflowMapping[tool.migrated as keyof typeof workflowMapping]
                return (
                  <div
                    key={tool.name}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{tool.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-muted">via</span>
                        <MigratedIcon className="w-3 h-3 text-primary-light" />
                        <span className="text-[10px] text-primary-light truncate">{tool.migrated}</span>
                      </div>
                    </div>
                    <Badge variant="success" size="sm" className="shrink-0">
                      Migrated
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* FOOTER */}
      <PublicFooter />
    </div>
  )
}
