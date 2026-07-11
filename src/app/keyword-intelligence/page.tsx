"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, TrendingUp, TrendingDown, Minus, Copy, Check, Star,
  ChevronUp, ChevronDown, Download, Heart, History, BarChart3, Globe,
  Hash, Target, MousePointerClick, MessageSquare, Layers, Network,
  Lightbulb, BookOpen, Loader2, Zap, PieChart, Filter, ExternalLink,
  Sparkles, X, Clock, AlertTriangle,
} from "lucide-react"

interface KeywordIntelligenceResult {
  keywords: Array<{ keyword: string; volume: number; difficulty: number; intent: string; cpc: number; trend: string; competition: number }>
  questions: Array<{ question: string; volume: number; difficulty: number; topic: string }>
  longTail: Array<{ keyword: string; volume: number; difficulty: number; parentKeyword: string }>
  related: Array<{ keyword: string; relevance: number; volume: number }>
  lsiNlp: Array<{ term: string; category: string; strength: number }>
  topicalMap: Array<{ topic: string; subtopics: string[]; volume: number }>
  stats: { totalKeywords: number; avgDifficulty: number; totalVolume: number; topPosition: string }
  engine: string
}

function getDifficultyBarColor(d: number) {
  if (d <= 30) return "bg-[#22C55E]"
  if (d <= 60) return "bg-[#F59E0B]"
  return "bg-[#EF4444]"
}

function getDifficultyTextColor(d: number) {
  if (d <= 30) return "text-[#22C55E]"
  if (d <= 60) return "text-[#F59E0B]"
  return "text-[#EF4444]"
}

function getIntentBadgeVariant(intent: string) {
  switch (intent) {
    case "informational": return "info"
    case "commercial": return "default"
    case "transactional": return "success"
    case "navigational": return "outline"
    default: return "outline"
  }
}

function getIntentIcon(intent: string) {
  switch (intent) {
    case "informational": return <BookOpen className="w-3 h-3" />
    case "commercial": return <Zap className="w-3 h-3" />
    case "transactional": return <Target className="w-3 h-3" />
    case "navigational": return <MousePointerClick className="w-3 h-3" />
    default: return null
  }
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="w-3.5 h-3.5 text-[#22C55E]" />
  if (trend === "down") return <TrendingDown className="w-3.5 h-3.5 text-[#EF4444]" />
  return <Minus className="w-3.5 h-3.5 text-[#A7B0C0]" />
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
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

function StatCard({ icon: Icon, label, value, sub, trend }: {
  icon: React.ElementType; label: string; value: string; sub?: string; trend?: { dir: "up" | "down"; val: string }
}) {
  return (
    <motion.div variants={itemVariants} className="relative group">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#6D5EF5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/40 backdrop-blur-xl border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/10 transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6D5EF5]/15 to-[#8B5CF6]/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-[-4deg] transition-all duration-300">
            <Icon className="w-4 h-4 text-[#6D5EF5]" />
          </div>
          {trend && (
            <span className={cn(
              "flex items-center gap-1 text-[11px] font-medium",
              trend.dir === "up" ? "text-[#22C55E]" : "text-[#EF4444]"
            )}>
              {trend.dir === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.val}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-xs text-[#A7B0C0] mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-[#A7B0C0]/60 mt-1.5">{sub}</p>}
      </div>
    </motion.div>
  )
}

function DifficultyBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[88px]">
      <span className={cn("text-xs font-semibold tabular-nums w-7 text-right", getDifficultyTextColor(value))}>
        {value}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden ring-1 ring-white/[0.03] p-[1px]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: value + "%" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn("h-full rounded-full", getDifficultyBarColor(value))}
        />
      </div>
    </div>
  )
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800) }}
      className="p-1.5 rounded-md hover:bg-white/[0.06] transition-colors text-[#A7B0C0] hover:text-white"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

