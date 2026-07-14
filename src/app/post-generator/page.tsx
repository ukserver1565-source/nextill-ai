"use client"

import { Suspense, useState, useCallback, useEffect, useRef, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth/AuthProvider"
import {
  Search, Sparkles, ChevronDown, Copy, Check,
  Download, Save, RefreshCw, FileText, Globe, BarChart3,
  BookOpen, PenSquare, Loader2, AlertTriangle,
  Brain, FileSearch, FileEdit, UserCheck, CheckSquare,
  Shield, ExternalLink, Target, Zap, Trello, Type,
  Quote, Layers, Star, Share2, Menu,
  Settings2, SlidersHorizontal, X, Clock,
  Hash, Eye, Wifi,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { PostGeneratorResult } from "@/lib/workflows/workflow-types"

const articleTypes = [
  { value: "blog-post", label: "Blog Post", icon: FileText },
  { value: "article", label: "Article", icon: FileEdit },
  { value: "guide", label: "Guide", icon: BookOpen },
  { value: "review", label: "Review", icon: Star },
  { value: "tutorial", label: "Tutorial", icon: Target },
  { value: "listicle", label: "Listicle", icon: Menu },
  { value: "case-study", label: "Case Study", icon: BarChart3 },
  { value: "news", label: "News", icon: Globe },
]

const wordCountOptions = [1000, 1500, 2000, 3000, 5000]

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "conversational", label: "Conversational" },
  { value: "academic", label: "Academic" },
  { value: "creative", label: "Creative" },
  { value: "persuasive", label: "Persuasive" },
]

const pipelineSteps = [
  { key: "keyword_analysis", icon: Search, name: "Keyword Analysis" },
  { key: "seo_outline", icon: Trello, name: "SEO Outline" },
  { key: "ai_writer", icon: PenSquare, name: "AI Writer" },
  { key: "humanizer", icon: UserCheck, name: "Humanizer" },
  { key: "grammar_check", icon: CheckSquare, name: "Grammar Check" },
  { key: "ai_detector", icon: Shield, name: "AI Detector" },
  { key: "plagiarism_check", icon: FileSearch, name: "Plagiarism Check" },
  { key: "seo_title", icon: Type, name: "SEO Title" },
  { key: "meta_description", icon: FileText, name: "Meta Description" },
  { key: "faq_generator", icon: Quote, name: "FAQ Generator" },
  { key: "schema_generator", icon: Hash, name: "Schema Generator" },
  { key: "internal_links", icon: ExternalLink, name: "Internal Links" },
  { key: "readability_check", icon: BookOpen, name: "Readability Check" },
  { key: "final_optimization", icon: Star, name: "Final Optimization" },
]

type Tab = "Article" | "SEO" | "FAQ" | "Schema" | "Scores"
const resultTabs: Tab[] = ["Article", "SEO", "FAQ", "Schema", "Scores"]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

