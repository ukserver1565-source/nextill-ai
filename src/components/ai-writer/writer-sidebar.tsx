"use client"

import { Sparkles, FileText, Hash, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import type { SEOResult } from "@/lib/ai/seo"
import type { ReadabilityResult } from "@/lib/ai/readability"

interface WriterSidebarProps {
  seo: SEOResult | null
  readability: ReadabilityResult | null
  provider: string
  wordCount?: number
}

function ScoreRing({ value, size = 48 }: { value: number; size?: number }) {
  const color = value >= 80 ? "#22c55e" : value >= 60 ? "#eab308" : "#ef4444"
  const r = size / 2 - 4
  const circumference = 2 * Math.PI * r
  const offset = circumference - (value / 100) * circumference
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0.272 0 0)" strokeWidth="3" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize="10" fill="currentColor" fontWeight="bold">{value}</text>
    </svg>
  )
}

export function WriterSidebar({ seo, readability, provider, wordCount }: WriterSidebarProps) {
  return (
    <div className="space-y-4">
      {provider && (
        <div className={`glass-card rounded-lg p-3 border ${provider === "gemini" ? "border-primary/30" : "border-yellow-500/30 bg-yellow-500/5"}`}>
          <div className="flex items-center gap-2">
            <Sparkles className={`w-3.5 h-3.5 ${provider === "gemini" ? "text-primary" : "text-yellow-500"}`} />
            <p className="text-xs font-medium">
              {provider === "gemini" ? "Powered by Gemini" : "Running on Local Engine"}
            </p>
          </div>
          {provider !== "gemini" && (
            <p className="text-[10px] text-muted mt-1">Add API key from Admin Panel for premium quality.</p>
          )}
        </div>
      )}

      {wordCount !== undefined && (
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-muted" />
            <p className="text-xs text-muted">Word Count</p>
          </div>
          <p className="text-lg font-bold mt-1">{wordCount.toLocaleString()}</p>
        </div>
      )}

      {seo && (
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-3.5 h-3.5 text-muted" />
            <p className="text-xs font-semibold">SEO Analysis</p>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <ScoreRing value={seo.overallScore} />
            <div>
              <p className="text-xs font-medium">SEO Score</p>
              <p className={`text-xs ${seo.overallScore >= 80 ? "text-success" : seo.overallScore >= 60 ? "text-yellow-500" : "text-danger"}`}>
                {seo.overallScore >= 80 ? "Good" : seo.overallScore >= 60 ? "Needs Work" : "Poor"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {(seo.keywordDensity || []).length > 0 && (
              <div>
                <p className="text-[10px] text-muted mb-1">Keyword Density</p>
                {seo.keywordDensity.map(k => (
                  <div key={k.keyword} className="flex items-center justify-between text-[10px] py-0.5">
                    <span className="truncate max-w-[120px]">{k.keyword}</span>
                    <span className="text-muted">{k.density}% ({k.count})</span>
                  </div>
                ))}
              </div>
            )}

            {(seo.missingKeywords || []).length > 0 && (
              <div>
                <p className="text-[10px] text-muted mb-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-danger" /> Missing Keywords
                </p>
                {seo.missingKeywords.map(k => (
                  <p key={k} className="text-[10px] text-danger pl-4">{k}</p>
                ))}
              </div>
            )}

            {(seo.lsiKeywords || []).length > 0 && (
              <div>
                <p className="text-[10px] text-muted mb-1">LSI Keywords Found</p>
                <div className="flex flex-wrap gap-1">
                  {seo.lsiKeywords.slice(0, 8).map(k => (
                    <span key={k} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{k}</span>
                  ))}
                </div>
              </div>
            )}

            {(seo.suggestions || []).length > 0 && (
              <div>
                <p className="text-[10px] text-muted mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-yellow-500" /> Suggestions
                </p>
                {seo.suggestions.slice(0, 3).map((s, i) => (
                  <p key={i} className="text-[10px] text-yellow-500 leading-relaxed">{s}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {readability && (
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-muted" />
            <p className="text-xs font-semibold">Readability</p>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <ScoreRing value={readability.score} />
            <div>
              <p className="text-xs font-medium">Flesch Score</p>
              <p className="text-xs text-muted">{readability.level}</p>
            </div>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <div className="flex justify-between"><span className="text-muted">Avg Sentence</span><span>{readability.avgSentenceLength} words</span></div>
            <div className="flex justify-between"><span className="text-muted">Avg Paragraph</span><span>{readability.avgParagraphLength} words</span></div>
            <div className="flex justify-between"><span className="text-muted">Passive Voice</span><span className={readability.passiveVoice.count > 5 ? "text-yellow-500" : "text-success"}>{readability.passiveVoice.count} ({readability.passiveVoice.percentage}%)</span></div>
            <div className="flex justify-between"><span className="text-muted">Transition Words</span><span>{readability.transitionWords.count}</span></div>
            <div className="flex justify-between"><span className="text-muted">Long Sentences</span><span className={readability.longSentences > 5 ? "text-yellow-500" : "text-muted"}>{readability.longSentences}</span></div>
            <div className="flex justify-between"><span className="text-muted">Short Sentences</span><span className="text-muted">{readability.shortSentences}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
