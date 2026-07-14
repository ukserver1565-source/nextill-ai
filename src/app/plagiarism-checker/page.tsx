"use client"

import { Suspense, useState, useCallback, useRef, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield, ShieldCheck, ShieldAlert, FileSearch, Upload, Copy, Check,
  Download, Share2, RefreshCw, FileText, ExternalLink, Loader2,
  ScanSearch, Search, AlertTriangle, X, FileUp, Clock, Save,
} from "lucide-react"
import type { PlagiarismCheckerResult } from "@/lib/workflows/workflow-types"

type InputMode = "paste" | "upload"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
}

function ScoreGauge({ score, size = 200 }: { score: number; size?: number }) {
  const cx = size / 2
  const cy = size / 2
  const r = (size - 28) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444"
  const label = score >= 80 ? "Original" : score >= 60 ? "Needs Review" : "High Similarity"

  return (
    <div className="relative flex flex-col items-center group">
      <svg width={size} height={size} className="-rotate-90 drop-shadow-xl">
        <defs>
          <radialGradient id="gauge-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r + 12} fill={`url(#gauge-glow)`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
        <motion.circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke={color}
          strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-5xl font-bold tracking-tight"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 150 }}
        >
          {score}<span className="text-2xl">%</span>
        </motion.span>
        <motion.span
          className="text-xs text-[#A7B0C0] mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {label}
        </motion.span>
      </div>
    </div>
  )
}

function PublishBadge({ score }: { score: number }) {
  if (score >= 80) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
        className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20"
      >
        <div className="w-10 h-10 rounded-full bg-[#22C55E]/20 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-[#22C55E]" /></div>
        <div><p className="text-sm font-semibold text-[#22C55E]">Safe to Publish</p><p className="text-xs text-[#A7B0C0]">Your content passes originality checks</p></div>
      </motion.div>
    )
  }
  if (score >= 60) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
        className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20"
      >
        <div className="w-10 h-10 rounded-full bg-[#F59E0B]/20 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-[#F59E0B]" /></div>
        <div><p className="text-sm font-semibold text-[#F59E0B]">Review Recommended</p><p className="text-xs text-[#A7B0C0]">Some sections may need rewriting</p></div>
      </motion.div>
    )
  }
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
      className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20"
    >
      <div className="w-10 h-10 rounded-full bg-[#EF4444]/20 flex items-center justify-center"><ShieldAlert className="w-5 h-5 text-[#EF4444]" /></div>
      <div><p className="text-sm font-semibold text-[#EF4444]">High Similarity Detected</p><p className="text-xs text-[#A7B0C0]">Significant matches found — rewrite before publishing</p></div>
    </motion.div>
  )
}

