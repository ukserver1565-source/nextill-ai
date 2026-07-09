"use client"

import { Suspense, useState, useCallback, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth/AuthProvider"
import {
  Search, Sparkles, ChevronDown, ChevronRight, Copy, Check,
  Download, Save, RefreshCw, FileText, Globe, BarChart3,
  BookOpen, Hash, Eye, PenSquare, Loader2, AlertTriangle,
  Brain, FileSearch, FileEdit, UserCheck, CheckSquare,
  Shield, ExternalLink, Target, Zap, Trello, Type,
  Quote, Layers, Wifi, Clock, Star,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { PostGeneratorResult } from "@/lib/workflows/workflow-types"

const articleTypes = [
  { value: "blog-post", label: "Blog Post" },
  { value: "article", label: "Article" },
  { value: "guide", label: "Guide" },
  { value: "review", label: "Review" },
  { value: "tutorial", label: "Tutorial" },
  { value: "listicle", label: "Listicle" },
  { value: "case-study", label: "Case Study" },
  { value: "news", label: "News" },
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

function PipelineTimeline({ steps, statuses, progress }: {
  steps: typeof pipelineSteps
  statuses: Record<string, "pending" | "running" | "completed" | "failed">
  progress: number
}) {
  return (
    <div className="relative">
      <div className="absolute left-[17px] top-2 bottom-2 w-[1px] bg-white/[0.06]" />
      <div className="space-y-0">
        {steps.map((step, i) => {
          const status = statuses[step.key] || "pending"
          const Icon = step.icon
          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={`relative flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all ${
                status === "running"
                  ? "bg-[#6D5EF5]/10 border border-[#6D5EF5]/20"
                  : status === "completed"
                  ? "bg-[#22C55E]/5 border border-transparent"
                  : status === "failed"
                  ? "bg-[#EF4444]/10 border border-[#EF4444]/20"
                  : "border border-transparent opacity-50"
              }`}
            >
              <div className={`relative z-10 w-[34px] h-[34px] rounded-lg flex items-center justify-center shrink-0 transition-all ${
                status === "running"
                  ? "bg-[#6D5EF5]/20"
                  : status === "completed"
                  ? "bg-[#22C55E]/15"
                  : status === "failed"
                  ? "bg-[#EF4444]/20"
                  : "bg-white/[0.04]"
              }`}>
                {status === "completed" ? (
                  <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                ) : status === "running" ? (
                  <span className="relative flex items-center justify-center w-3.5 h-3.5">
                    <span className="absolute inset-0 rounded-full bg-[#6D5EF5] animate-ping opacity-30" />
                    <span className="relative w-2.5 h-2.5 rounded-full bg-[#6D5EF5]" />
                  </span>
                ) : status === "failed" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
                ) : (
                  <Icon className="w-3.5 h-3.5 text-[#A7B0C0]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium leading-tight ${
                  status === "running"
                    ? "text-white"
                    : status === "completed"
                    ? "text-white"
                    : status === "failed"
                    ? "text-[#EF4444]"
                    : "text-[#A7B0C0]"
                }`}>
                  {step.name}
                </p>
                <p className="text-[10px] text-[#A7B0C0] mt-0.5">
                  {status === "pending" && "Waiting..."}
                  {status === "running" && "Processing..."}
                  {status === "completed" && "Complete"}
                  {status === "failed" && "Failed"}
                </p>
              </div>
              {status === "running" && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#6D5EF5] animate-pulse shrink-0" />
              )}
            </motion.div>
          )
        })}
      </div>
      <div className="mt-3 flex items-center justify-between px-3">
        <span className="text-[10px] text-[#A7B0C0]">Progress</span>
        <span className="text-[10px] text-[#6D5EF5] font-medium">{Math.round((progress / steps.length) * 100)}%</span>
      </div>
      <div className="mt-1.5 mx-3 h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6]"
          initial={{ width: 0 }}
          animate={{ width: `${(progress / steps.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

function ScoreBar({ label, score, color, delay = 0 }: { label: string; score: number; color: string; delay?: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#A7B0C0]">{label}</span>
        <span className="text-xs font-bold text-white">{score}%</span>
      </div>
      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center h-full py-16 px-6"
    >
      <div className="w-20 h-20 rounded-2xl bg-[#6D5EF5]/10 border border-[#6D5EF5]/20 flex items-center justify-center mb-6">
        <Sparkles className="w-9 h-9 text-[#6D5EF5]" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Ready to create content</h3>
      <p className="text-sm text-[#A7B0C0] max-w-md mb-8">
        Fill in your keyword and preferences on the left, then hit generate for a fully SEO-optimized article.
      </p>
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {[
          { icon: Search, label: "SEO Optimized", desc: "Rank higher" },
          { icon: Brain, label: "AI Powered", desc: "Smart content" },
          { icon: Eye, label: "Human Quality", desc: "Natural flow" },
          { icon: Zap, label: "Fast Generation", desc: "Minutes not hours" },
        ].map((item, i) => (
          <div key={i} className="bg-[#151C2E]/60 border border-white/[0.06] rounded-xl p-3 text-left">
            <div className="w-8 h-8 rounded-lg bg-[#6D5EF5]/10 flex items-center justify-center mb-2">
              <item.icon className="w-4 h-4 text-[#6D5EF5]" />
            </div>
            <p className="text-xs font-medium text-white">{item.label}</p>
            <p className="text-[10px] text-[#A7B0C0]">{item.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function Toolbar({ onCopy, onDownloadTxt, onDownloadMd, onSave, onRegenerate, loading, hasResult }: {
  onCopy: () => void
  onDownloadTxt: () => void
  onDownloadMd: () => void
  onSave: () => void
  onRegenerate: () => void
  loading: boolean
  hasResult: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1.5 flex-wrap"
    >
      <button onClick={onCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white hover:border-[#6D5EF5]/30 transition-all">
        <Copy className="w-3 h-3" />
        <span>Copy All</span>
      </button>
      <button onClick={onDownloadTxt} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white hover:border-[#6D5EF5]/30 transition-all">
        <Download className="w-3 h-3" />
        <span>.txt</span>
      </button>
      <button onClick={onDownloadMd} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white hover:border-[#6D5EF5]/30 transition-all">
        <Download className="w-3 h-3" />
        <span>.md</span>
      </button>
      <button onClick={onSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white hover:border-[#6D5EF5]/30 transition-all">
        <Save className="w-3 h-3" />
        <span>Save</span>
      </button>
      <button onClick={onRegenerate} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6D5EF5]/10 border border-[#6D5EF5]/20 text-xs text-[#6D5EF5] hover:bg-[#6D5EF5]/20 transition-all disabled:opacity-50">
        <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
        <span>Regenerate</span>
      </button>
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
    <div className="bg-[#151C2E]/60 border border-white/[0.06] rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors">
        <span className="text-sm text-white font-medium flex-1">{question}</span>
        <ChevronDown className={`w-4 h-4 text-[#A7B0C0] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <p className="text-sm text-[#A7B0C0] leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PostGeneratorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#090B16] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#A7B0C0]" />
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
      ...result.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`),
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

  const handleSave = useCallback(() => {
    if (!result) return
    const saved = JSON.parse(localStorage.getItem("savedPosts") || "[]")
    saved.unshift({ id: Date.now(), title: result.h1, slug: result.slug, date: new Date().toISOString() })
    localStorage.setItem("savedPosts", JSON.stringify(saved.slice(0, 50)))
    setCopied("saved")
    setTimeout(() => setCopied(""), 2000)
  }, [result])

  const handleNewArticle = useCallback(() => {
    setResult(null)
    setKeyword("")
    setPipelineProgress(0)
    setPipelineStepStatuses({})
    setError("")
  }, [])

  const isGenerating = loading
  const hasResult = !!result

  return (
    <div className="min-h-screen bg-[#090B16] text-white">
      <div className="flex h-screen overflow-hidden">
        {/* Left Panel - Fixed Input */}
        <div className="w-1/2 border-r border-white/[0.06] overflow-y-auto">
          <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Post Generator
              </h1>
              <p className="text-sm text-[#A7B0C0] mt-1">
                Generate fully SEO-optimized articles with AI
              </p>
            </div>

            {/* Keyword Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
              <input
                placeholder="Enter your primary keyword..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                className="w-full h-12 pl-10 pr-4 bg-[#151C2E]/80 border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#A7B0C0]/50 focus:outline-none focus:border-[#6D5EF5]/50 focus:ring-1 focus:ring-[#6D5EF5]/20 transition-all"
              />
            </div>

            {/* Article Type */}
            <div className="space-y-2.5">
              <label className="text-xs font-medium text-[#A7B0C0]">Article Type</label>
              <div className="flex flex-wrap gap-1.5">
                {articleTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setArticleType(type.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      articleType === type.value
                        ? "bg-[#6D5EF5]/15 text-[#6D5EF5] border border-[#6D5EF5]/30"
                        : "bg-[#151C2E]/60 text-[#A7B0C0] border border-white/[0.06] hover:border-white/[0.12] hover:text-white"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Word Count */}
            <div className="space-y-2.5">
              <label className="text-xs font-medium text-[#A7B0C0]">Word Count</label>
              <div className="flex gap-1.5">
                {wordCountOptions.map((w) => (
                  <button
                    key={w}
                    onClick={() => setWordCount(w)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      wordCount === w
                        ? "bg-[#6D5EF5]/15 text-[#6D5EF5] border border-[#6D5EF5]/30"
                        : "bg-[#151C2E]/60 text-[#A7B0C0] border border-white/[0.06] hover:border-white/[0.12] hover:text-white"
                    }`}
                  >
                    {w.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div className="space-y-2.5">
              <label className="text-xs font-medium text-[#A7B0C0]">Tone</label>
              <div className="flex flex-wrap gap-1.5">
                {toneOptions.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      tone === t.value
                        ? "bg-[#6D5EF5]/15 text-[#6D5EF5] border border-[#6D5EF5]/30"
                        : "bg-[#151C2E]/60 text-[#A7B0C0] border border-white/[0.06] hover:border-white/[0.12] hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs text-[#A7B0C0] hover:text-white transition-colors"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                Advanced Options
              </button>
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-[#A7B0C0]">Target Audience</label>
                        <input
                          placeholder="e.g. Marketing professionals, small business owners"
                          value={audience}
                          onChange={(e) => setAudience(e.target.value)}
                          className="w-full h-10 px-3 bg-[#151C2E]/80 border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-[#A7B0C0]/50 focus:outline-none focus:border-[#6D5EF5]/50 focus:ring-1 focus:ring-[#6D5EF5]/20 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-[#A7B0C0]">Key Points</label>
                        <textarea
                          placeholder="Key points to cover (one per line)"
                          value={keyPoints}
                          onChange={(e) => setKeyPoints(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 bg-[#151C2E]/80 border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-[#A7B0C0]/50 focus:outline-none focus:border-[#6D5EF5]/50 focus:ring-1 focus:ring-[#6D5EF5]/20 transition-all resize-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-[#A7B0C0]">Brand Voice</label>
                        <input
                          placeholder="e.g. Authoritative yet approachable"
                          value={brandVoice}
                          onChange={(e) => setBrandVoice(e.target.value)}
                          className="w-full h-10 px-3 bg-[#151C2E]/80 border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-[#A7B0C0]/50 focus:outline-none focus:border-[#6D5EF5]/50 focus:ring-1 focus:ring-[#6D5EF5]/20 transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !keyword.trim()}
              className="relative w-full h-12 rounded-xl font-medium text-sm text-white overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6] opacity-100 group-hover:opacity-90 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#6D5EF5] to-[#4CC9F0] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-2">
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Post</>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Right Panel - Output */}
        <div ref={outputRef} className="w-1/2 overflow-y-auto">
          {/* Pipeline Progress */}
          {isGenerating && !hasResult && (
            <div className="p-6 lg:p-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Generation Pipeline</h3>
                  <span className="text-[10px] font-medium text-[#6D5EF5]">Step {pipelineProgress}/{pipelineSteps.length}</span>
                </div>
                <PipelineTimeline steps={pipelineSteps} statuses={pipelineStepStatuses} progress={pipelineProgress} />
              </motion.div>
            </div>
          )}

          {/* Error */}
          {error && !isGenerating && (
            <div className="p-6 lg:p-8">
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#EF4444]">Generation Failed</p>
                  <p className="text-xs text-[#A7B0C0] mt-0.5">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Engine Warning */}
          {hasResult && result.engine === "local" && (
            <div className="p-6 lg:p-8 pb-0">
              <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl p-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <p className="text-xs text-[#F59E0B]">Running on local engine. Add an AI API key for premium output.</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isGenerating && !hasResult && !error && (
            <EmptyState />
          )}

          {/* Results */}
          {hasResult && (
            <div className="p-6 lg:p-8 space-y-4">
              {/* Toolbar */}
              <Toolbar
                onCopy={handleCopyAll}
                onDownloadTxt={() => handleDownload("txt", result.content, result.slug)}
                onDownloadMd={() => handleDownload("md", result.markdownContent, result.slug)}
                onSave={handleSave}
                onRegenerate={handleGenerate}
                loading={isGenerating}
                hasResult
              />

              {/* Tabs */}
              <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                {resultTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab
                        ? "bg-[#151C2E]/80 border border-[#6D5EF5]/30 text-white"
                        : "text-[#A7B0C0] hover:text-white border border-transparent"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">{activeTab}</h2>
                  {activeTab === "Article" && (
                    <div className="flex items-center gap-2 text-[10px] text-[#A7B0C0]">
                      <span>{result.wordCount.toLocaleString()} words</span>
                      <span className="w-1 h-1 rounded-full bg-[#A7B0C0]/30" />
                      <span>{result.readingTime} min read</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  {activeTab === "Article" && (
                    <div className="space-y-4 max-w-none text-sm">
                      <h1 className="text-xl font-bold text-white leading-tight">{result.h1}</h1>
                      <p className="text-[#A7B0C0] leading-relaxed">{result.intro}</p>
                      {result.sections.map((section, i) => (
                        <div key={i} className="space-y-2">
                          <h2 className="text-base font-semibold text-white">{section.h2}</h2>
                          {section.h3.map((h3, j) => (
                            <h3 key={j} className="text-sm font-medium text-white/70">{h3}</h3>
                          ))}
                          <p className="text-[#A7B0C0] leading-relaxed">{section.content}</p>
                        </div>
                      ))}
                      <div className="space-y-2">
                        <h2 className="text-base font-semibold text-white">Conclusion</h2>
                        <p className="text-[#A7B0C0] leading-relaxed">{result.conclusion}</p>
                      </div>
                      {result.cta && (
                        <div className="bg-[#6D5EF5]/10 border border-[#6D5EF5]/20 rounded-xl p-4 text-center">
                          <p className="text-sm font-medium text-[#6D5EF5]">{result.cta}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "SEO" && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-[#A7B0C0] font-medium">SEO Title</label>
                        <div className="flex items-center gap-2 p-3 bg-black/20 border border-white/[0.06] rounded-lg">
                          <p className="text-sm text-white flex-1">{result.seoTitle}</p>
                          <button onClick={() => handleCopy("seo-title", result.seoTitle)}>
                            {copied === "seo-title"
                              ? <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                              : <Copy className="w-3.5 h-3.5 text-[#A7B0C0] hover:text-white transition-colors" />
                            }
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-[#A7B0C0] font-medium">Meta Description</label>
                        <div className="flex items-center gap-2 p-3 bg-black/20 border border-white/[0.06] rounded-lg">
                          <p className="text-sm text-[#A7B0C0] flex-1">{result.metaDescription}</p>
                          <button onClick={() => handleCopy("meta-desc", result.metaDescription)}>
                            {copied === "meta-desc"
                              ? <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                              : <Copy className="w-3.5 h-3.5 text-[#A7B0C0] hover:text-white transition-colors" />
                            }
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-[#A7B0C0] font-medium">Slug</label>
                        <p className="text-sm font-mono text-[#6D5EF5]">/{result.slug}</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-[#A7B0C0] font-medium">Tags</label>
                        <div className="flex flex-wrap gap-1.5">
                          {result.tags.map((tag, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#6D5EF5]/10 text-[#6D5EF5] border border-[#6D5EF5]/20">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-[#A7B0C0] font-medium">Categories</label>
                        <div className="flex flex-wrap gap-1.5">
                          {result.categorySuggestions.map((cat, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-[#A7B0C0] border border-white/[0.06]">{cat}</span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-[#A7B0C0] font-medium">Readability Grade</label>
                        <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">{result.readabilityGrade}</span>
                      </div>
                    </div>
                  )}

                  {activeTab === "FAQ" && (
                    <div className="space-y-2">
                      {result.faqs.length > 0 ? (
                        result.faqs.map((faq, i) => (
                          <FaqItem
                            key={i}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={faqOpenIndex === i}
                            onToggle={() => setFaqOpenIndex(faqOpenIndex === i ? null : i)}
                          />
                        ))
                      ) : (
                        <p className="text-sm text-[#A7B0C0] text-center py-8">No FAQs generated</p>
                      )}
                    </div>
                  )}

                  {activeTab === "Schema" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#A7B0C0] font-medium">JSON-LD Schema</span>
                        <button
                          onClick={() => handleCopy("schema", JSON.stringify(result.schemaJson, null, 2))}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#151C2E]/60 border border-white/[0.06] text-[10px] text-[#A7B0C0] hover:text-white transition-all"
                        >
                          {copied === "schema" ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                          Copy
                        </button>
                      </div>
                      <pre className="w-full max-w-full overflow-x-auto whitespace-pre-wrap break-all text-xs leading-relaxed bg-black/30 border border-white/[0.06] rounded-lg p-4 font-mono text-[#A7B0C0]" style={{ maxHeight: "400px" }}>
                        {JSON.stringify(result.schemaJson, null, 2)}
                      </pre>
                    </div>
                  )}

                  {activeTab === "Scores" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ScoreBar label="SEO Score" score={result.seoScore} color="#22C55E" delay={0} />
                        <ScoreBar label="Readability" score={result.humanScore} color="#3B82F6" delay={0.1} />
                        <ScoreBar label="AI Detection" score={result.aiScore} color="#F59E0B" delay={0.2} />
                        <ScoreBar label="Originality" score={100 - result.plagiarismRisk} color="#8B5CF6" delay={0.3} />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: "SEO Score", score: result.seoScore, color: "#22C55E" },
                          { label: "Readability", score: result.humanScore, color: "#3B82F6" },
                          { label: "AI Detection", score: result.aiScore, color: "#F59E0B" },
                          { label: "Tone Match", score: Math.min(100, Math.round((result.humanScore + result.seoScore) / 2)), color: "#8B5CF6" },
                        ].map((item, i) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="bg-[#151C2E]/60 border border-white/[0.06] rounded-xl p-4 text-center"
                          >
                            <div className="text-2xl font-bold text-white mb-1">{item.score}%</div>
                            <div className="text-[10px] text-[#A7B0C0]">{item.label}</div>
                            <div className="mt-2 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${item.color}66, ${item.color})` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${item.score}%` }}
                                transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {/* bottom padding */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  )
}
