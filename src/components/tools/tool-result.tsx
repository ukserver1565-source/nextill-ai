"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/lib/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Copy, Check, Save, Loader2, LogIn, Trash2, Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"

interface ToolResultProps {
  title?: string
  resultType: string
  result: string | Record<string, unknown> | null
  wordCount?: number
  loading?: boolean
  onSave?: () => Promise<boolean>
  onClear?: () => void
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-red-500"
  if (score >= 60) return "text-orange-500"
  if (score >= 40) return "text-yellow-500"
  return "text-green-500"
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-red-500"
  if (score >= 60) return "bg-orange-500"
  if (score >= 40) return "bg-yellow-500"
  return "bg-green-500"
}

function _getScoreLabel(score: number): "Human" | "Mixed" | "AI" {
  if (score >= 70) return "AI"
  if (score >= 40) return "Mixed"
  return "Human"
}

function getLabelBadge(label: string): { text: string; color: string } {
  const l = label.toLowerCase()
  if (l === "ai" || l === "likely ai-generated") return { text: "AI", color: "bg-red-500/15 text-red-500 border-red-500/30" }
  if (l === "human" || l === "likely human-written") return { text: "Human", color: "bg-green-500/15 text-green-500 border-green-500/30" }
  return { text: "Mixed", color: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30" }
}

function ProgressBar({ value, color: colorFn = getScoreBg }: { value: number; color?: (v: number) => string }) {
  return (
    <div className="w-full h-2.5 bg-border rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorFn(value)}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

function copyToClipboard(text: string) {
  if (typeof window === "undefined") return
  navigator.clipboard.writeText(text)
}

function CodeBox({ content, label }: { content: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    copyToClipboard(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="space-y-2">
      {label && <p className="text-xs text-muted font-medium">{label}</p>}
      <div className="relative">
        <pre className="w-full max-w-full overflow-x-auto whitespace-pre-wrap break-all text-xs leading-relaxed bg-background/50 border border-border rounded-lg p-3 font-mono" style={{ maxHeight: "400px" }}>
          {content}
        </pre>
        <Button variant="ghost" size="icon-sm" onClick={handleCopy} className="absolute top-2 right-2" title="Copy">
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </div>
  )
}

function CopyCard({ text, children }: { text: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="group relative glass-card rounded-lg p-3 sm:p-4 border border-border/50 hover:border-primary/30 transition-all">
      <Button variant="ghost" size="icon-sm" onClick={handleCopy} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" title="Copy">
        {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
      </Button>
      {children}
    </div>
  )
}

function DetectionResult({ result }: { result: Record<string, unknown> }) {
  const overallScore = (result.overallScore as number) ?? 0
  const label = (result.label as string) ?? ""
  const sentences = (result.sentences as Array<{ text: string; score: number; label: string }>) ?? []
  const summary = (result.summary as string) ?? ""

  return (
    <div className="space-y-4 w-full max-w-full">
      <div className="glass-card rounded-lg p-4 sm:p-5 border border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3">
          <div className="shrink-0">
            <div className="text-3xl sm:text-4xl font-bold tracking-tight flex items-baseline gap-1">
              <span className={getScoreColor(overallScore)}>{overallScore}%</span>
            </div>
            <p className="text-xs text-muted mt-0.5">AI Probability</p>
          </div>
          <div className="flex-1 min-w-0 w-full">
            <ProgressBar value={overallScore} />
            <div className="flex justify-between text-[10px] text-muted mt-1">
              <span>Human</span>
              <span>AI</span>
            </div>
          </div>
          <div className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getLabelBadge(label).color}`}>
            {getLabelBadge(label).text}
          </div>
        </div>
        <p className="text-xs text-muted">{summary.replace("[Local Engine] ", "")}</p>
      </div>

      {sentences.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted">Sentence-Level Analysis ({sentences.length})</p>
          {sentences.map((s, i) => {
            const badge = getLabelBadge(s.label)
            return (
              <div key={i} className="glass-card rounded-lg p-3 border border-border/50">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs sm:text-sm leading-relaxed break-words flex-1 min-w-0">{s.text}</p>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className={`text-xs font-bold ${getScoreColor(s.score)}`}>{s.score}%</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.color}`}>{badge.text}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PlagiarismResult({ result }: { result: Record<string, unknown> }) {
  const originalityScore = (result.originalityScore as number) ?? 0
  const matchedSources = (result.matchedSources as Array<{ url: string; similarity: number }>) ?? []
  const summary = (result.summary as string) ?? ""
  const risk = originalityScore >= 80 ? "Low" : originalityScore >= 60 ? "Medium" : "High"
  const riskColor = originalityScore >= 80 ? "text-green-500" : originalityScore >= 60 ? "text-yellow-500" : "text-red-500"

  return (
    <div className="space-y-4 w-full max-w-full">
      <div className="glass-card rounded-lg p-4 sm:p-5 border border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3">
          <div className="shrink-0">
            <div className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: originalityScore >= 80 ? "#22c55e" : originalityScore >= 60 ? "#eab308" : "#ef4444" }}>
              {originalityScore}%
            </div>
            <p className="text-xs text-muted mt-0.5">Originality Score</p>
          </div>
          <div className="flex-1 min-w-0 w-full">
            <ProgressBar value={originalityScore} color={() => originalityScore >= 80 ? "bg-green-500" : originalityScore >= 60 ? "bg-yellow-500" : "bg-red-500"} />
            <div className="flex justify-between text-[10px] text-muted mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
          <div className={`shrink-0 text-xs sm:text-sm font-semibold ${riskColor}`}>
            {risk} Risk
          </div>
        </div>
        <p className="text-xs text-muted">{summary.replace("[Local Engine] ", "")}</p>
      </div>

      {matchedSources.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted">Matched Sources ({matchedSources.length})</p>
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 pr-3 text-muted font-medium">Source URL</th>
                  <th className="text-right py-2 text-muted font-medium whitespace-nowrap">Similarity</th>
                </tr>
              </thead>
              <tbody>
                {matchedSources.map((s, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="py-2 pr-3 break-all max-w-0">
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{s.url}</a>
                    </td>
                    <td className="py-2 text-right whitespace-nowrap">
                      <span className={s.similarity > 20 ? "text-red-500 font-medium" : "text-yellow-500"}>{s.similarity}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {originalityScore < 80 && (
        <div className="glass-card rounded-lg p-3 border border-yellow-500/30 bg-yellow-500/5">
          <p className="text-xs text-yellow-500 font-medium">Recommendation: Review flagged sources and rewrite matched content to improve originality.</p>
        </div>
      )}
    </div>
  )
}

function KeywordResult({ result }: { result: Record<string, unknown> }) {
  const keywords = (result.keywords as Array<{ keyword: string; volume: number; difficulty: number; cpc: string }>) ?? []
  const totalVolume = (result.totalVolume as number) ?? 0
  const avgDifficulty = (result.avgDifficulty as number) ?? 0
  const summary = (result.summary as string) ?? ""

  return (
    <div className="space-y-4 w-full max-w-full">
      <div className="flex flex-wrap gap-3 sm:gap-4">
        <div className="glass-card rounded-lg px-3 sm:px-4 py-2.5 border border-border/50">
          <p className="text-lg sm:text-xl font-bold">{keywords.length}</p>
          <p className="text-[10px] text-muted">Keywords</p>
        </div>
        <div className="glass-card rounded-lg px-3 sm:px-4 py-2.5 border border-border/50">
          <p className="text-lg sm:text-xl font-bold">{totalVolume.toLocaleString()}</p>
          <p className="text-[10px] text-muted">Total Volume</p>
        </div>
        <div className="glass-card rounded-lg px-3 sm:px-4 py-2.5 border border-border/50">
          <p className="text-lg sm:text-xl font-bold">{avgDifficulty}%</p>
          <p className="text-[10px] text-muted">Avg Difficulty</p>
        </div>
      </div>

      <div className="w-full max-w-full overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-2 pr-3 text-muted font-medium">Keyword</th>
              <th className="text-right py-2 pr-3 text-muted font-medium whitespace-nowrap">Volume</th>
              <th className="text-right py-2 pr-3 text-muted font-medium whitespace-nowrap">Difficulty</th>
              <th className="text-right py-2 text-muted font-medium whitespace-nowrap">CPC</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((k, i) => (
              <tr key={i} className="border-b border-border/30 hover:bg-background/50 transition-colors">
                <td className="py-2 pr-3 font-medium break-words max-w-0">{k.keyword}</td>
                <td className="py-2 pr-3 text-right whitespace-nowrap">{k.volume.toLocaleString()}</td>
                <td className="py-2 pr-3 text-right whitespace-nowrap">
                  <span className={k.difficulty >= 70 ? "text-red-500" : k.difficulty >= 40 ? "text-yellow-500" : "text-green-500"}>
                    {k.difficulty}%
                  </span>
                </td>
                <td className="py-2 text-right whitespace-nowrap">${Number(k.cpc).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted">{summary.replace("[Local Engine] ", "")}</p>
    </div>
  )
}

function TitlesResult({ result }: { result: Record<string, unknown> }) {
  const titles = (result.titles as Array<{ id: number; title: string; tone: string }>) ?? []
  const summary = (result.summary as string) ?? ""
  return (
    <div className="space-y-3 w-full max-w-full">
      <div className="grid gap-2">
        {titles.map((t) => (
          <CopyCard key={t.id} text={t.title}>
            <p className="text-xs sm:text-sm font-medium pr-8 break-words">{t.title}</p>
            <p className="text-[10px] text-muted mt-1">Tone: {t.tone}</p>
          </CopyCard>
        ))}
      </div>
      <p className="text-xs text-muted">{summary.replace("[Local Engine] ", "")}</p>
    </div>
  )
}

function DescriptionsResult({ result }: { result: Record<string, unknown> }) {
  const descriptions = (result.descriptions as Array<{ id: number; text: string; length: number }>) ?? []
  const summary = (result.summary as string) ?? ""
  return (
    <div className="space-y-3 w-full max-w-full">
      <div className="grid gap-2">
        {descriptions.map((d) => (
          <CopyCard key={d.id} text={d.text}>
            <p className="text-xs sm:text-sm leading-relaxed pr-8 break-words">{d.text}</p>
            <p className="text-[10px] text-muted mt-1">{d.length} characters</p>
          </CopyCard>
        ))}
      </div>
      <p className="text-xs text-muted">{summary.replace("[Local Engine] ", "")}</p>
    </div>
  )
}

function FaqResult({ result }: { result: Record<string, unknown> }) {
  const faqs = (result.faqs as Array<{ question: string; answer: string }>) ?? []
  const schema = (result.schema as string) ?? ""
  const summary = (result.summary as string) ?? ""
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-4 w-full max-w-full">
      <div className="space-y-1">
        {faqs.map((faq, i) => (
          <div key={i} className="glass-card rounded-lg border border-border/50 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 text-left hover:bg-background/50 transition-colors"
            >
              <span className="text-xs sm:text-sm font-medium break-words flex-1 min-w-0">{faq.question}</span>
              {openIndex === i ? <ChevronUp className="w-3.5 h-3.5 shrink-0 text-muted" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted" />}
            </button>
            {openIndex === i && (
              <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                <p className="text-xs sm:text-sm text-muted leading-relaxed break-words">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {schema && (
        <CodeBox content={schema} label="FAQ Schema (JSON-LD)" />
      )}

      <p className="text-xs text-muted">{summary.replace("[Local Engine] ", "")}</p>
    </div>
  )
}

function AuditResult({ result }: { result: Record<string, unknown> }) {
  const score = (result.score as number) ?? 0
  const issues = (result.issues as Array<{ severity: string; title: string; count: number }>) ?? []
  const checks = (result.checks as Array<{ name: string; status: string }>) ?? []
  const summary = (result.summary as string) ?? ""
  const scoreColor = score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500"
  const severityColors: Record<string, string> = { high: "text-red-500 bg-red-500/10 border-red-500/30", medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30", low: "text-green-500 bg-green-500/10 border-green-500/30" }

  return (
    <div className="space-y-4 w-full max-w-full">
      <div className="glass-card rounded-lg p-4 sm:p-5 border border-border/50">
        <div className="text-center sm:text-left sm:flex sm:items-center gap-4">
          <div className="text-4xl font-bold tracking-tight mb-2 sm:mb-0">
            <span className={scoreColor}>{score}</span>
            <span className="text-lg text-muted font-normal">/100</span>
          </div>
          <div className="flex-1">
            <ProgressBar value={score} color={() => score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"} />
            <p className="text-xs text-muted mt-2">{summary.replace("[Local Engine] ", "")}</p>
          </div>
        </div>
      </div>

      {issues.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted">Issues ({issues.length})</p>
          {issues.map((issue, i) => (
            <div key={i} className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 border ${severityColors[issue.severity] || "text-muted bg-background/50 border-border/30"}`}>
              <span className="text-xs font-medium break-words flex-1 min-w-0">{issue.title}</span>
              <span className="shrink-0 text-xs">{issue.count}</span>
            </div>
          ))}
        </div>
      )}

      {checks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted">Checks</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {checks.map((c, i) => (
              <div key={i} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 border border-border/30 bg-background/50">
                <span className="text-xs break-words flex-1 min-w-0">{c.name}</span>
                <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${c.status === "pass" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                  {c.status === "pass" ? "Pass" : "Fail"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RankingsResult({ result }: { result: Record<string, unknown> }) {
  const rankings = (result.rankings as Array<{ keyword: string; position: number; change: number; volume: number; url: string }>) ?? []
  const summary = (result.summary as string) ?? ""
  return (
    <div className="space-y-3 w-full max-w-full">
      <div className="w-full max-w-full overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-2 pr-3 text-muted font-medium">Keyword</th>
              <th className="text-right py-2 pr-3 text-muted font-medium whitespace-nowrap">Position</th>
              <th className="text-right py-2 pr-3 text-muted font-medium whitespace-nowrap">Change</th>
              <th className="text-right py-2 text-muted font-medium whitespace-nowrap">Volume</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((r, i) => (
              <tr key={i} className="border-b border-border/30">
                <td className="py-2 pr-3 font-medium break-words max-w-0">{r.keyword}</td>
                <td className="py-2 pr-3 text-right whitespace-nowrap">{r.position}</td>
                <td className={`py-2 pr-3 text-right whitespace-nowrap ${r.change > 0 ? "text-green-500" : r.change < 0 ? "text-red-500" : ""}`}>
                  {r.change > 0 ? `+${r.change}` : r.change}
                </td>
                <td className="py-2 text-right whitespace-nowrap">{r.volume.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">{summary.replace("[Local Engine] ", "")}</p>
    </div>
  )
}

function BacklinksResult({ result }: { result: Record<string, unknown> }) {
  const backlinks = (result.backlinks as Array<{ source: string; domainAuthority: number; type: string; anchorText: string; firstSeen: string }>) ?? []
  const totalBacklinks = (result.totalBacklinks as number) ?? 0
  const referringDomains = (result.referringDomains as number) ?? 0
  const summary = (result.summary as string) ?? ""
  return (
    <div className="space-y-4 w-full max-w-full">
      <div className="flex flex-wrap gap-3 sm:gap-4">
        <div className="glass-card rounded-lg px-3 sm:px-4 py-2.5 border border-border/50">
          <p className="text-lg sm:text-xl font-bold">{totalBacklinks.toLocaleString()}</p>
          <p className="text-[10px] text-muted">Total Backlinks</p>
        </div>
        <div className="glass-card rounded-lg px-3 sm:px-4 py-2.5 border border-border/50">
          <p className="text-lg sm:text-xl font-bold">{referringDomains.toLocaleString()}</p>
          <p className="text-[10px] text-muted">Referring Domains</p>
        </div>
      </div>
      <div className="w-full max-w-full overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-2 pr-3 text-muted font-medium">Source</th>
              <th className="text-right py-2 pr-3 text-muted font-medium whitespace-nowrap">DA</th>
              <th className="text-left py-2 pr-3 text-muted font-medium whitespace-nowrap">Type</th>
              <th className="text-left py-2 pr-3 text-muted font-medium whitespace-nowrap">Anchor</th>
              <th className="text-left py-2 text-muted font-medium whitespace-nowrap">Found</th>
            </tr>
          </thead>
          <tbody>
            {backlinks.map((b, i) => (
              <tr key={i} className="border-b border-border/30">
                <td className="py-2 pr-3 break-all max-w-0"><a href={b.source} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{b.source}</a></td>
                <td className="py-2 pr-3 text-right whitespace-nowrap">{b.domainAuthority}</td>
                <td className="py-2 pr-3 whitespace-nowrap"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${b.type === "dofollow" ? "bg-green-500/10 text-green-500" : "bg-muted/20 text-muted"}`}>{b.type}</span></td>
                <td className="py-2 pr-3 break-words max-w-0">{b.anchorText}</td>
                <td className="py-2 whitespace-nowrap text-muted">{b.firstSeen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">{summary.replace("[Local Engine] ", "")}</p>
    </div>
  )
}

function LinksResult({ result }: { result: Record<string, unknown> }) {
  const suggestions = (result.suggestions as Array<{ from: string; to: string; anchor: string; relevance: number }>) ?? []
  const totalOpportunities = (result.totalOpportunities as number) ?? 0
  const summary = (result.summary as string) ?? ""
  return (
    <div className="space-y-3 w-full max-w-full">
      <div className="glass-card rounded-lg px-3 sm:px-4 py-2.5 border border-border/50 inline-block">
        <p className="text-lg sm:text-xl font-bold">{totalOpportunities}</p>
        <p className="text-[10px] text-muted">Total Opportunities</p>
      </div>
      <div className="w-full max-w-full overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-2 pr-3 text-muted font-medium">From</th>
              <th className="text-left py-2 pr-3 text-muted font-medium">To</th>
              <th className="text-left py-2 pr-3 text-muted font-medium">Anchor</th>
              <th className="text-right py-2 text-muted font-medium whitespace-nowrap">Relevance</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((s, i) => (
              <tr key={i} className="border-b border-border/30">
                <td className="py-2 pr-3 break-all max-w-0 font-mono text-[10px]">{s.from}</td>
                <td className="py-2 pr-3 break-all max-w-0 font-mono text-[10px]">{s.to}</td>
                <td className="py-2 pr-3 break-words max-w-0">{s.anchor}</td>
                <td className="py-2 text-right whitespace-nowrap">{s.relevance}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">{summary.replace("[Local Engine] ", "")}</p>
    </div>
  )
}

function TopicalMapResult({ result }: { result: Record<string, unknown> }) {
  const clusters = (result.clusters as Array<{ pillar: string; subtopics: string[] }>) ?? []
  const totalClusters = (result.totalClusters as number) ?? 0
  const totalSubtopics = (result.totalSubtopics as number) ?? 0
  const summary = (result.summary as string) ?? ""
  return (
    <div className="space-y-4 w-full max-w-full">
      <div className="flex flex-wrap gap-3 sm:gap-4">
        <div className="glass-card rounded-lg px-3 sm:px-4 py-2.5 border border-border/50">
          <p className="text-lg sm:text-xl font-bold">{totalClusters}</p>
          <p className="text-[10px] text-muted">Clusters</p>
        </div>
        <div className="glass-card rounded-lg px-3 sm:px-4 py-2.5 border border-border/50">
          <p className="text-lg sm:text-xl font-bold">{totalSubtopics}</p>
          <p className="text-[10px] text-muted">Subtopics</p>
        </div>
      </div>
      {clusters.map((cluster, i) => (
        <div key={i} className="glass-card rounded-lg p-3 sm:p-4 border border-border/50">
          <p className="text-xs sm:text-sm font-semibold mb-2 break-words">{cluster.pillar}</p>
          <div className="flex flex-wrap gap-1.5">
            {cluster.subtopics.map((st, j) => (
              <span key={j} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 break-words">{st}</span>
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-muted">{summary.replace("[Local Engine] ", "")}</p>
    </div>
  )
}

function GrammarResult({ result }: { result: Record<string, unknown> }) {
  const corrected = (result.corrected as string) ?? ""
  const issues = (result.issues as Array<{ type: string; text: string; suggestion: string }>) ?? []
  const score = (result.score as number) ?? 0
  const summary = (result.summary as string) ?? ""
  return (
    <div className="space-y-4 w-full max-w-full">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold" style={{ color: score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444" }}>{score}</div>
        <ProgressBar value={score} color={() => score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"} />
      </div>

      {corrected && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted">Corrected Text</p>
          <div className="w-full max-w-full overflow-x-auto whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed bg-background/50 border border-border rounded-lg p-3">
            {corrected}
          </div>
        </div>
      )}

      {issues.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted">Issues ({issues.length})</p>
          {issues.map((issue, i) => (
            <div key={i} className="glass-card rounded-lg p-3 border border-border/50">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 capitalize">{issue.type}</span>
                  </div>
                  <p className="text-xs break-words">{issue.text}</p>
                  <p className="text-[10px] text-muted mt-0.5">Suggestion: <span className="text-green-500">{issue.suggestion}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted">{summary.replace("[Local Engine] ", "")}</p>
    </div>
  )
}

export function ToolResult({ title = "Result", resultType, result, wordCount, loading = false, onSave, onClear }: ToolResultProps) {
  const { profile } = useAuth()
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const extractTextForCopy = useCallback((): string => {
    if (!result) return ""
    if (typeof result === "string") return result

    const r = result as Record<string, unknown>

    const detectResult = r as { overallScore?: number; label?: string; sentences?: Array<{ text: string; score: number; label: string }>; summary?: string }
    if (detectResult.overallScore !== undefined) {
      let text = `AI Detection Report\n\nOverall Score: ${detectResult.overallScore}% - ${detectResult.label || ""}\n\n`
      if (detectResult.sentences) {
        detectResult.sentences.forEach((s, i) => {
          text += `${i + 1}. [${s.score}% - ${s.label.toUpperCase()}] ${s.text}\n`
        })
      }
      if (detectResult.summary) text += `\n${detectResult.summary}`
      return text
    }

    const plagResult = r as { originalityScore?: number; matchedSources?: Array<{ url: string; similarity: number }>; summary?: string }
    if (plagResult.originalityScore !== undefined) {
      let text = `Plagiarism Check Report\n\nOriginality Score: ${plagResult.originalityScore}%\n\nMatched Sources:\n`
      if (plagResult.matchedSources) {
        plagResult.matchedSources.forEach(s => { text += `- ${s.url} (${s.similarity}%)\n` })
      }
      if (plagResult.summary) text += `\n${plagResult.summary}`
      return text
    }

    const kwResult = r as { keywords?: Array<{ keyword: string; volume: number; difficulty: number; cpc: string }>; summary?: string }
    if (kwResult.keywords) {
      let text = `Keyword Research Report\n\nKeyword | Volume | Difficulty | CPC\n`
      kwResult.keywords.forEach(k => { text += `${k.keyword} | ${k.volume} | ${k.difficulty}% | $${k.cpc}\n` })
      if (kwResult.summary) text += `\n${kwResult.summary}`
      return text
    }

    const titlesResult = r as { titles?: Array<{ title: string }>; summary?: string }
    if (titlesResult.titles) {
      let text = `SEO Titles\n\n`
      titlesResult.titles.forEach(t => { text += `${t.title}\n` })
      if (titlesResult.summary) text += `\n${titlesResult.summary}`
      return text
    }

    const descResult = r as { descriptions?: Array<{ text: string }>; summary?: string }
    if (descResult.descriptions) {
      let text = `Meta Descriptions\n\n`
      descResult.descriptions.forEach(d => { text += `${d.text}\n---\n` })
      if (descResult.summary) text += `\n${descResult.summary}`
      return text
    }

    const faqResult = r as { faqs?: Array<{ question: string; answer: string }>; schema?: string; summary?: string }
    if (faqResult.faqs) {
      let text = `FAQs\n\n`
      faqResult.faqs.forEach(f => { text += `Q: ${f.question}\nA: ${f.answer}\n\n` })
      if (faqResult.schema) text += `\nSchema:\n${faqResult.schema}`
      return text
    }

    const auditResult = r as { url?: string; score?: number; issues?: Array<{ severity: string; title: string; count: number }>; summary?: string }
    if (auditResult.score !== undefined && auditResult.issues) {
      let text = `Website Audit Report for ${auditResult.url || "N/A"}\n\nScore: ${auditResult.score}/100\n\nIssues:\n`
      auditResult.issues.forEach(i => { text += `[${i.severity.toUpperCase()}] ${i.title} (${i.count})\n` })
      if (auditResult.summary) text += `\n${auditResult.summary}`
      return text
    }

    if (r.summary && typeof r.summary === "string" && !titlesResult.titles && !descResult.descriptions && !faqResult.faqs) return r.summary as string

    return JSON.stringify(r, null, 2)
  }, [result])

  const handleCopy = useCallback(async () => {
    const text = extractTextForCopy()
    if (text) {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [extractTextForCopy])

  const handleSave = useCallback(async () => {
    if (!onSave || !profile) return
    setSaving(true)
    try {
      const ok = await onSave()
      setSaved(ok)
      if (ok) setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }, [onSave, profile])

  const renderBody = () => {
    if (!result) return null
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted" />
        </div>
      )
    }

    if (typeof result === "string") {
      if (resultType === "schema" || resultType === "sitemap" || resultType === "robots") {
        return <CodeBox content={result} />
      }
      return (
        <div className="w-full max-w-full overflow-x-auto whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed bg-background/50 border border-border rounded-lg p-3 sm:p-4" style={{ maxHeight: "500px" }}>
          {result}
        </div>
      )
    }

    const r = result as Record<string, unknown>

    switch (resultType) {
      case "detection":
        return <DetectionResult result={r} />
      case "plagiarism":
        return <PlagiarismResult result={r} />
      case "keywords":
        return <KeywordResult result={r} />
      case "titles":
        return <TitlesResult result={r} />
      case "descriptions":
        return <DescriptionsResult result={r} />
      case "faq":
        return <FaqResult result={r} />
      case "audit":
        return <AuditResult result={r} />
      case "rankings":
        return <RankingsResult result={r} />
      case "backlinks":
        return <BacklinksResult result={r} />
      case "links":
        return <LinksResult result={r} />
      case "topical-map":
        return <TopicalMapResult result={r} />
      case "grammar":
        return <GrammarResult result={r} />
      default:
        return (
          <div className="w-full max-w-full overflow-x-auto whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed bg-background/50 border border-border rounded-lg p-3 sm:p-4 font-mono" style={{ maxHeight: "500px" }}>
            {JSON.stringify(result, null, 2)}
          </div>
        )
    }
  }

  if (!result && !loading) return null

  return (
    <div className="glass-card rounded-xl overflow-hidden w-full max-w-full">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border/50">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-xs sm:text-sm font-semibold truncate">{title}</h2>
          {wordCount !== undefined && wordCount > 0 && (
            <span className="text-[10px] text-muted shrink-0">({wordCount} words)</span>
          )}
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <Button variant="ghost" size="icon-sm" onClick={handleCopy} title="Copy to clipboard">
            {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </Button>
          {profile ? (
            onSave && (
              <Button variant="ghost" size="icon-sm" onClick={handleSave} disabled={saving} title="Save to documents">
                {saving ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" /> : <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </Button>
            )
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon-sm" title="Login to save history">
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </Link>
          )}
          {onClear && (
            <Button variant="ghost" size="icon-sm" onClick={onClear} title="Clear">
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="p-3 sm:p-4 w-full max-w-full overflow-hidden">
        {result ? renderBody() : (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="text-center max-w-sm">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-muted mx-auto mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm font-medium">Ready</p>
              <p className="text-[10px] sm:text-xs text-muted mt-1">Fill in the fields and click Generate to use this tool</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
