"use client"

import { Suspense, useState, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield, ShieldCheck, ShieldAlert, FileSearch, Upload, Copy, Check,
  Download, Share2, RefreshCw, FileText, ExternalLink, Loader2,
  ScanSearch, Search, AlertTriangle,
} from "lucide-react"
import type { PlagiarismCheckerResult } from "@/lib/workflows/workflow-types"

type InputMode = "paste" | "upload"

const SAMPLE_RESULT: PlagiarismCheckerResult = {
  originalityScore: 72,
  duplicateRisk: "medium",
  safeToPublish: false,
  wordCount: 485,
  engine: "demo",
  recommendation: "Your content has moderate similarity with existing sources. Consider rewriting highlighted sections to improve originality before publishing.",
  matchedPhrases: [
    { text: "Artificial intelligence is transforming the way businesses operate", similarity: 87, source: "techcrunch.com" },
    { text: "Machine learning algorithms can process vast amounts of data", similarity: 63, source: "medium.com" },
    { text: "The future of SEO lies in understanding user intent", similarity: 45, source: "searchengineland.com" },
    { text: "Content creators must adapt to changing algorithms", similarity: 38, source: "moz.com" },
    { text: "Data-driven marketing strategies outperform traditional approaches", similarity: 71, source: "hubspot.com" },
  ],
  sources: [
    { url: "https://techcrunch.com/ai-business-transformation", title: "How AI is Transforming Business Operations", matchPercent: 87 },
    { url: "https://medium.com/machine-learning-data-processing", title: "Machine Learning for Large Scale Data", matchPercent: 63 },
    { url: "https://searchengineland.com/user-intent-seo-future", title: "User Intent: The Future of SEO", matchPercent: 45 },
  ],
}

function ScoreGauge({ score, size = 180 }: { score: number; size?: number }) {
  const cx = size / 2
  const cy = size / 2
  const r = (size - 24) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444"
  const label = score >= 80 ? "Original" : score >= 60 ? "Needs Review" : "High Similarity"

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90 drop-shadow-lg">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
        <motion.circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke={color}
          strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold tracking-tight"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
        >
          {score}%
        </motion.span>
        <span className="text-xs text-[#A7B0C0] mt-1">{label}</span>
      </div>
    </div>
  )
}