function FavBtn() {
  const [fav, setFav] = useState(false)
  return (
    <button
      onClick={() => setFav(!fav)}
      className={cn("p-1 rounded-md transition-colors", fav ? "text-[#F59E0B]" : "text-[#A7B0C0] hover:text-white")}
    >
      <Star className={cn("w-3.5 h-3.5", fav && "fill-[#F59E0B]")} />
    </button>
  )
}

function GlassCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/40 backdrop-blur-xl border border-white/[0.06] rounded-xl", className)} {...props}>
      {children}
    </div>
  )
}

const countries = [
  { value: "us", label: "United States" }, { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" }, { value: "au", label: "Australia" },
  { value: "de", label: "Germany" }, { value: "fr", label: "France" },
  { value: "es", label: "Spain" }, { value: "it", label: "Italy" },
]

const languages = [
  { value: "en", label: "English" }, { value: "es", label: "Spanish" },
  { value: "fr", label: "French" }, { value: "de", label: "German" },
  { value: "it", label: "Italian" }, { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" }, { value: "zh", label: "Chinese" },
]

export default function KeywordIntelligencePage() {
  const router = useRouter()
  const [keyword, setKeyword] = useState("")
  const [country, setCountry] = useState("us")
  const [language, setLanguage] = useState("en")
  const [analyzed, setAnalyzed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sortKey, setSortKey] = useState<"volume" | "difficulty" | "keyword" | "cpc">("volume")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [tab, setTab] = useState("keywords")
  const [result, setResult] = useState<KeywordIntelligenceResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [favsSaved, setFavsSaved] = useState(false)

  const handleFavorites = useCallback(() => {
    setFavsSaved(true)
    if (result) {
      try {
        const existing = JSON.parse(localStorage.getItem("ki_favorites") || "[]")
        existing.push({ keyword, savedAt: new Date().toISOString() })
        localStorage.setItem("ki_favorites", JSON.stringify(existing))
      } catch {}
    }
    setTimeout(() => setFavsSaved(false), 2000)
  }, [result, keyword])

  const handleAnalyze = useCallback(async () => {
    if (!keyword.trim()) return
    setLoading(true)
    setError(null)
    setAnalyzed(false)
    try {
      const res = await fetch("/api/workflows/keyword-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: keyword, country, language }),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data: KeywordIntelligenceResult = await res.json()
      setResult(data)
      setAnalyzed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch keyword data")
    } finally {
      setLoading(false)
    }
  }, [keyword, country, language])

  const sortedKeywords = useMemo(() => {
    const rows = result?.keywords ? [...result.keywords] : []
    rows.sort((a, b) => {
      const aVal = a[sortKey as keyof typeof a]
      const bVal = b[sortKey as keyof typeof b]
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })
    return rows
  }, [sortKey, sortDir, result?.keywords])

  const handleExport = useCallback(() => {
    if (!result) return
    const exportData = {
      keyword,
      exportedAt: new Date().toISOString(),
      keywords: result.keywords,
      questions: result.questions,
      longTail: result.longTail,
      related: result.related,
      lsiNlp: result.lsiNlp,
      topicalMap: result.topicalMap,
      stats: result.stats,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `keyword-intelligence-${keyword.replace(/\s+/g, "-")}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [result, keyword])

  const handleSort = useCallback((key: typeof sortKey) => {
    setSortKey((prev) => {
      if (prev === key) { setSortDir((d) => (d === "asc" ? "desc" : "asc")); return key }
      setSortDir("desc")
      return key
    })
  }, [])

  const groupedQuestions = useMemo(() => {
    if (!result?.questions) return []
    const map = new Map<string, typeof result.questions>()
    for (const q of result.questions) {
      if (!map.has(q.topic)) map.set(q.topic, [])
      map.get(q.topic)!.push(q)
    }
    return Array.from(map.entries()).map(([topic, items]) => ({ topic, items }))
  }, [result?.questions])

  const groupedLsi = useMemo(() => {
    if (!result?.lsiNlp) return {} as Record<string, string[]>
    const map: Record<string, string[]> = {}
    for (const item of result.lsiNlp) {
      if (!map[item.category]) map[item.category] = []
      map[item.category].push(item.term)
    }
    return map
  }, [result?.lsiNlp])

  function SortIcon({ col }: { col: typeof sortKey }) {
    if (sortKey !== col) return null
    return sortDir === "asc"
      ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-[#6D5EF5]" />
      : <ChevronDown className="inline w-3 h-3 ml-0.5 text-[#6D5EF5]" />
  }

  return (
    <div className="min-h-screen bg-[#090B16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* ── header ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] flex items-center justify-center shadow-xl shadow-[#6D5EF5]/25">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Keyword Intelligence</h1>
              <p className="text-sm text-[#A7B0C0] mt-0.5">Deep keyword research powered by NLP and multi-source SERP data</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hover:bg-white/[0.06]" onClick={handleExport} disabled={!result}>
              <Download className="w-4 h-4 mr-1.5" /> Export
            </Button>
            <div className="relative">
              <Button variant="ghost" size="sm" className="hover:bg-white/[0.06]" onClick={handleFavorites}>
                <Heart className="w-4 h-4 mr-1.5" /> Favorites
              </Button>
              <AnimatePresence>
                {favsSaved && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-[#22C55E] bg-[#151C2E] border border-[#22C55E]/20 px-2.5 py-1 rounded-lg shadow-lg z-20"
                  >
                    Saved to local storage
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button variant="ghost" size="sm" className="hover:bg-white/[0.06]" onClick={() => router.push("/dashboard/history")}>
              <History className="w-4 h-4 mr-1.5" /> History
            </Button>
          </div>
        </motion.div>

        {/* ── search bar ──────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="p-1.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-[#6D5EF5]/0 via-[#6D5EF5]/0 to-[#6D5EF5]/0 focus-within:from-[#6D5EF5]/30 focus-within:via-[#8B5CF6]/20 focus-within:to-[#6D5EF5]/30 opacity-0 focus-within:opacity-100 transition-all duration-500 blur-sm pointer-events-none" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A7B0C0] z-10" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  placeholder="Enter a seed keyword... e.g. SEO tools, content marketing"
                  className="relative pl-12 h-12 bg-transparent border-0 text-base placeholder:text-[#A7B0C0]/60 focus:ring-0 w-full"
                />
                {keyword && (
                  <button onClick={() => setKeyword("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-colors z-10"
                  >
                    <X className="w-3 h-3 text-[#5A6577]" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 px-2 sm:border-l border-white/[0.06]">
                <Select value={country} onChange={setCountry} options={countries} className="w-32" />
                <Select value={language} onChange={setLanguage} options={languages} className="w-32" />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={loading || !keyword.trim()}
                variant="gradient"
                size="lg"
                className="shrink-0 h-12 px-6 rounded-lg shadow-lg shadow-[#6D5EF5]/20"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing</>
                ) : (
                  <><Zap className="w-4 h-4 mr-2" /> Analyze</>
                )}
              </Button>
            </div>
          </GlassCard>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="text-[10px] text-[#5A6577] mt-2 text-right"
          >
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-[9px]">Enter</kbd> to analyze
          </motion.p>
        </motion.div>

        {/* ── empty state ─────────────────────────────────── */}
        {!analyzed && !loading && !error && (
          <motion.div variants={containerVariants} initial="hidden" animate="show"
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6D5EF5]/20 to-[#4CC9F0]/10 border border-white/[0.06] flex items-center justify-center mb-6"
            >
              <Search className="w-10 h-10 text-[#6D5EF5]" />
            </motion.div>
            <h2 className="text-xl font-semibold text-white mb-2">Enter a keyword to start your research</h2>
            <p className="text-sm text-[#A7B0C0] max-w-md mb-8">
              Uncover thousands of related keywords, questions, long-tail phrases, LSI terms, and topical clusters in seconds.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl">
              {[
                { icon: BarChart3, label: "Volume & CPC", desc: "Search volume & cost data" },
                { icon: Target, label: "Difficulty Scores", desc: "Competition analysis" },
                { icon: MessageSquare, label: "Question Mining", desc: "People also ask" },
                { icon: Layers, label: "Topic Clusters", desc: "Content architecture" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <GlassCard key={item.label} className="p-4 text-center hover:border-[#6D5EF5]/20 transition-all group">
                    <Icon className="w-5 h-5 text-[#4CC9F0] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-medium text-white">{item.label}</p>
                    <p className="text-[10px] text-[#A7B0C0] mt-0.5">{item.desc}</p>
                  </GlassCard>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ── loading ─────────────────────────────────────── */}
        {loading && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="h-28 rounded-xl bg-gradient-to-b from-[#151C2E]/60 to-[#151C2E]/30 animate-pulse border border-white/[0.04]"
                />
              ))}
            </div>
            <div className="h-10 rounded-xl bg-gradient-to-b from-[#151C2E]/60 to-[#151C2E]/30 animate-pulse border border-white/[0.04]" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="h-14 rounded-xl bg-gradient-to-b from-[#151C2E]/60 to-[#151C2E]/30 animate-pulse border border-white/[0.04]"
                />
              ))}
            </div>
          </div>
        )}

        {/* ── error ───────────────────────────────────────── */}
        {error && !loading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-b from-red-500/10 to-transparent border border-red-500/20 text-red-400 text-sm"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* ── results ──────────────────────────────────────── */}
        {analyzed && !loading && !error && result && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">

            {/* overview stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={Hash} label="Total Keywords" value={String(result.stats.totalKeywords)} sub="Expanded from seed" trend={{ dir: "up", val: "12.4%" }} />
              <StatCard icon={BarChart3} label="Avg Difficulty" value={result.stats.avgDifficulty + "%"} sub="Moderate competition" trend={{ dir: "down", val: "3.2%" }} />
              <StatCard icon={Globe} label="Total Volume" value={(result.stats.totalVolume / 1000).toFixed(1) + "K"} sub="Monthly searches" trend={{ dir: "up", val: "8.7%" }} />
              <StatCard icon={Target} label="Top Position" value={result.stats.topPosition} sub={(result.keywords[0]?.volume ?? 0).toLocaleString() + " /mo"} trend={{ dir: "up", val: "5.1%" }} />
            </div>

            {/* engine warning */}
            {result.engine === "local" && (
              <motion.div variants={itemVariants}
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 text-amber-400 text-sm"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Running on local keyword engine. Add DataForSEO API in Admin Panel for live data.</span>
              </motion.div>
            )}

            {/* tabs container */}
            <GlassCard>
              <Tabs value={tab} onValueChange={setTab}>
                <div className="px-4 pt-4 pb-0 border-b border-white/[0.06]">
                  <TabsList className="w-full sm:w-auto bg-transparent border-0 p-0 gap-0">
                    {[
                      { id: "keywords", label: "Keywords", icon: Hash },
                      { id: "questions", label: "Questions", icon: MessageSquare },
                      { id: "longtail", label: "Long Tail", icon: Layers },
                      { id: "related", label: "Related", icon: Network },
                      { id: "lsi", label: "LSI & NLP", icon: Lightbulb },
                      { id: "topical", label: "Topical Map", icon: PieChart },
                    ].map((t) => (
                      <TabsTrigger
                        key={t.id}
                        value={t.id}
                        className="flex items-center gap-1.5 px-4 py-3 text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-[#6D5EF5] data-[state=active]:text-white text-[#A7B0C0] hover:text-white transition-all"
                      >
                        <t.icon className="w-3.5 h-3.5" />
                        {t.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {/* ── Keywords Tab ────────────────────────────── */}
                <TabsContent value="keywords" className="mt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          <th className="text-left py-3 pl-4 pr-2 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider w-10">
                            <Filter className="w-3.5 h-3.5" />
                          </th>
                          <th className="text-left py-3 pr-3 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                            onClick={() => handleSort("keyword")}
                          >
                            Keyword <SortIcon col="keyword" />
                          </th>
                          <th className="text-right py-3 pr-3 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                            onClick={() => handleSort("volume")}
                          >
                            Volume <SortIcon col="volume" />
                          </th>
                          <th className="text-right py-3 pr-3 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                            onClick={() => handleSort("difficulty")}
                          >
                            KD <SortIcon col="difficulty" />
                          </th>
                          <th className="text-left py-3 pr-3 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Intent</th>
                          <th className="text-right py-3 pr-3 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                            onClick={() => handleSort("cpc")}
                          >
                            CPC <SortIcon col="cpc" />
                          </th>
                          <th className="text-center py-3 pr-3 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Trend</th>
                          <th className="text-right py-3 pr-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedKeywords.map((k, i) => (
                          <motion.tr
                            key={k.keyword}
                            variants={itemVariants}
                            className="group border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-3 pl-4 pr-2"><FavBtn /></td>
                            <td className="py-3 pr-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white text-sm">{k.keyword}</span>
                                <CopyBtn text={k.keyword} />
                              </div>
                            </td>
                            <td className="py-3 pr-3 text-right">
                              <span className="text-white font-medium tabular-nums">{k.volume.toLocaleString()}</span>
                            </td>
                            <td className="py-3 pr-3 text-right"><DifficultyBar value={k.difficulty} /></td>
                            <td className="py-3 pr-3">
                              <Badge variant={getIntentBadgeVariant(k.intent)} size="sm" className="gap-1">
                                {getIntentIcon(k.intent)}
                                <span className="capitalize">{k.intent}</span>
                              </Badge>
                            </td>
                            <td className="py-3 pr-3 text-right">
                              <span className="text-white font-medium tabular-nums">${k.cpc.toFixed(2)}</span>
                            </td>
                            <td className="py-3 pr-3 text-center"><TrendIcon trend={k.trend} /></td>
                            <td className="py-3 pr-4 text-right">
                              <Link
                                href={"/post-generator?keyword=" + encodeURIComponent(k.keyword)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium rounded-lg bg-gradient-to-r from-[#6D5EF5]/10 to-[#8B5CF6]/10 text-[#6D5EF5] hover:from-[#6D5EF5]/20 hover:to-[#8B5CF6]/20 border border-[#6D5EF5]/20 transition-all"
                              >
                                <Zap className="w-3 h-3" /> Generate
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                {/* ── Questions Tab ───────────────────────────── */}
                <TabsContent value="questions" className="mt-0 p-4 sm:p-5">
                  <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
                    {groupedQuestions.map((group) => (
                      <motion.div key={group.topic} variants={itemVariants}>
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-4 h-4 text-[#4CC9F0]" />
                          <h3 className="text-sm font-semibold text-white">{group.topic}</h3>
                          <span className="text-[11px] text-[#A7B0C0]">({group.items.length} questions)</span>
                        </div>
                        <div className="grid gap-2">
                          {group.items.map((item) => (
                            <div key={item.question}
                              className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#6D5EF5]/20 hover:bg-white/[0.04] transition-all group/item"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="w-6 h-6 rounded-full bg-[#6D5EF5]/10 flex items-center justify-center shrink-0">
                                  <span className="text-[10px] font-bold text-[#6D5EF5]">?</span>
                                </span>
                                <span className="text-sm text-white truncate">{item.question}</span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs text-[#A7B0C0] tabular-nums">{item.volume.toLocaleString()}/mo</span>
                                <Badge variant={item.difficulty <= 30 ? "success" : item.difficulty <= 60 ? "warning" : "danger"} size="sm">
                                  KD {item.difficulty}
                                </Badge>
                                <CopyBtn text={item.question} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </TabsContent>

                {/* ── Long Tail Tab ───────────────────────────── */}
                <TabsContent value="longtail" className="mt-0 p-4 sm:p-5">
                  <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid sm:grid-cols-2 gap-3">
                    {result.longTail.map((item) => (
                      <motion.div key={item.keyword} variants={itemVariants}
                        className="group p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#6D5EF5]/30 hover:shadow-lg hover:shadow-black/10 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-sm font-medium text-white">{item.keyword}</span>
                          <CopyBtn text={item.keyword} />
                        </div>
                        <div className="flex items-center gap-3">
                          <DifficultyBar value={item.difficulty} />
                          <Badge variant="outline" size="sm" className="text-[#A7B0C0]">{item.volume.toLocaleString()}/mo</Badge>
                        </div>
                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#A7B0C0]">
                          <span>Parent:</span>
                          <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[#4CC9F0]">{item.parentKeyword}</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </TabsContent>

                {/* ── Related Tab ──────────────────────────────── */}
                <TabsContent value="related" className="mt-0 p-4 sm:p-5">
                  <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-1.5">
                    {result.related.map((item) => (
                      <motion.div key={item.keyword} variants={itemVariants}
                        className="flex items-center justify-between gap-3 p-3.5 rounded-xl hover:bg-white/[0.03] transition-colors border-b border-white/[0.03] last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <Network className="w-4 h-4 text-[#4CC9F0]" />
                          <span className="text-sm text-white">{item.keyword}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden ring-1 ring-white/[0.03] p-[1px]">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: item.relevance + "%" }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-[#6D5EF5] to-[#4CC9F0]"
                              />
                            </div>
                            <span className="text-xs font-medium text-white tabular-nums">{item.relevance}%</span>
                          </div>
                          <CopyBtn text={item.keyword} />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </TabsContent>

                {/* ── LSI & NLP Tab ───────────────────────────── */}
                <TabsContent value="lsi" className="mt-0 p-4 sm:p-5">
                  <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(groupedLsi).map(([category, terms]) => (
                      <motion.div key={category} variants={itemVariants}>
                        <GlassCard className="p-4 hover:border-[#6D5EF5]/20 transition-all group">
                          <div className="flex items-center gap-2 mb-3">
                            {category === "Entities" && <Globe className="w-4 h-4 text-[#4CC9F0]" />}
                            {category === "Concepts" && <Lightbulb className="w-4 h-4 text-[#F59E0B]" />}
                            {category === "Adjectives" && <BookOpen className="w-4 h-4 text-[#22C55E]" />}
                            {category === "Verbs" && <Zap className="w-4 h-4 text-[#EF4444]" />}
                            {category === "Categories" && <Layers className="w-4 h-4 text-[#8B5CF6]" />}
                            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">{category}</h3>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {terms.map((term) => (
                              <span key={term}
                                className="text-[11px] px-2.5 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[#A7B0C0] hover:bg-[#6D5EF5]/10 hover:text-white hover:border-[#6D5EF5]/30 transition-all cursor-default"
                              >
                                {term}
                              </span>
                            ))}
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </motion.div>
                </TabsContent>

                {/* ── Topical Map Tab ──────────────────────────── */}
                <TabsContent value="topical" className="mt-0 p-4 sm:p-5">
                  <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid sm:grid-cols-2 gap-4">
                    {result.topicalMap.map((cluster) => (
                      <motion.div key={cluster.topic} variants={itemVariants}>
                        <GlassCard className="p-4 hover:border-[#6D5EF5]/30 transition-all group">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B5CF6]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <PieChart className="w-5 h-5 text-[#6D5EF5]" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-white">{cluster.topic}</h3>
                              <p className="text-[11px] text-[#A7B0C0]">{cluster.subtopics.length} subtopics</p>
                            </div>
                          </div>
                          <div className="relative pl-6 border-l-2 border-[#6D5EF5]/20 group-hover:border-[#6D5EF5]/40 transition-colors">
                            {cluster.subtopics.map((child, ci) => (
                              <div key={child} className="flex items-center gap-2 pb-2.5 last:pb-0">
                                <div className="absolute -left-[5px] w-2 h-2 rounded-full bg-[#6D5EF5]/30 group-hover:bg-[#6D5EF5]/60 transition-colors" />
                                <span className="text-sm text-[#A7B0C0] group-hover:text-white transition-colors">{child}</span>
                              </div>
                            ))}
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </motion.div>
                </TabsContent>

              </Tabs>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}
