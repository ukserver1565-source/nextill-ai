"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Search, FileText, Shield,
  ChevronRight, Zap, Layers,
  FileType, Activity, Globe,
  TrendingUp, MessageSquare, Award, Edit, Check, Lock
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
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

// All tools — live + coming soon
const allTools = [
  // LIVE WORKFLOWS (always clickable)
  { name: "Domain Intelligence", slug: "domain-overview", icon: Globe, color: "from-violet-500 to-indigo-600", desc: "Full domain analysis with keywords, traffic, competitors, backlinks, and technical SEO.", features: ["Search volume & trends", "Competitor analysis", "Technical SEO audit", "PageSpeed scores"], category: "workflow", live: true },
  { name: "Post Generator", slug: "post-generator", icon: FileText, color: "from-blue-500 to-purple-600", desc: "Generate fully SEO-optimized blog posts with AI — titles, meta, FAQ, and schema included.", features: ["Full article generation", "SEO title & meta", "FAQ section", "Schema markup"], category: "workflow", live: true },
  { name: "Plagiarism Checker", slug: "plagiarism-checker", icon: Shield, color: "from-emerald-500 to-green-600", desc: "Check content originality against billions of web sources with detailed similarity reports.", features: ["Web-wide comparison", "Similarity scoring", "Source URL detection", "Detailed reports"], category: "workflow", live: true },

  // LIVE TOOLS (Gemini API — configured)
  { name: "AI Writer", slug: "ai-writer", icon: FileText, color: "from-sky-500 to-blue-600", desc: "Generate SEO-optimized articles on any topic with AI.", features: ["Custom tone & audience", "Keyword optimization", "Structured output"], category: "content", live: true },
  { name: "AI Humanizer", slug: "ai-humanizer", icon: Edit, color: "from-teal-500 to-emerald-600", desc: "Make AI-generated content sound natural and human-written.", features: ["AI detection bypass", "Natural flow", "Preserve meaning"], category: "content", live: true },
  { name: "Article Rewriter", slug: "article-rewriter", icon: Edit, color: "from-cyan-500 to-teal-600", desc: "Rewrite and rephrase content while keeping the original meaning.", features: ["Paraphrasing", "Tone adjustment", "Plagiarism prevention"], category: "content", live: true },
  { name: "SEO Title Generator", slug: "seo-title-generator", icon: Award, color: "from-amber-500 to-orange-600", desc: "Generate optimized meta titles for better search rankings.", features: ["Keyword inclusion", "Character limit", "CTR optimization"], category: "seo", live: true },
  { name: "Meta Description Generator", slug: "meta-description-generator", icon: FileType, color: "from-rose-500 to-pink-600", desc: "Create compelling meta descriptions that boost click-through rates.", features: ["Engaging copy", "Keyword placement", "Length optimized"], category: "seo", live: true },
  { name: "Content Brief", slug: "content-brief", icon: FileType, color: "from-indigo-500 to-violet-600", desc: "Generate comprehensive content briefs for writers.", features: ["Topic coverage", "Keyword suggestions", "Structure outline"], category: "content", live: true },
  { name: "Topical Map", slug: "topical-map", icon: Layers, color: "from-fuchsia-500 to-purple-600", desc: "Build topical authority maps for your content strategy.", features: ["Topic clusters", "Pillar pages", "Content gaps"], category: "seo", live: true },
  { name: "FAQ Generator", slug: "faq-generator", icon: MessageSquare, color: "from-lime-500 to-green-600", desc: "Generate FAQ sections with schema markup for rich snippets.", features: ["Schema-ready", "Natural questions", "SEO optimized"], category: "seo", live: true },
  { name: "Schema Generator", slug: "schema-generator", icon: Layers, color: "from-orange-500 to-red-600", desc: "Generate JSON-LD structured data for any page.", features: ["Multiple types", "Valid JSON-LD", "Google compliant"], category: "seo", live: true },
  { name: "Grammar Checker", slug: "grammar-checker", icon: Edit, color: "from-green-500 to-emerald-600", desc: "Check and fix grammar, spelling, and punctuation errors.", features: ["Grammar rules", "Style suggestions", "Readability"], category: "content", live: true },
  { name: "Summarizer", slug: "summarizer", icon: FileText, color: "from-blue-500 to-indigo-600", desc: "Condense long articles into key takeaways.", features: ["Key points", "Custom length", "Multiple formats"], category: "content", live: true },
  { name: "Translator", slug: "translator", icon: Globe, color: "from-purple-500 to-violet-600", desc: "Translate content between languages with AI.", features: ["Multi-language", "Context-aware", "Natural output"], category: "content", live: true },
  { name: "Internal Link Generator", slug: "internal-link-generator", icon: Layers, color: "from-cyan-500 to-blue-600", desc: "Suggest internal linking opportunities for your content.", features: ["Anchor text suggestions", "Relevant pages", "SEO boost"], category: "seo", live: true },

  // COMING SOON TOOLS (need API keys)
  { name: "Sitemap Generator", slug: "sitemap-generator", icon: Layers, color: "from-slate-500 to-gray-600", desc: "Generate XML sitemaps for your website.", features: ["Auto-discovery", "Priority settings", "Last-modified dates"], category: "seo", live: true },
  { name: "Robots.txt Generator", slug: "robots-txt-generator", icon: FileType, color: "from-slate-500 to-gray-600", desc: "Create optimized robots.txt files for search engines.", features: ["Crawl directives", "Sitemap reference", "Bot blocking"], category: "seo", live: true },
  { name: "Website Audit", slug: "website-audit", icon: Activity, color: "from-amber-500 to-yellow-600", desc: "Full technical SEO audit with PageSpeed scores and recommendations.", features: ["PageSpeed scores", "Technical SEO", "Performance metrics"], category: "seo", live: true },

  // COMING SOON (need DataForSEO / Copyleaks)
  { name: "Keyword Research", slug: "keyword-research", icon: Search, color: "from-gray-500 to-slate-600", desc: "Research keywords with search volume, difficulty, and CPC data.", features: ["Volume data", "Difficulty scores", "CPC estimates"], category: "research", live: false },
  { name: "Rank Tracker", slug: "rank-tracker", icon: TrendingUp, color: "from-gray-500 to-slate-600", desc: "Track your search engine rankings over time.", features: ["Position tracking", "Historical data", "SERP changes"], category: "research", live: false },
  { name: "Backlink Checker", slug: "backlink-checker", icon: Globe, color: "from-gray-500 to-slate-600", desc: "Analyze your backlink profile and referring domains.", features: ["Backlink count", "Domain authority", "Link quality"], category: "research", live: false },
]