function PipelineTimeline({ steps, statuses, progress }: {
  steps: typeof pipelineSteps
  statuses: Record<string, "pending" | "running" | "completed" | "failed">
  progress: number
}) {
  const progressPct = progress > 0 ? Math.round((progress / steps.length) * 100) : 0
  return (
    <div className="relative">
      <div className="absolute left-[23px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-transparent" />
      <motion.div className="space-y-1" variants={containerVariants} initial="hidden" animate="visible">
        {steps.map((step, i) => {
          const status = statuses[step.key] || "pending"
          const Icon = step.icon
          return (
            <motion.div
              key={step.key}
              variants={itemVariants}
              className={`relative flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 ${
                status === "running"
                  ? "bg-gradient-to-r from-[#6D5EF5]/12 to-transparent border border-[#6D5EF5]/20 shadow-[0_0_24px_-8px_rgba(109,94,245,0.2)]"
                  : status === "completed"
                  ? "bg-gradient-to-r from-[#22C55E]/6 to-transparent border border-transparent"
                  : status === "failed"
                  ? "bg-gradient-to-r from-[#EF4444]/10 to-transparent border border-[#EF4444]/20"
                  : "border border-transparent opacity-45 hover:opacity-75"
              }`}
            >
              <div className={`relative z-10 w-[44px] h-[44px] rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                status === "running"
                  ? "bg-[#6D5EF5]/20 ring-2 ring-[#6D5EF5]/30 shadow-lg shadow-[#6D5EF5]/10"
                  : status === "completed"
                  ? "bg-[#22C55E]/15 ring-2 ring-[#22C55E]/20"
                  : status === "failed"
                  ? "bg-[#EF4444]/20 ring-2 ring-[#EF4444]/20"
                  : "bg-white/[0.04] ring-1 ring-white/[0.06]"
              }`}>
                {status === "completed" ? (
                  <div className="w-[20px] h-[20px] rounded-full bg-[#22C55E] flex items-center justify-center shadow-lg shadow-[#22C55E]/30">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : status === "running" ? (
                  <span className="relative flex items-center justify-center w-4 h-4">
                    <span className="absolute inset-0 rounded-full bg-[#6D5EF5] animate-ping opacity-50" />
                    <span className="relative w-3 h-3 rounded-full bg-[#6D5EF5]" />
                  </span>
                ) : status === "failed" ? (
                  <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                ) : (
                  <Icon className="w-4 h-4 text-[#5A6577]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-tight ${
                  status === "running" ? "text-white"
                  : status === "completed" ? "text-white/90"
                  : status === "failed" ? "text-[#EF4444]"
                  : "text-[#6B7280]"
                }`}>
                  {step.name}
                </p>
                <p className="text-[11px] text-[#5A6577] mt-0.5">
                  {status === "pending" && "Waiting..."}
                  {status === "running" && "Processing..."}
                  {status === "completed" && "Complete"}
                  {status === "failed" && "Failed"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {status === "running" && (
                  <span className="relative flex w-2.5 h-2.5">
                    <span className="absolute inset-0 rounded-full bg-[#6D5EF5] animate-ping opacity-60" />
                    <span className="relative w-2.5 h-2.5 rounded-full bg-[#6D5EF5]" />
                  </span>
                )}
                {status === "completed" && (
                  <span className="text-[10px] font-medium text-[#22C55E]">Done</span>
                )}
                {status === "pending" && (
                  <span className="text-[10px] text-[#5A6577] font-mono">{String(i + 1).padStart(2, "0")}</span>
                )}
                {status === "failed" && (
                  <span className="text-[10px] text-[#EF4444]">Error</span>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
      <div className="mt-5 flex items-center justify-between px-1">
        <span className="text-xs text-[#5A6577]">Overall Progress</span>
        <span className="text-sm font-bold bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6] bg-clip-text text-transparent">{progressPct}%</span>
      </div>
      <div className="mt-2 h-[6px] bg-white/[0.05] rounded-full overflow-hidden ring-1 ring-white/[0.03] p-[2px] relative">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#6D5EF5] via-[#8B5CF6] to-[#4CC9F0]"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        {progressPct > 0 && progressPct < 100 && (
          <motion.div
            className="absolute top-0 left-0 h-full w-3 rounded-full bg-white/30 blur-sm"
            animate={{ x: [0, `${Math.max(progressPct - 5, 5)}%`] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
    </div>
  )
}

function CircularScore({ label, score, color, size = 80 }: { label: string; score: number; color: string; size?: number }) {
  const r = (size - 14) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference
  const gradientId = `grad-${label.replace(/\s+/g, "")}`
  return (
    <div className="flex flex-col items-center gap-2.5 group">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90 drop-shadow-lg">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-lg font-bold text-white"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
          >
            <AnimatedCounter value={score} />
          </motion.span>
        </div>
      </div>
      <span className="text-[11px] font-medium text-[#5A6577] group-hover:text-[#A7B0C0] transition-colors">{label}</span>
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center h-full py-24 px-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
        className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#6D5EF5]/15 via-[#8B5CF6]/10 to-[#4CC9F0]/10 border border-[#6D5EF5]/20 flex items-center justify-center mb-6 shadow-2xl shadow-[#6D5EF5]/10"
      >
        <Sparkles className="w-12 h-12 text-[#6D5EF5]" />
      </motion.div>
      <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Ready to create content</h3>
      <p className="text-sm text-[#5A6577] max-w-md mb-10 leading-relaxed">
        Enter your keyword and configure preferences, then hit generate for a fully SEO-optimized article.
      </p>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4 w-full max-w-sm"
      >
        {[
          { icon: Search, label: "SEO Optimized", desc: "Rank higher on search" },
          { icon: Brain, label: "AI Powered", desc: "Smart content generation" },
          { icon: Eye, label: "Human Quality", desc: "Natural & engaging" },
          { icon: Zap, label: "Fast Generation", desc: "Results in minutes" },
        ].map((item) => (
          <motion.div
            key={item.label}
            variants={itemVariants}
            className="group bg-gradient-to-b from-[#151C2E]/60 to-[#151C2E]/30 backdrop-blur-sm border border-white/[0.06] rounded-xl p-4 text-left hover:border-[#6D5EF5]/25 hover:bg-[#151C2E]/60 transition-all duration-300 hover:shadow-lg hover:shadow-[#6D5EF5]/5"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6D5EF5]/15 to-[#8B5CF6]/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-[-4deg] transition-all duration-300">
              <item.icon className="w-[18px] h-[18px] text-[#6D5EF5]" />
            </div>
            <p className="text-sm font-semibold text-white mb-0.5">{item.label}</p>
            <p className="text-xs text-[#5A6577]">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

function FloatingToolbar({ onCopy, onDownloadTxt, onDownloadMd, onSave, onShare, onRegenerate, loading, hasResult }: {
  onCopy: () => void
  onDownloadTxt: () => void
  onDownloadMd: () => void
  onSave: () => void
  onShare: () => void
  onRegenerate: () => void
  loading: boolean
  hasResult: boolean
}) {
  const [copied, setCopied] = useState("")
  const handleClick = useCallback((action: string, fn: () => void) => {
    fn()
    setCopied(action)
    setTimeout(() => setCopied(""), 2000)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-30 -mx-8 px-8 py-3 bg-[#090B16]/85 backdrop-blur-xl border-b border-white/[0.04] shadow-lg shadow-black/10"
    >
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => handleClick("copy", onCopy)}
          className="group flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/60 border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white hover:border-[#6D5EF5]/30 hover:bg-[#151C2E] transition-all shadow-sm"
        >
          {copied === "copy" ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied === "copy" ? "Copied!" : "Copy All"}</span>
        </button>
        <div className="w-px h-5 bg-white/[0.06] mx-0.5" />
        <button
          onClick={() => handleClick("txt", onDownloadTxt)}
          className="group flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/60 border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white hover:border-white/[0.12] hover:bg-[#151C2E] transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>.txt</span>
        </button>
        <button
          onClick={() => handleClick("md", onDownloadMd)}
          className="group flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/60 border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white hover:border-white/[0.12] hover:bg-[#151C2E] transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>.md</span>
        </button>
        <div className="w-px h-5 bg-white/[0.06] mx-0.5" />
        <button
          onClick={() => handleClick("save", onSave)}
          className="group flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/60 border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white hover:border-white/[0.12] hover:bg-[#151C2E] transition-all"
        >
          {copied === "save" ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Save className="w-3.5 h-3.5" />}
          <span>{copied === "save" ? "Saved!" : "Save"}</span>
        </button>
        <button
          onClick={() => handleClick("share", onShare)}
          className="group flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/60 border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white hover:border-white/[0.12] hover:bg-[#151C2E] transition-all"
        >
          {copied === "share" ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied === "share" ? "Shared!" : "Share"}</span>
        </button>
        <div className="flex-1" />
        <button
          onClick={onRegenerate}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6] text-xs font-medium text-white hover:opacity-90 transition-all disabled:opacity-40 shadow-lg shadow-[#6D5EF5]/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Regenerate</span>
        </button>
      </div>
    </motion.div>
  )
}

function FaqItem({ question, answer, isOpen, onToggle }: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="group bg-gradient-to-b from-[#151C2E]/60 to-[#151C2E]/30 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.10] hover:shadow-lg hover:shadow-black/10 transition-all duration-300">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-white/[0.015] transition-colors"
      >
        <span className="text-sm text-white font-medium flex-1 leading-relaxed">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${isOpen ? "bg-[#6D5EF5]/15" : "bg-white/[0.04]"}`}
        >
          <ChevronDown className="w-3.5 h-3.5 text-[#5A6577]" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-white/[0.04]">
              <p className="text-sm text-[#A7B0C0] leading-relaxed pt-3">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function InputChipGroup<T extends string>({ options, value, onChange, label }: {
  options: { value: T; label: string; icon?: React.ComponentType<{ className?: string }> }[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div className="space-y-2.5">
      <label className="text-xs font-medium text-[#5A6577] uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = value === opt.value
          const Icon = opt.icon
          return (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.96 }}
              onClick={() => onChange(opt.value)}
              className={`group relative px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-[#6D5EF5]/15 to-[#8B5CF6]/10 text-white border border-[#6D5EF5]/30 shadow-sm"
                  : "bg-gradient-to-b from-[#151C2E]/60 to-[#151C2E]/30 text-[#5A6577] border border-white/[0.06] hover:border-white/[0.12] hover:text-white hover:bg-[#151C2E]/60"
              }`}
            >
              {Icon && <Icon className={`w-3.5 h-3.5 inline mr-1.5 -mt-0.5 ${active ? "text-[#6D5EF5]" : ""}`} />}
              {opt.label}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function ArticleSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-8">
      <div className="space-y-3">
        <div className="h-6 w-3/4 rounded-lg bg-white/[0.04]" />
        <div className="h-3 w-1/2 rounded-lg bg-white/[0.02]" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded-lg bg-white/[0.03]" />
        <div className="h-3 w-5/6 rounded-lg bg-white/[0.03]" />
        <div className="h-3 w-4/6 rounded-lg bg-white/[0.03]" />
      </div>
      <div className="h-4 w-1/4 rounded-lg bg-white/[0.04] mt-6" />
      <div className="space-y-2">
        <div className="h-3 w-[92%] rounded-lg bg-white/[0.03]" />
        <div className="h-3 w-[85%] rounded-lg bg-white/[0.03]" />
        <div className="h-3 w-[78%] rounded-lg bg-white/[0.03]" />
        <div className="h-3 w-[88%] rounded-lg bg-white/[0.03]" />
      </div>
      <div className="h-4 w-1/3 rounded-lg bg-white/[0.04]" />
      <div className="space-y-2">
        <div className="h-3 w-[70%] rounded-lg bg-white/[0.03]" />
        <div className="h-3 w-[82%] rounded-lg bg-white/[0.03]" />
        <div className="h-3 w-[90%] rounded-lg bg-white/[0.03]" />
      </div>
    </div>
  )
}

function PipelineSkeleton() {
  return (
    <div className="bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-36 rounded bg-white/[0.04] animate-pulse" />
            <div className="h-3 w-24 rounded bg-white/[0.02] animate-pulse" />
          </div>
        </div>
        <div className="w-7 h-7 rounded-lg bg-white/[0.04] animate-pulse" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 px-3">
            <div className="w-[44px] h-[44px] rounded-xl bg-white/[0.04] animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-28 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-2 w-16 rounded bg-white/[0.02] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (value === 0) { setDisplay(0); return }
    const duration = 800
    const steps = 30
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) { setDisplay(value); clearInterval(timer); return }
      setDisplay(Math.round(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])
  return <>{display}{suffix}</>
}

function ScoreCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <motion.div
      variants={itemVariants}
                  className="group bg-gradient-to-b from-[#151C2E]/60 to-[#151C2E]/30 backdrop-blur-sm border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.10] hover:shadow-lg hover:shadow-black/10 hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#5A6577] font-medium">{label}</span>
        <span className="text-lg font-bold text-white"><AnimatedCounter value={value} />%</span>
      </div>
      <div className="h-[6px] bg-white/[0.05] rounded-full overflow-hidden ring-1 ring-white/[0.03] p-[1px]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}44, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  )
}

export default function PostGeneratorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#090B16] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B5CF6]/10 border border-[#6D5EF5]/20 flex items-center justify-center shadow-lg shadow-[#6D5EF5]/10">
            <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin" />
          </div>
          <p className="text-sm text-[#5A6577]">Loading Post Generator...</p>
        </motion.div>
      </div>
    }>
      <PostGeneratorContent />
    </Suspense>
  )
}

function PostGeneratorContent() {
  const searchParams = useSearchParams()
  const { profile } = useAuth()
  const prefillKeyword = searchParams.get("keyword") || ""

  const [keyword, setKeyword] = useState(prefillKeyword)
  const [articleType, setArticleType] = useState("blog-post")
  const [wordCount, setWordCount] = useState(1500)
  const [tone, setTone] = useState("professional")
  const [audience, setAudience] = useState("General audience")
  const [keyPoints, setKeyPoints] = useState("")
  const [brandVoice, setBrandVoice] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PostGeneratorResult | null>(null)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<Tab>("Article")
  const [pipelineProgress, setPipelineProgress] = useState(0)
  const [pipelineStepStatuses, setPipelineStepStatuses] = useState<Record<string, "pending" | "running" | "completed" | "failed">>({})
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null)
  const [copied, setCopied] = useState("")
  const [saveError, setSaveError] = useState("")
  const [showPipeline, setShowPipeline] = useState(true)
  const abortRef = useRef<AbortController | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefillKeyword) setKeyword(prefillKeyword)
  }, [prefillKeyword])

  useEffect(() => {
    if (result && outputRef.current) {
      outputRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [result, activeTab])

  const handleGenerate = useCallback(async () => {
    if (!keyword.trim()) return
    setLoading(true)
    setError("")
    setResult(null)
    setPipelineProgress(0)
    setShowPipeline(true)
    const initialStatuses: Record<string, "pending" | "running" | "completed" | "failed"> = {}
    pipelineSteps.forEach((s) => { initialStatuses[s.key] = "pending" })
    setPipelineStepStatuses(initialStatuses)

    const statuses = { ...initialStatuses }

    try {
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      const res = await fetch("/api/workflows/post-generator/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryKeyword: keyword.trim(),
          articleType,
          wordCount,
          tone,
          audience,
          keyPoints: keyPoints || undefined,
          brandVoice: brandVoice || undefined,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        setError(errData.error || "Request failed")
        setLoading(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) { setError("No stream"); setLoading(false); return }
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "))

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.status === "running" && data.step !== "complete") {
              const stepIdx = pipelineSteps.findIndex((s) => s.key === data.step)
              if (stepIdx >= 0) {
                statuses[data.step] = "running"
                if (stepIdx > 0) statuses[pipelineSteps[stepIdx - 1].key] = "completed"
                setPipelineStepStatuses({ ...statuses })
                setPipelineProgress(data.progress ?? stepIdx + 1)
              }
            }
            if (data.status === "completed" && data.data) {
              pipelineSteps.forEach((s) => { statuses[s.key] = "completed" })
              setPipelineStepStatuses({ ...statuses })
              setPipelineProgress(pipelineSteps.length)
              setResult(data.data as PostGeneratorResult)
              setShowPipeline(false)
            }
            if (data.status === "failed") {
              const currentStep = pipelineSteps.find((s) => statuses[s.key] === "running")
              if (currentStep) statuses[currentStep.key] = "failed"
              setPipelineStepStatuses({ ...statuses })
              setError(data.error || "Generation failed")
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [keyword, articleType, wordCount, tone, audience, keyPoints, brandVoice])

  const handleCopy = useCallback((type: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(""), 2000)
  }, [])

  const handleCopyAll = useCallback(() => {
    if (!result) return
    const all = [
      result.content,
      "",
      "--- SEO ---",
      `Title: ${result.seoTitle}`,
      `Meta: ${result.metaDescription}`,
      `Slug: ${result.slug}`,
      "",
      "--- FAQ ---",
      ...(result.faqs || []).map((f) => `Q: ${f.question}\nA: ${f.answer}`),
      "",
      "--- Schema ---",
      JSON.stringify(result.schemaJson, null, 2),
    ].join("\n")
    handleCopy("all", all)
  }, [result, handleCopy])

  const handleDownload = useCallback((ext: string, content: string, filename: string) => {
    const blob = new Blob([content], { type: ext === "md" ? "text/markdown" : "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleSave = useCallback(async () => {
    if (!result) return
      setSaveError("")
      let saved = []
      try { saved = JSON.parse(localStorage.getItem("savedPosts") || "[]") } catch { saved = [] }
    const entry = { id: Date.now(), title: result.h1, slug: result.slug, date: new Date().toISOString() }
    saved.unshift(entry)
    localStorage.setItem("savedPosts", JSON.stringify(saved.slice(0, 50)))
    try {
      await fetch("/api/user/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.h1,
          content: result.content,
          tool_slug: "post-generator",
        }),
      })
    } catch (e) { setSaveError("Failed to save document. Please try again.") }
    setCopied("saved")
    setTimeout(() => setCopied(""), 2000)
  }, [result])

  const handleShare = useCallback(() => {
    if (!result) return
    if (navigator.share) {
      navigator.share({ title: result.seoTitle, text: result.metaDescription }).catch(() => {})
    } else {
      navigator.clipboard.writeText(`${result.seoTitle}\n\n${result.metaDescription}`)
      setCopied("share")
      setTimeout(() => setCopied(""), 2000)
    }
  }, [result])

  const handleNewArticle = useCallback(() => {
    setResult(null)
    setKeyword("")
    setPipelineProgress(0)
    setPipelineStepStatuses({})
    setError("")
    setShowPipeline(false)
  }, [])

  const isGenerating = loading
  const hasResult = !!result

  const scoreData = useMemo(() => result ? [
    { label: "SEO Score", score: result.seoScore, color: "#22C55E" },
    { label: "Readability", score: result.humanScore, color: "#3B82F6" },
    { label: "AI Detection", score: result.aiScore, color: "#F59E0B" },
    { label: "Originality", score: Math.max(0, 100 - result.plagiarismRisk), color: "#8B5CF6" },
  ] : [], [result])

  return (
    <div className="min-h-screen bg-[#090B16] text-white">
      <div className="flex h-screen overflow-hidden">
        {/* Left Panel */}
        <div className="w-[440px] min-w-[440px] border-r border-white/[0.06] overflow-y-auto bg-gradient-to-b from-[#090B16] via-[#0A0C1A] to-[#090B16]">
          <div className="p-8 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="pb-4 border-b border-white/[0.04]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] flex items-center justify-center shadow-xl shadow-[#6D5EF5]/25">
                  <PenSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white">Post Generator</h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    <p className="text-xs text-[#5A6577]">AI-powered SEO content</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Keyword Input */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-2"
            >
              <label className="text-xs font-medium text-[#5A6577] uppercase tracking-wider">Primary Keyword</label>
              <div className="relative group">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-[#6D5EF5]/0 via-[#6D5EF5]/0 to-[#6D5EF5]/0 group-focus-within:from-[#6D5EF5]/30 group-focus-within:via-[#8B5CF6]/20 group-focus-within:to-[#6D5EF5]/30 opacity-0 group-focus-within:opacity-100 transition-all duration-500 blur-sm" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6577] group-focus-within:text-[#6D5EF5] transition-colors duration-300 z-10" />
                <input
                  placeholder="Enter your primary keyword..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  className="relative w-full h-12 pl-11 pr-4 bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/60 backdrop-blur-sm border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#5A6577]/40 focus:outline-none focus:border-[#6D5EF5]/40 focus:ring-2 focus:ring-[#6D5EF5]/12 transition-all group-hover:border-white/[0.10]"
                />
                {keyword && (
                  <button
                    onClick={() => setKeyword("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-colors"
                  >
                    <X className="w-3 h-3 text-[#5A6577]" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Article Type */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-b from-[#151C2E]/40 to-[#151C2E]/20 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 shadow-sm"
            >
              <InputChipGroup
                label="Article Type"
                options={articleTypes}
                value={articleType}
                onChange={setArticleType}
              />
            </motion.div>

            {/* Word Count + Tone */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-gradient-to-b from-[#151C2E]/40 to-[#151C2E]/20 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 space-y-3 shadow-sm">
                <label className="text-xs font-medium text-[#5A6577] uppercase tracking-wider">Word Count</label>
                <div className="flex flex-col gap-1.5">
                  {wordCountOptions.map((w) => (
                    <motion.button
                      key={w}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setWordCount(w)}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        wordCount === w
                          ? "bg-gradient-to-r from-[#6D5EF5]/15 to-[#8B5CF6]/10 text-white border border-[#6D5EF5]/30 shadow-sm"
                          : "bg-gradient-to-b from-[#151C2E]/60 to-[#151C2E]/30 text-[#5A6577] border border-transparent hover:border-white/[0.08] hover:text-white"
                      }`}
                    >
                      {w.toLocaleString()}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-b from-[#151C2E]/40 to-[#151C2E]/20 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 shadow-sm">
                <InputChipGroup
                  label="Tone"
                  options={toneOptions}
                  value={tone}
                  onChange={setTone}
                />
              </div>
            </motion.div>

            {/* Advanced Options */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-b from-[#151C2E]/40 to-[#151C2E]/20 backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between gap-2 px-5 py-4 text-xs font-medium text-[#5A6577] hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </div>
                  Advanced Options
                </div>
                <motion.div
                  animate={{ rotate: showAdvanced ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.div>
              </button>
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4 border-t border-white/[0.04] pt-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#5A6577]">Target Audience</label>
                        <input
                          placeholder="e.g. Marketing professionals, small business owners"
                          value={audience}
                          onChange={(e) => setAudience(e.target.value)}
                          className="w-full h-10 px-3.5 bg-[#090B16]/60 border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-[#5A6577]/40 focus:outline-none focus:border-[#6D5EF5]/40 focus:ring-1 focus:ring-[#6D5EF5]/10 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#5A6577]">Key Points (one per line)</label>
                        <textarea
                          placeholder="Key points to cover..."
                          value={keyPoints}
                          onChange={(e) => setKeyPoints(e.target.value)}
                          rows={3}
                          className="w-full px-3.5 py-2 bg-[#090B16]/60 border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-[#5A6577]/40 focus:outline-none focus:border-[#6D5EF5]/40 focus:ring-1 focus:ring-[#6D5EF5]/10 transition-all resize-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#5A6577]">Brand Voice</label>
                        <input
                          placeholder="e.g. Authoritative yet approachable"
                          value={brandVoice}
                          onChange={(e) => setBrandVoice(e.target.value)}
                          className="w-full h-10 px-3.5 bg-[#090B16]/60 border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-[#5A6577]/40 focus:outline-none focus:border-[#6D5EF5]/40 focus:ring-1 focus:ring-[#6D5EF5]/10 transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Generate Button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !keyword.trim()}
                className="relative w-full h-12 rounded-2xl font-medium text-sm text-white overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-[#6D5EF5]/15"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#6D5EF5] to-[#4CC9F0] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                {isGenerating && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#6D5EF5]/20 to-transparent animate-pulse" />
                )}
                <div className="relative flex items-center justify-center gap-2.5">
                  {isGenerating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Generate Post</>
                  )}
                </div>
              </button>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-[10px] text-center text-[#5A6577] mt-2"
              >
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-[9px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-[9px]">Enter</kbd> to generate
              </motion.p>
            </motion.div>

            {/* Result Meta */}
            {hasResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-b from-[#151C2E]/40 to-[#151C2E]/20 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.04]">
                  <span className="text-xs text-[#5A6577]">Status</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#22C55E]">
                    <span className="relative flex w-2 h-2">
                      <span className="absolute inset-0 rounded-full bg-[#22C55E] animate-ping opacity-40" />
                      <span className="relative w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                    </span>
                    Generated
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5A6577]">Words</span>
                    <span className="text-sm font-semibold text-white">{(result.wordCount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5A6577]">Reading Time</span>
                    <span className="text-sm font-semibold text-white">{result.readingTime} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5A6577]">SEO Score</span>
                    <span className="text-sm font-semibold text-[#22C55E]">{result.seoScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5A6577]">Engine</span>
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#6D5EF5]/10 text-[#6D5EF5] border border-[#6D5EF5]/20">{result.engine}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* New Article */}
            {hasResult && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleNewArticle}
                className="w-full h-11 rounded-2xl border border-dashed border-white/[0.08] text-xs text-[#5A6577] hover:text-white hover:border-white/[0.15] hover:bg-white/[0.02] transition-all"
              >
                + New Article
              </motion.button>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div ref={outputRef} className="flex-1 overflow-y-auto bg-gradient-to-b from-[#090B16] via-[#0A0C1A] to-[#090B16]">
          {/* Pipeline Progress */}
          {isGenerating && !hasResult && (
            <div className="p-8 max-w-2xl mx-auto">
              <AnimatePresence mode="wait">
                {showPipeline ? (
                  <motion.div
                    key="pipeline"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 shadow-xl shadow-black/20"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B5CF6]/10 border border-[#6D5EF5]/20 flex items-center justify-center">
                          <Zap className="w-4.5 h-4.5 text-[#6D5EF5]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">Generation Pipeline</h3>
                          <p className="text-[11px] text-[#5A6577]">Processing your content through 14 stages</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPipeline(false)}
                        className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] hover:border-white/[0.10] transition-all"
                      >
                        <X className="w-3.5 h-3.5 text-[#5A6577]" />
                      </button>
                    </div>
                    <PipelineTimeline steps={pipelineSteps} statuses={pipelineStepStatuses} progress={pipelineProgress} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ArticleSkeleton />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Pipeline collapse skeleton */}
          {isGenerating && !showPipeline && (
            <div className="p-8 max-w-2xl mx-auto">
              <PipelineSkeleton />
            </div>
          )}

          {/* Error */}
          {error && !isGenerating && (
            <div className="p-8 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-b from-[#EF4444]/8 to-transparent border border-[#EF4444]/20 rounded-2xl p-5 flex items-start gap-3 shadow-lg shadow-[#EF4444]/5"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EF4444]/15 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#EF4444]">Generation Failed</p>
                  <p className="text-xs text-[#A7B0C0] mt-1 leading-relaxed">{error}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleGenerate}
                      className="px-4 py-1.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-xs font-medium text-[#EF4444] hover:bg-[#EF4444]/20 transition-all"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleNewArticle}
                      className="px-4 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-[#A7B0C0] hover:text-white hover:bg-white/[0.08] transition-all"
                    >
                      New Article
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Engine Warning */}
          {hasResult && result.engine === "local" && (
            <div className="p-8 pb-0 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-b from-[#F59E0B]/8 to-transparent border border-[#F59E0B]/20 rounded-xl p-3.5 flex items-center gap-2.5 shadow-sm"
              >
                <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <p className="text-xs text-[#F59E0B]">Running on local engine. Add an AI API key for premium output.</p>
              </motion.div>
            </div>
          )}

          {/* Empty State */}
          {!isGenerating && !hasResult && !error && (
            <EmptyState />
          )}

          {/* Results */}
          {hasResult && (
            <div className="space-y-0 max-w-2xl mx-auto">
              {/* Floating Toolbar */}
              <FloatingToolbar
                onCopy={handleCopyAll}
                onDownloadTxt={() => handleDownload("txt", result.content, result.slug)}
                onDownloadMd={() => handleDownload("md", result.markdownContent, result.slug)}
                onSave={handleSave}
                onShare={handleShare}
                onRegenerate={handleGenerate}
                loading={isGenerating}
                hasResult
              />

              {saveError && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="mx-8 mt-3 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{saveError}</span>
                  <button onClick={() => setSaveError("")} className="ml-auto shrink-0">
                    <X className="w-3.5 h-3.5 hover:opacity-70 transition-opacity" />
                  </button>
                </motion.div>
              )}

              <div className="p-8 space-y-6">
                {/* Tabs */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-1 overflow-x-auto no-scrollbar pb-1 border-b border-white/[0.04]"
                >
                  {resultTabs.map((tab) => {
                    const tabIcons: Record<Tab, React.ComponentType<{ className?: string }>> = {
                      Article: FileText, SEO: BarChart3, FAQ: Quote, Schema: Hash, Scores: Star,
                    }
                    const TabIcon = tabIcons[tab]
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 relative ${
                          activeTab === tab
                            ? "text-white"
                            : "text-[#5A6577] hover:text-white"
                        }`}
                      >
                        <TabIcon className="w-3.5 h-3.5" />
                        {tab}
                        {activeTab === tab && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/60 border border-white/[0.06] rounded-lg -z-10 shadow-sm"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </button>
                    )
                  })}
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="bg-gradient-to-b from-[#151C2E]/60 to-[#151C2E]/30 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl shadow-black/10"
                  >
                    <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between bg-[#0A0C1A]/30">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activeTab === "Article" ? "bg-[#6D5EF5]/15" :
                          activeTab === "SEO" ? "bg-[#22C55E]/15" :
                          activeTab === "FAQ" ? "bg-[#3B82F6]/15" :
                          activeTab === "Schema" ? "bg-[#F59E0B]/15" :
                          "bg-[#8B5CF6]/15"
                        }`}>
                          {activeTab === "Article" && <FileText className="w-4 h-4 text-[#6D5EF5]" />}
                          {activeTab === "SEO" && <BarChart3 className="w-4 h-4 text-[#22C55E]" />}
                          {activeTab === "FAQ" && <Quote className="w-4 h-4 text-[#3B82F6]" />}
                          {activeTab === "Schema" && <Hash className="w-4 h-4 text-[#F59E0B]" />}
                          {activeTab === "Scores" && <Star className="w-4 h-4 text-[#8B5CF6]" />}
                        </div>
                        <h2 className="text-sm font-semibold text-white">{activeTab}</h2>
                      </div>
                      {activeTab === "Article" && (
                        <div className="flex items-center gap-2 text-[11px] text-[#5A6577] bg-[#090B16]/40 border border-white/[0.04] rounded-lg px-3 py-1.5">
                          <FileText className="w-3 h-3" />
                          <span>{(result.wordCount || 0).toLocaleString()} words</span>
                          <span className="w-1 h-1 rounded-full bg-white/[0.12]" />
                          <Clock className="w-3 h-3" />
                          <span>{result.readingTime} min read</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      {activeTab === "Article" && (
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="space-y-6 max-w-none"
                        >
                          <motion.div variants={itemVariants} className="pb-5 border-b border-white/[0.04]">
                            <h1 className="text-2xl font-bold text-white leading-tight tracking-tight">{result.h1}</h1>
                          </motion.div>
                          <motion.div variants={itemVariants} className="relative">
                            <div className="absolute -left-3 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#6D5EF5]/40 to-transparent rounded-full" />
                            <p className="text-sm text-[#A7B0C0] leading-[1.85] pl-3 italic">{result.intro}</p>
                          </motion.div>
                          {(result.sections || []).map((section, i) => (
                            <motion.div key={i} variants={itemVariants} className="space-y-4 pt-1">
                              <div className="flex items-center gap-3">
                                <div className="w-1 h-6 rounded-full bg-[#6D5EF5]/50" />
                                <h2 className="text-lg font-bold text-white leading-snug tracking-tight">{section.h2}</h2>
                              </div>
                              {section.h3.length > 0 && (
                                <div className="space-y-2 pl-5 border-l-2 border-[#6D5EF5]/15">
                                  {section.h3.map((h3, j) => (
                                    <div key={j} className="flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#6D5EF5]/30 mt-[7px] shrink-0" />
                                      <h3 className="text-sm font-semibold text-white/80">{h3}</h3>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <p className="text-sm text-[#A7B0C0] leading-[1.85]">{section.content}</p>
                            </motion.div>
                          ))}
                          <motion.div variants={itemVariants} className="pt-5 border-t border-white/[0.04]">
                            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                              Conclusion
                            </h2>
                            <p className="text-sm text-[#A7B0C0] leading-[1.85]">{result.conclusion}</p>
                          </motion.div>
                          {result.cta && (
                            <motion.div variants={itemVariants}>
                              <div className="bg-gradient-to-r from-[#6D5EF5]/10 via-[#8B5CF6]/10 to-[#4CC9F0]/10 border border-[#6D5EF5]/20 rounded-2xl p-6 text-center shadow-lg shadow-[#6D5EF5]/5">
                                <p className="text-base font-bold bg-gradient-to-r from-[#6D5EF5] via-[#8B5CF6] to-[#4CC9F0] bg-clip-text text-transparent">{result.cta}</p>
                              </div>
                            </motion.div>
                          )}
                          {(result.internalLinks || []).length > 0 && (
                            <motion.div variants={itemVariants} className="bg-gradient-to-b from-[#151C2E]/60 to-[#151C2E]/30 border border-white/[0.06] rounded-2xl p-5 shadow-sm">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-[#6D5EF5]/10 flex items-center justify-center">
                                  <ExternalLink className="w-3.5 h-3.5 text-[#6D5EF5]" />
                                </div>
                                <h3 className="text-xs font-semibold text-[#5A6577] uppercase tracking-wider">Internal Links</h3>
                              </div>
                              <div className="space-y-2.5">
                                {(result.internalLinks || []).map((link, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-3 text-sm p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-[#6D5EF5] shrink-0" />
                                    <span className="text-[#A7B0C0]">{link.text}</span>
                                    <span className="text-[#5A6577]">→</span>
                                    <span className="text-[#6D5EF5] font-mono text-xs">/{link.url}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}

                      {activeTab === "SEO" && (
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="space-y-5"
                        >
                          {[
                            { label: "SEO Title", value: result.seoTitle, key: "seo-title", icon: Type },
                            { label: "Meta Description", value: result.metaDescription, key: "meta-desc", icon: FileText },
                          ].map((item) => (
                            <motion.div key={item.key} variants={itemVariants} className="space-y-1.5">
                              <div className="flex items-center gap-2 mb-1">
                                <item.icon className="w-3.5 h-3.5 text-[#22C55E]" />
                                <label className="text-xs font-medium text-[#5A6577] uppercase tracking-wider">{item.label}</label>
                              </div>
                              <div className="group flex items-center gap-2 p-4 bg-gradient-to-b from-[#090B16]/60 to-[#090B16]/40 border border-white/[0.06] rounded-xl hover:border-[#6D5EF5]/20 hover:shadow-lg hover:shadow-black/10 transition-all">
                                <p className="text-sm text-[#A7B0C0] flex-1 leading-relaxed">{item.value}</p>
                                <button
                                  onClick={() => handleCopy(item.key, item.value)}
                                  className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#6D5EF5]/10 hover:border-[#6D5EF5]/30"
                                >
                                  {copied === item.key
                                    ? <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                                    : <Copy className="w-3.5 h-3.5 text-[#5A6577]" />
                                  }
                                </button>
                              </div>
                            </motion.div>
                          ))}
                          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-[#5A6577] uppercase tracking-wider">Slug</label>
                              <div className="p-3.5 bg-gradient-to-b from-[#090B16]/60 to-[#090B16]/40 border border-white/[0.06] rounded-xl">
                                <p className="text-sm font-mono text-[#6D5EF5]">/{result.slug}</p>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-[#5A6577] uppercase tracking-wider">Readability</label>
                              <div className="p-3.5 bg-gradient-to-b from-[#090B16]/60 to-[#090B16]/40 border border-white/[0.06] rounded-xl">
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 shadow-sm">
                                  <Check className="w-3 h-3" />
                                  {result.readabilityGrade}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                          <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-xs font-medium text-[#5A6577] uppercase tracking-wider">Tags</label>
                            <div className="flex flex-wrap gap-2">
                              {(result.tags || []).map((tag, i) => (
                                <motion.span
                                  key={i}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: i * 0.03 }}
                                  className="text-[11px] px-3 py-1.5 rounded-full bg-[#6D5EF5]/8 text-[#6D5EF5] border border-[#6D5EF5]/15 hover:bg-[#6D5EF5]/12 transition-colors"
                                >
                                  {tag}
                                </motion.span>
                              ))}
                            </div>
                          </motion.div>
                          <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-xs font-medium text-[#5A6577] uppercase tracking-wider">Categories</label>
                            <div className="flex flex-wrap gap-2">
                              {(result.categorySuggestions || []).map((cat, i) => (
                                <motion.span
                                  key={i}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: i * 0.03 }}
                                  className="text-[11px] px-3 py-1.5 rounded-full bg-white/[0.04] text-[#A7B0C0] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
                                >
                                  {cat}
                                </motion.span>
                              ))}
                            </div>
                          </motion.div>
                        </motion.div>
                      )}

                      {activeTab === "FAQ" && (
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="space-y-2"
                        >
                          {(result.faqs || []).length > 0 ? (
                            (result.faqs || []).map((faq, i) => (
                              <motion.div key={i} variants={itemVariants}>
                                <FaqItem
                                  question={faq.question}
                                  answer={faq.answer}
                                  isOpen={faqOpenIndex === i}
                                  onToggle={() => setFaqOpenIndex(faqOpenIndex === i ? null : i)}
                                />
                              </motion.div>
                            ))
                          ) : (
                            <motion.div variants={itemVariants} className="text-center py-12">
                              <div className="w-14 h-14 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center mx-auto mb-3">
                                <Quote className="w-6 h-6 text-[#3B82F6]" />
                              </div>
                              <p className="text-sm text-[#5A6577]">No FAQs generated</p>
                            </motion.div>
                          )}
                        </motion.div>
                      )}

                      {activeTab === "Schema" && (
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="space-y-3"
                        >
                          <motion.div variants={itemVariants} className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4 text-[#F59E0B]" />
                              <span className="text-xs font-medium text-[#5A6577] uppercase tracking-wider">JSON-LD Schema</span>
                            </div>
                            <button
                              onClick={() => handleCopy("schema", JSON.stringify(result.schemaJson, null, 2))}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-b from-[#151C2E]/60 to-[#151C2E]/30 border border-white/[0.06] text-[10px] text-[#A7B0C0] hover:text-white hover:border-[#6D5EF5]/30 transition-all"
                            >
                              {copied === "schema" ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                              Copy
                            </button>
                          </motion.div>
                          <motion.div variants={itemVariants} className="relative group">
                            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#090B16] to-transparent pointer-events-none z-10 rounded-t-lg" />
                            <pre
                              className="w-full overflow-x-auto whitespace-pre-wrap break-all text-xs leading-relaxed bg-[#090B16]/80 border border-white/[0.06] rounded-xl p-5 font-mono text-[#A7B0C0] scrollbar-thin group-hover:border-[#F59E0B]/20 transition-colors"
                              style={{ maxHeight: "500px" }}
                            >
                              {JSON.stringify(result.schemaJson, null, 2)}
                            </pre>
                            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#090B16] to-transparent pointer-events-none z-10 rounded-b-lg" />
                          </motion.div>
                        </motion.div>
                      )}

                      {activeTab === "Scores" && (
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="space-y-8"
                        >
                          <motion.div variants={itemVariants} className="grid grid-cols-4 gap-6">
                            {scoreData.map((item) => (
                              <CircularScore key={item.label} label={item.label} score={item.score} color={item.color} size={88} />
                            ))}
                          </motion.div>

                          <motion.div variants={itemVariants} className="space-y-3 pt-4 border-t border-white/[0.04]">
                            <h3 className="text-xs font-medium text-[#5A6577] uppercase tracking-wider mb-3">Detailed Scores</h3>
                            {scoreData.map((item) => (
                              <ScoreCard key={item.label} label={item.label} value={item.score} color={item.color} />
                            ))}
                          </motion.div>

                          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                              { label: "SEO Score", score: result.seoScore, color: "#22C55E", icon: BarChart3 },
                              { label: "Readability", score: result.humanScore, color: "#3B82F6", icon: BookOpen },
                              { label: "AI Detection", score: result.aiScore, color: "#F59E0B", icon: Shield },
                              { label: "Tone Match", score: Math.min(100, Math.round((result.humanScore + result.seoScore) / 2)), color: "#8B5CF6", icon: Star },
                            ].map((item) => {
                              const Icon = item.icon
                              return (
                                <motion.div
                                  key={item.label}
                                  variants={itemVariants}
                                  className="group bg-gradient-to-b from-[#151C2E]/60 to-[#151C2E]/30 backdrop-blur-sm border border-white/[0.06] rounded-xl p-4 text-center hover:border-white/[0.10] hover:shadow-lg hover:shadow-black/10 transition-all duration-300"
                                >
                                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}
                                    style={{ background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)` }}
                                  >
                                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                                  </div>
                                  <div className="text-2xl font-bold text-white mb-1">{item.score}%</div>
                                  <div className="text-[10px] text-[#5A6577] uppercase tracking-wider">{item.label}</div>
                                  <div className="mt-2.5 h-[5px] bg-white/[0.05] rounded-full overflow-hidden ring-1 ring-white/[0.03] p-[1px]">
                                    <motion.div
                                      className="h-full rounded-full"
                                      style={{ background: `linear-gradient(90deg, ${item.color}44, ${item.color})` }}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${item.score}%` }}
                                      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                                    />
                                  </div>
                                </motion.div>
                              )
                            })}
                          </motion.div>

                          <motion.div variants={itemVariants} className="bg-gradient-to-b from-[#151C2E]/40 to-[#151C2E]/20 border border-white/[0.06] rounded-xl p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-white">{(result.wordCount || 0).toLocaleString()}</p>
                                <p className="text-[10px] text-[#5A6577] uppercase tracking-wider mt-1">Word Count</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-white">{result.readingTime} min</p>
                                <p className="text-[10px] text-[#5A6577] uppercase tracking-wider mt-1">Reading Time</p>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="h-16" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