function SimilarityBar({ unique, matched }: { unique: number; matched: number }) {
  const total = unique + matched
  const uniquePct = total > 0 ? (unique / total) * 100 : 100
  const matchedPct = total > 0 ? (matched / total) * 100 : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#A7B0C0]">Content Breakdown</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22C55E]" /> Unique</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Matched</span>
        </div>
      </div>
      <div className="h-3 rounded-full bg-white/[0.04] overflow-hidden flex">
        <motion.div
          className="h-full bg-gradient-to-r from-[#22C55E] to-[#4CC9F0] rounded-l-full"
          initial={{ width: 0 }}
          animate={{ width: `${uniquePct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <motion.div
          className="h-full bg-gradient-to-r from-[#EF4444] to-[#F59E0B] rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${matchedPct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
      <div className="flex justify-between text-xs text-[#A7B0C0]">
        <span>{unique} words unique</span>
        <span>{matched} words matched</span>
      </div>
    </div>
  )
}

function CopyButton({ text, label, icon }: { text: string; label: string; icon?: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-sm text-[#A7B0C0] hover:text-white transition-all"
    >
      {icon || (copied ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />)}
      {copied ? "Copied!" : label}
    </button>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-[#151C2E]/50 rounded-xl border border-white/[0.04] p-6"
        >
          <div className="h-4 w-1/3 rounded bg-white/[0.06] mb-4 animate-pulse" />
          <div className="space-y-3">
            <div className="h-3 rounded bg-white/[0.04] animate-pulse" />
            <div className="h-3 w-5/6 rounded bg-white/[0.04] animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-white/[0.04] animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#6D5EF5]/20 to-[#4CC9F0]/10 border border-white/[0.06] flex items-center justify-center backdrop-blur-xl">
          <ScanSearch className="w-12 h-12 text-[#6D5EF5]" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-[#4CC9F0]/20 border border-white/[0.06] flex items-center justify-center backdrop-blur-xl">
          <Search className="w-4 h-4 text-[#4CC9F0]" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Check your content for plagiarism</h3>
      <p className="text-[#A7B0C0] text-sm max-w-md">
        Paste or upload your content above to scan billions of web sources for duplicate content and get a detailed originality report.
      </p>
    </motion.div>
  )
}

function PublishBadge({ score }: { score: number }) {
  if (score >= 80) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20"
      >
        <div className="w-10 h-10 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#22C55E]">Safe to Publish</p>
          <p className="text-xs text-[#A7B0C0]">Your content passes originality checks</p>
        </div>
      </motion.div>
    )
  }
  if (score >= 60) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20"
      >
        <div className="w-10 h-10 rounded-full bg-[#F59E0B]/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#F59E0B]">Review Recommended</p>
          <p className="text-xs text-[#A7B0C0]">Some sections may need rewriting</p>
        </div>
      </motion.div>
    )
  }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20"
    >
      <div className="w-10 h-10 rounded-full bg-[#EF4444]/20 flex items-center justify-center">
        <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#EF4444]">High Similarity Detected</p>
        <p className="text-xs text-[#A7B0C0]">Significant matches found — rewrite before publishing</p>
      </div>
    </motion.div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

function ResultsSection({ result, onNewCheck }: { result: PlagiarismCheckerResult; onNewCheck: () => void }) {
  const totalWords = result.wordCount
  const matchedWords = result.matchedPhrases.reduce((sum, p) => sum + p.text.split(/\s+/).length, 0)
  const uniqueWords = Math.max(totalWords - matchedWords, 0)

  const handleDownload = useCallback(() => {
    let report = `Plagiarism Report - Nextill AI\n`
    report += `Originality Score: ${result.originalityScore}%\n`
    report += `Status: ${result.safeToPublish ? "Safe to Publish" : "Needs Review"}\n`
    report += `Words Checked: ${result.wordCount}\n\n`
    report += `Recommendation: ${result.recommendation}\n\n`
    if (result.matchedPhrases.length > 0) {
      report += `Matched Phrases:\n`
      result.matchedPhrases.forEach((p, i) => {
        report += `${i + 1}. "${p.text}" — ${p.similarity}% (${p.source || "Unknown"})\n`
      })
    }
    if (result.sources.length > 0) {
      report += `\nSources:\n`
      result.sources.forEach((s, i) => {
        report += `${i + 1}. ${s.title} — ${s.matchPercent}%\n   ${s.url}\n`
      })
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
      await navigator.share({
        title: "Plagiarism Report - Nextill AI",
        text: `My content scored ${result.originalityScore}% originality on Nextill AI.`,
      })
    }
  }, [result])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <PublishBadge score={result.originalityScore} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 flex flex-col items-center"
        >
          <ScoreGauge score={result.originalityScore} />
          <div className="mt-4 grid grid-cols-2 gap-4 w-full">
            <div className="text-center p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <p className="text-lg font-bold text-white">{result.wordCount}</p>
              <p className="text-[10px] text-[#A7B0C0]">Words Checked</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <p className="text-lg font-bold text-white">{result.matchedPhrases.length}</p>
              <p className="text-[10px] text-[#A7B0C0]">Matches Found</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-4">
          <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
            <SimilarityBar unique={uniqueWords} matched={matchedWords} />
          </div>

          <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white mb-3">Recommendation</h4>
            <p className="text-sm text-[#A7B0C0] leading-relaxed">{result.recommendation}</p>
          </div>
        </motion.div>
      </div>

      {result.sources.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white">Matched Sources ({result.sources.length})</h3>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {result.sources.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{s.title}</p>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#6D5EF5] hover:text-[#8B5CF6] flex items-center gap-1 mt-0.5 truncate"
                      >
                        {s.url} <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                        s.matchPercent > 70
                          ? "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20"
                          : s.matchPercent > 40
                            ? "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20"
                            : "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20"
                      }`}
                    >
                      {s.matchPercent}%
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button className="text-xs text-[#6D5EF5] hover:text-[#8B5CF6] transition-colors flex items-center gap-1">
                      View Source <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {result.matchedPhrases.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white">Detailed Report ({result.matchedPhrases.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-3 px-5 text-xs text-[#A7B0C0] font-medium">Matched Phrase</th>
                    <th className="text-left py-3 px-4 text-xs text-[#A7B0C0] font-medium whitespace-nowrap">Source</th>
                    <th className="text-right py-3 px-4 text-xs text-[#A7B0C0] font-medium whitespace-nowrap">Similarity</th>
                    <th className="text-left py-3 px-4 text-xs text-[#A7B0C0] font-medium">Suggested Rewrite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {result.matchedPhrases.map((p, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-5 max-w-xs">
                        <span className="text-white/90">"{p.text}"</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-[#A7B0C0]">{p.source || "—"}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`text-xs font-bold ${
                            p.similarity > 70
                              ? "text-[#EF4444]"
                              : p.similarity > 40
                                ? "text-[#F59E0B]"
                                : "text-[#22C55E]"
                          }`}
                        >
                          {p.similarity}%
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-xs text-[#4CC9F0]/80 italic">
                          {(p.similarity >= 70 ? "High similarity — rewrite significantly" :
                            p.similarity >= 40 ? "Moderate similarity — consider rephrasing" :
                            "Low similarity — minor adjustments may help").replace(/"/g, "")}
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

      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#6D5EF5] hover:bg-[#5B4DE0] text-white text-sm font-medium transition-all"
        >
          <Download className="w-4 h-4" /> Download Report
        </button>
        <CopyButton
          text={(() => {
            let r = `Plagiarism Report - Nextill AI\nScore: ${result.originalityScore}%\n\n`
            result.matchedPhrases.forEach(p => { r += `"${p.text}" — ${p.similarity}%\n` })
            return r
          })()}
          label="Copy Results"
        />
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-sm text-[#A7B0C0] hover:text-white transition-all"
        >
          <Share2 className="w-4 h-4" /> Share
        </button>
        <button
          onClick={onNewCheck}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-sm text-[#A7B0C0] hover:text-white transition-all ml-auto"
        >
          <RefreshCw className="w-4 h-4" /> New Check
        </button>
      </motion.div>
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

  const handleCheck = useCallback(() => {
    if (!text.trim()) return
    setLoading(true)
    setError("")
    setResult(null)
    setTimeout(() => {
      setResult(SAMPLE_RESULT)
      setLoading(false)
    }, 2000)
  }, [text])

  const handleFileUpload = useCallback((file: File | null) => {
    if (!file) return
    setFileName(file.name)
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

  return (
    <div className="min-h-screen bg-[#090B16]">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] mb-4 shadow-lg shadow-[#6D5EF5]/20">
            <FileSearch className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Plagiarism Checker</h1>
          <p className="text-[#A7B0C0] mt-2 text-sm sm:text-base max-w-lg mx-auto">
            Check your content for originality against billions of web sources
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5 sm:p-6 space-y-5"
        >
          <div className="flex items-center gap-2 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06] w-fit">
            <button
              onClick={() => setMode("paste")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                mode === "paste"
                  ? "bg-[#6D5EF5] text-white shadow-lg shadow-[#6D5EF5]/20"
                  : "text-[#A7B0C0] hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" /> Paste Text
            </button>
            <button
              onClick={() => setMode("upload")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                mode === "upload"
                  ? "bg-[#6D5EF5] text-white shadow-lg shadow-[#6D5EF5]/20"
                  : "text-[#A7B0C0] hover:text-white"
              }`}
            >
              <Upload className="w-4 h-4" /> Upload File
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === "paste" ? (
              <motion.div
                key="paste"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <textarea
                  placeholder="Paste your article, blog post, essay, or any text here to check for plagiarism..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={10}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/40 focus:border-[#6D5EF5]/40 transition-all resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#A7B0C0]">
                    {wordCount > 0 ? `${wordCount} words` : "Minimum 50 words recommended"}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative flex flex-col items-center justify-center py-14 px-6 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                  isDragOver
                    ? "border-[#6D5EF5] bg-[#6D5EF5]/5"
                    : "border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02]"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.docx,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-xl bg-[#6D5EF5]/10 border border-white/[0.06] flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-[#6D5EF5]" />
                </div>
                <p className="text-sm text-white font-medium mb-1">
                  {fileName || "Drop file here or click to browse"}
                </p>
                <p className="text-xs text-[#A7B0C0]">
                  {fileName
                    ? `${fileName} loaded (${wordCount} words)`
                    : "Supports .txt, .docx, and .pdf files"
                  }
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleCheck}
            disabled={loading || !text.trim()}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6] hover:from-[#5B4DE0] hover:to-[#7C4FDF] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-[#6D5EF5]/20"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Scanning Content...</>
            ) : (
              <><Shield className="w-5 h-5" /> Check Plagiarism</>
            )}
          </button>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4"
          >
            <p className="text-sm text-[#EF4444] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {error}
            </p>
          </motion.div>
        )}

        {loading && <LoadingSkeleton />}

        <AnimatePresence mode="wait">
          {!loading && !result && !error && <EmptyState key="empty" />}
          {!loading && result && (
            <ResultsSection key="results" result={result} onNewCheck={handleNewCheck} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function PlagiarismCheckerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#090B16] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#A7B0C0]" />
      </div>
    }>
      <PlagiarismCheckerContent />
    </Suspense>
  )
}