function SimilarityBar({ unique, matched }: { unique: number; matched: number }) {
  const total = unique + matched
  const uniquePct = total > 0 ? (unique / total) * 100 : 100
  const matchedPct = total > 0 ? (matched / total) * 100 : 0
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#A7B0C0]">Content Breakdown</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22C55E]" /> Unique</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Matched</span>
        </div>
      </div>
      <div className="h-4 rounded-full bg-white/[0.04] overflow-hidden flex ring-1 ring-white/[0.03] p-[2px]">
        <motion.div
          className="h-full bg-gradient-to-r from-[#22C55E] to-[#4CC9F0] rounded-l-full"
          initial={{ width: 0 }} animate={{ width: `${uniquePct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <motion.div
          className="h-full bg-gradient-to-r from-[#EF4444] to-[#F59E0B] rounded-r-full"
          initial={{ width: 0 }} animate={{ width: `${matchedPct}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </div>
      <div className="flex justify-between text-xs text-[#A7B0C0]">
        <span>{unique.toLocaleString()} words unique</span>
        <span>{matched.toLocaleString()} words matched</span>
      </div>
    </div>
  )
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-sm text-[#A7B0C0] hover:text-white transition-all"
    >
      {copied ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />}
      {copied ? "Copied!" : label}
    </button>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          className="bg-gradient-to-b from-[#151C2E]/60 to-[#151C2E]/30 rounded-xl border border-white/[0.06] p-6"
        >
          <div className="h-4 w-1/3 rounded-lg bg-white/[0.06] mb-4 animate-pulse" />
          <div className="space-y-3">
            <div className="h-3 rounded-lg bg-white/[0.04] animate-pulse" />
            <div className="h-3 w-5/6 rounded-lg bg-white/[0.04] animate-pulse" />
            <div className="h-3 w-2/3 rounded-lg bg-white/[0.04] animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
        className="relative mb-8"
      >
        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#6D5EF5]/20 to-[#4CC9F0]/10 border border-white/[0.06] flex items-center justify-center backdrop-blur-xl">
          <ScanSearch className="w-12 h-12 text-[#6D5EF5]" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-[#4CC9F0]/20 border border-white/[0.06] flex items-center justify-center backdrop-blur-xl">
          <Search className="w-4 h-4 text-[#4CC9F0]" />
        </div>
      </motion.div>
      <h3 className="text-xl font-semibold text-white mb-2">Check your content for plagiarism</h3>
      <p className="text-[#A7B0C0] text-sm max-w-md">Paste or upload your content above to scan billions of web sources for duplicate content.</p>
    </motion.div>
  )
}

function ResultsSection({ result, onNewCheck }: { result: PlagiarismCheckerResult; onNewCheck: () => void }) {
  const totalWords = result.wordCount
  const matchedWords = result.matchedPhrases.reduce((sum, p) => sum + p.text.split(/\s+/).length, 0)
  const uniqueWords = Math.max(totalWords - matchedWords, 0)
  const [copied, setCopied] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const handleDownload = useCallback(() => {
    let report = `Plagiarism Report - Nextill AI\nOriginality Score: ${result.originalityScore}%\nStatus: ${result.safeToPublish ? "Safe to Publish" : "Needs Review"}\nWords Checked: ${result.wordCount}\n\nRecommendation: ${result.recommendation}\n\n`
    if (result.matchedPhrases.length > 0) {
      report += `Matched Phrases:\n`
      result.matchedPhrases.forEach((p, i) => { report += `${i + 1}. "${p.text}" — ${p.similarity}% (${p.source || "Unknown"})\n` })
    }
    if (result.sources.length > 0) {
      report += `\nSources:\n`
      result.sources.forEach((s, i) => { report += `${i + 1}. ${s.title} — ${s.matchPercent}%\n   ${s.url}\n` })
    }
    const blob = new Blob([report], { type: "text/plain" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "plagiarism-report.txt"
    a.click()
    URL.revokeObjectURL(a.href)
  }, [result])

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      await navigator.share({ title: "Plagiarism Report - Nextill AI", text: `My content scored ${result.originalityScore}% originality on Nextill AI. AI-likelihood: ${result.aiDetection?.label || "N/A"}.` })
    } else {
      navigator.clipboard.writeText(`Plagiarism Report - Nextill AI\nScore: ${result.originalityScore}%`)
      setCopied("share")
      setTimeout(() => setCopied(""), 2000)
    }
  }, [result])

  const handleCopyReport = useCallback(() => {
    let r = `Plagiarism Report - Nextill AI\nScore: ${result.originalityScore}%\n\n`
    result.matchedPhrases.forEach(p => { r += `"${p.text}" — ${p.similarity}%\n` })
    navigator.clipboard.writeText(r)
    setCopied("copy")
    setTimeout(() => setCopied(""), 2000)
  }, [result])

  const handleSaveReport = useCallback(async () => {
    setSaveError("")
    setSaving(true)
    try {
      const res = await fetch("/api/user/plagiarism-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Plagiarism & Authenticity Report - ${result.originalityScore}% Original`,
          content: result.matchedPhrases.map(p => `"${p.text}" — ${p.similarity}% (${p.source || "Unknown"})`).join("\n"),
          score: result.originalityScore,
          sources: result.sources,
          status: result.safeToPublish ? "safe" : "review",
        }),
      })
      if (res.ok) {
        setCopied("save")
        setTimeout(() => setCopied(""), 2000)
      }
    } catch (e) { setSaveError("Failed to save report. Please try again.") }
    setSaving(false)
  }, [result])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}><PublishBadge score={result.originalityScore} /></motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div variants={itemVariants}
          className="lg:col-span-2 bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center shadow-xl shadow-black/10"
        >
          <ScoreGauge score={result.originalityScore} />
          <div className="mt-5 grid grid-cols-2 gap-3 w-full">
            <div className="text-center p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.10] transition-colors">
              <p className="text-lg font-bold text-white">{result.wordCount}</p>
              <p className="text-[10px] text-[#A7B0C0]">Words Checked</p>
            </div>
            <div className="text-center p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.10] transition-colors">
              <p className="text-lg font-bold text-white">{result.matchedPhrases.length}</p>
              <p className="text-[10px] text-[#A7B0C0]">Matches Found</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-4">
          <div className="bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-xl shadow-black/10">
            <SimilarityBar unique={uniqueWords} matched={matchedWords} />
          </div>
          <div className="bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-xl shadow-black/10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#6D5EF5]/10 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-[#6D5EF5]" />
              </div>
              <h4 className="text-sm font-semibold text-white">Recommendation</h4>
            </div>
            <p className="text-sm text-[#A7B0C0] leading-relaxed">{result.recommendation}</p>
          </div>
        </motion.div>
      </div>

      {result.sources.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl shadow-black/10">
            <div className="px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-[#6D5EF5]" />
                Matched Sources ({result.sources.length})
              </h3>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {result.sources.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{s.title}</p>
                      <a href={s.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[#6D5EF5] hover:text-[#8B5CF6] flex items-center gap-1 mt-0.5 truncate transition-colors"
                      >
                        {s.url} <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                    <span className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full ${
                      s.matchPercent > 70 ? "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20"
                      : s.matchPercent > 40 ? "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20"
                      : "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20"
                    }`}>
                      {s.matchPercent}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {result.matchedPhrases.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl shadow-black/10">
            <div className="px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-[#6D5EF5]" />
                Detailed Report ({result.matchedPhrases.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-3 px-5 text-xs text-[#A7B0C0] font-medium uppercase tracking-wider">Matched Phrase</th>
                    <th className="text-left py-3 px-4 text-xs text-[#A7B0C0] font-medium uppercase tracking-wider whitespace-nowrap">Source</th>
                    <th className="text-right py-3 px-4 text-xs text-[#A7B0C0] font-medium uppercase tracking-wider whitespace-nowrap">Similarity</th>
                    <th className="text-left py-3 px-4 text-xs text-[#A7B0C0] font-medium uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {result.matchedPhrases.map((p, i) => (
                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-5 max-w-xs">
                        <span className="text-white/90 text-sm leading-relaxed">"{p.text}"</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-[#A7B0C0]">{p.source || "—"}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`text-xs font-bold tabular-nums ${
                          p.similarity > 70 ? "text-[#EF4444]" : p.similarity > 40 ? "text-[#F59E0B]" : "text-[#22C55E]"
                        }`}>
                          {p.similarity}%
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-xs text-[#4CC9F0]/80 italic">
                          {p.similarity >= 70 ? "Rewrite significantly" : p.similarity >= 40 ? "Consider rephrasing" : "Minor adjustments"}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 pt-2">
        <button onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6] hover:opacity-90 text-white text-sm font-medium transition-all shadow-lg shadow-[#6D5EF5]/20"
        >
          <Download className="w-4 h-4" /> Download Report
        </button>
        <button onClick={handleCopyReport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-sm text-[#A7B0C0] hover:text-white transition-all"
        >
          {copied === "copy" ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />}
          {copied === "copy" ? "Copied!" : "Copy Results"}
        </button>
        <button onClick={handleSaveReport} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-sm text-[#A7B0C0] hover:text-white transition-all disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : copied === "save" ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Save className="w-4 h-4" />}
          {copied === "save" ? "Saved!" : "Save Report"}
        </button>
        <button onClick={handleShare}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-sm text-[#A7B0C0] hover:text-white transition-all"
        >
          {copied === "share" ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Share2 className="w-4 h-4" />}
          {copied === "share" ? "Shared!" : "Share"}
        </button>
        <button onClick={onNewCheck}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-sm text-[#A7B0C0] hover:text-white transition-all ml-auto"
        >
          <RefreshCw className="w-4 h-4" /> New Check
        </button>
      </motion.div>
      {saveError && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{saveError}</span>
          <button onClick={() => setSaveError("")} className="ml-auto shrink-0">
            <X className="w-3.5 h-3.5 hover:opacity-70 transition-opacity" />
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

function PlagiarismCheckerContent() {
  const searchParams = useSearchParams()
  const prefillText = searchParams.get("text") || ""

  const [text, setText] = useState(prefillText)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PlagiarismCheckerResult | null>(null)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<InputMode>("paste")
  const [fileName, setFileName] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCheck = useCallback(async () => {
    if (!text.trim()) return
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch("/api/tools/plagiarism-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: { text } }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}`)
      }
      if (!json.success || !json.content) {
        throw new Error("Plagiarism check failed")
      }
      const content = json.content
      const matches = content.matches || []
      const matchedPhrases = matches.map((m: any) => ({
        text: m.text || "",
        similarity: m.similarity || 0,
        source: m.source || "",
      }))
      const score = content.originalityScore ?? 0
      const duplicateRisk: "low" | "medium" | "high" | "critical" =
        score >= 80 ? "low" : score >= 60 ? "medium" : score >= 40 ? "high" : "critical"
      const recommendation =
        score >= 80
          ? "Your content appears original. Safe to publish."
          : score >= 60
          ? "Your content has moderate similarity with existing sources. Consider rewriting highlighted sections."
          : "Significant similarity detected. Rewrite before publishing."

      const sources = matchedPhrases
        .filter((m: any) => m.source)
        .reduce((acc: any[], m: any) => {
          if (!acc.find((s) => s.source === m.source)) {
            acc.push({ url: `https://${m.source}`, title: m.source, matchPercent: m.similarity })
          }
          return acc
        }, [])

      const plagiarismResult: PlagiarismCheckerResult = {
        originalityScore: score,
        duplicateRisk,
        matchedPhrases,
        sources,
        recommendation,
        safeToPublish: content.safeToPublish ?? score >= 80,
        wordCount: content.wordCount || json.wordCount || text.split(/\s+/).filter(Boolean).length,
        engine: json.localEngine ? "local" : "ai",
        aiDetection: json.aiDetection || undefined,
      }
      setResult(plagiarismResult)
    } catch (err: any) {
      setError(err.message || "Failed to check plagiarism")
    } finally {
      setLoading(false)
    }
  }, [text])

  const handleFileUpload = useCallback((file: File | null) => {
    if (!file) return
    if (!file.name.endsWith(".txt")) {
      setError("Only .txt files are supported. Please convert your file to plain text before uploading.")
      return
    }
    setFileName(file.name)
    setError("")
    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target?.result
      if (typeof content === "string") setText(content)
    }
    reader.readAsText(file)
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files?.[0] || null)
  }, [handleFileUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileUpload(e.dataTransfer.files[0] || null)
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleNewCheck = useCallback(() => {
    setResult(null)
    setText("")
    setFileName("")
    setError("")
  }, [])

  const wordCount = text.split(/\s+/).filter(Boolean).length
  const hasResult = !!result

  return (
    <div className="min-h-screen bg-[#090B16] text-white">
      <div className="flex h-screen overflow-hidden">
        {/* Left Panel */}
        <div className="w-[440px] min-w-[440px] border-r border-white/[0.06] overflow-y-auto bg-gradient-to-b from-[#090B16] via-[#0A0C1A] to-[#090B16]">
          <div className="p-8 space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="pb-4 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] flex items-center justify-center shadow-xl shadow-[#6D5EF5]/25">
                  <FileSearch className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white">Plagiarism & Authenticity</h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    <p className="text-xs text-[#5A6577]">Originality scanner</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mode Toggle */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] w-fit">
                <button onClick={() => setMode("paste")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    mode === "paste" ? "bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6] text-white shadow-lg shadow-[#6D5EF5]/20" : "text-[#A7B0C0] hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Paste Text
                </button>
                <button onClick={() => setMode("upload")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    mode === "upload" ? "bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6] text-white shadow-lg shadow-[#6D5EF5]/20" : "text-[#A7B0C0] hover:text-white"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload File
                </button>
              </div>
            </motion.div>

            {/* Input Area */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <AnimatePresence mode="wait">
                {mode === "paste" ? (
                  <motion.div key="paste" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    <div className="relative group">
                      <textarea
                        placeholder="Paste your article, blog post, or any text here to check for plagiarism..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={10}
                        className="w-full rounded-xl bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/60 border border-white/[0.06] px-4 py-3.5 text-sm text-white placeholder:text-[#5A6577]/40 focus:outline-none focus:border-[#6D5EF5]/40 focus:ring-2 focus:ring-[#6D5EF5]/12 transition-all resize-none"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#A7B0C0]">
                        {wordCount > 0 ? `${wordCount} words` : "Minimum 50 words recommended"}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div
                      onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center py-14 px-6 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                        isDragOver ? "border-[#6D5EF5] bg-[#6D5EF5]/8 shadow-lg shadow-[#6D5EF5]/10" : "border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.03]"
                      }`}
                    >
                      <input ref={fileInputRef} type="file" accept=".txt" onChange={handleFileChange} className="hidden" />
                      {fileName ? (
                        <div className="text-center">
                          <div className="w-14 h-14 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-6 h-6 text-[#22C55E]" />
                          </div>
                          <p className="text-sm text-white font-medium mb-1">{fileName}</p>
                          <p className="text-xs text-[#A7B0C0]">{wordCount} words loaded</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-xl bg-[#6D5EF5]/10 border border-white/[0.06] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FileUp className="w-6 h-6 text-[#6D5EF5]" />
                          </div>
                          <p className="text-sm text-white font-medium mb-1">Drop file here or click to browse</p>
                          <p className="text-xs text-[#A7B0C0]">Supports .txt files only</p>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Check Button */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <button onClick={handleCheck} disabled={loading || !text.trim()}
                className="relative w-full h-12 rounded-2xl font-medium text-sm text-white overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-[#6D5EF5]/15"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#6D5EF5] to-[#4CC9F0] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <div className="relative flex items-center justify-center gap-2.5">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Scanning...</>
                    : <><Shield className="w-4 h-4" /> Check Plagiarism</>}
                </div>
              </button>
            </motion.div>

            {/* Result Meta */}
            {hasResult && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-b from-[#151C2E]/40 to-[#151C2E]/20 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.04]">
                  <span className="text-xs text-[#5A6577]">Status</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#22C55E]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                    Checked
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5A6577]">Originality</span>
                    <span className="text-sm font-semibold text-white">{result.originalityScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5A6577]">Words Checked</span>
                    <span className="text-sm font-semibold text-white">{result.wordCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5A6577]">Matches</span>
                    <span className="text-sm font-semibold text-[#EF4444]">{result.matchedPhrases.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5A6577]">Engine</span>
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#6D5EF5]/10 text-[#6D5EF5] border border-[#6D5EF5]/20">{result.engine}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* New Check */}
            {hasResult && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleNewCheck}
                className="w-full h-11 rounded-2xl border border-dashed border-white/[0.08] text-xs text-[#5A6577] hover:text-white hover:border-white/[0.15] hover:bg-white/[0.02] transition-all"
              >
                + New Check
              </motion.button>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#090B16] via-[#0A0C1A] to-[#090B16]">
          {loading && (
            <div className="p-8 max-w-2xl mx-auto">
              <div className="bg-gradient-to-b from-[#151C2E]/80 to-[#151C2E]/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 shadow-xl shadow-black/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B5CF6]/10 border border-[#6D5EF5]/20 flex items-center justify-center">
                    <ScanSearch className="w-4.5 h-4.5 text-[#6D5EF5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Scanning Content</h3>
                    <p className="text-[11px] text-[#5A6577]">Checking against billions of web sources...</p>
                  </div>
                </div>
                <LoadingSkeleton />
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="p-8 max-w-2xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-b from-[#EF4444]/8 to-transparent border border-[#EF4444]/20 rounded-2xl p-5 flex items-start gap-3 shadow-lg shadow-[#EF4444]/5"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EF4444]/15 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#EF4444]">Check Failed</p>
                  <p className="text-xs text-[#A7B0C0] mt-1">{error}</p>
                  <button onClick={handleCheck} className="mt-3 px-4 py-1.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-xs font-medium text-[#EF4444] hover:bg-[#EF4444]/20 transition-all">
                    Try Again
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {!loading && !result && !error && <EmptyState />}

          {!loading && result && (
            <div className="p-8 max-w-2xl mx-auto">
              <ResultsSection result={result} onNewCheck={handleNewCheck} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PlagiarismCheckerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#090B16] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B5CF6]/10 border border-[#6D5EF5]/20 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-[#6D5EF5] animate-spin" />
          </div>
          <p className="text-sm text-[#5A6577]">Loading Plagiarism & Authenticity...</p>
        </div>
      </div>
    }>
      <PlagiarismCheckerContent />
    </Suspense>
  )
}