const categories = [
  { id: "workflow", label: "Premium Workflows", desc: "Full AI-powered analysis pipelines" },
  { id: "content", label: "Content Tools", desc: "AI writing, rewriting, and editing" },
  { id: "seo", label: "SEO Tools", desc: "Optimization, schema, and auditing" },
  { id: "research", label: "Research Tools", desc: "Keywords, backlinks, and rankings" },
]

export default function ToolsPage() {
  const [workflowStatuses, setWorkflowStatuses] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch("/api/public/workflow-settings")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const map: Record<string, string> = {}
          data.forEach((w: any) => { map[w.workflow_slug] = w.status || "coming_soon" })
          setWorkflowStatuses(map)
        }
      })
      .catch(() => {})
  }, [])

  const isLive = (tool: typeof allTools[0]) => {
    if (tool.live) return true
    const status = workflowStatuses[tool.slug]
    return status === "published"
  }

  const liveCount = allTools.filter(t => isLive(t)).length
  const totalCount = allTools.length

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
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
              {liveCount} of {totalCount} Tools Live
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">All Tools</h1>
            <p className="text-muted mt-2 text-sm sm:text-base">
              AI-powered SEO and content tools. Live tools are free to try — more coming soon as we add API integrations.
            </p>
          </div>
        </div>
      </motion.section>

      {/* TOOL CATEGORIES */}
      {categories.map((cat) => {
        const catTools = allTools.filter(t => t.category === cat.id)
        if (catTools.length === 0) return null
        return (
          <motion.section
            key={cat.id}
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="px-4 pb-10"
          >
            <div className="max-w-7xl mx-auto">
              <h2 className="text-lg font-bold mb-1">{cat.label}</h2>
              <p className="text-sm text-muted mb-5">{cat.desc}</p>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {catTools.map((tool) => {
                  const Icon = tool.icon
                  const live = isLive(tool)
                  const cardClass = `liquid-glass-card rounded-xl p-5 h-full flex flex-col group transition-all duration-300 ${
                    live
                      ? "hover:border-primary/30 hover:-translate-y-1 cursor-pointer"
                      : "opacity-60 cursor-default border-white/[0.03]"
                  }`
                  const content = (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <Badge variant={live ? "success" : "info"} size="sm" showDot={live}>
                          {live ? "Live" : "Coming Soon"}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-bold group-hover:gradient-primary-text transition-all">{tool.name}</h3>
                      <p className="text-xs text-muted mt-1.5 flex-1 leading-relaxed">{tool.desc}</p>
                      <ul className="mt-3 space-y-1">
                        {tool.features.map((f) => (
                          <li key={f} className="text-[11px] text-muted flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-primary-light shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                        {live ? (
                          <span className="text-[11px] text-primary-light font-medium flex items-center gap-1">
                            Try Free <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Coming Soon
                          </span>
                        )}
                      </div>
                    </>
                  )
                  return (
                    <motion.div key={tool.slug} variants={staggerItem}>
                      {live ? (
                        <Link href={`/${tool.slug}`} className={cardClass}>{content}</Link>
                      ) : (
                        <div className={cardClass}>{content}</div>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>
          </motion.section>
        )
      })}

      <div className="pb-20" />
      <PublicFooter />
    </div>
  )
}
