"use client"

import { useState, useCallback, useRef } from "react"
import { useAuth } from "@/lib/auth/AuthProvider"
import { WriterInput, type WriterFormData, DEFAULT_FORM } from "./writer-input"
import { WriterToolbar } from "./writer-toolbar"
import { WriterSkeleton } from "./writer-skeleton"
import { WriterError } from "./writer-error"
import { WriterSidebar } from "./writer-sidebar"
import { Sparkles, ChevronLeft, Save, LogIn, Check, Loader2, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { ParsedArticle } from "@/lib/ai/parser"
import type { SEOResult } from "@/lib/ai/seo"
import type { ReadabilityResult } from "@/lib/ai/readability"
import type { DownloadFormat } from "@/lib/ai/output"
import { copyToClipboard, triggerDownload } from "@/lib/ai/output"

interface HistoryItem {
  id: string
  title: string
  wordCount: number
  createdAt: string
}

export function AIWriterPage() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [article, setArticle] = useState<ParsedArticle | null>(null)
  const [html, setHtml] = useState("")
  const [seo, setSeo] = useState<SEOResult | null>(null)
  const [readability, setReadability] = useState<ReadabilityResult | null>(null)
  const [provider, setProvider] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [lastInput, setLastInput] = useState<WriterFormData | null>(null)

  const contentRef = useRef<HTMLDivElement>(null)

  const handleGenerate = useCallback(async (data: WriterFormData) => {
    setLoading(true)
    setError("")
    setArticle(null)
    setHtml("")
    setSeo(null)
    setReadability(null)
    setProvider("")
    setSaved(false)
    setLastInput(data)

    try {
      const res = await fetch("/api/ai-writer/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || "Generation failed")
        return
      }

      setArticle(result.article)
      setHtml(result.html || "")
      setSeo(result.seo)
      setReadability(result.readability)
      setProvider(result.provider)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRetry = useCallback(() => {
    if (lastInput) handleGenerate(lastInput)
  }, [lastInput, handleGenerate])

  const handleCopy = useCallback(() => {
    if (!article) return
    copyToClipboard(article.content || article.raw || "")
  }, [article])

  const handleDownload = useCallback((format: DownloadFormat) => {
    if (!article) return
    triggerDownload(article, format)
  }, [article])

  const handleSave = useCallback(async () => {
    if (!article || !profile) return
    setSaving(true)
    try {
      const res = await fetch("/api/ai-writer/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          content: article.content || article.raw,
          articleType: lastInput?.articleType || "seo-blog",
          wordCount: article.wordCount,
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          slug: article.slug,
          excerpt: article.excerpt,
          outline: article.outline,
          tags: article.tags,
          categories: article.categories,
          schemaJson: article.schemaJson,
          seoScore: seo?.overallScore,
          readabilityScore: readability?.score,
          settings: lastInput as unknown as Record<string, unknown>,
        }),
      })
      const data = await res.json()
      setSaved(data.success)
      if (data.success) setTimeout(() => setSaved(false), 3000)
    } catch {
      setSaved(false)
    } finally {
      setSaving(false)
    }
  }, [article, profile, lastInput, seo, readability])

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const res = await fetch("/api/ai-writer/load")
      const data = await res.json()
      if (data.success) setHistory(data.documents || [])
    } catch {
      // silent
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  const toggleHistory = useCallback(() => {
    if (!historyOpen) loadHistory()
    setHistoryOpen(!historyOpen)
  }, [historyOpen, loadHistory])

  const loadDocument = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/ai-writer/load?id=${id}`)
      const data = await res.json()
      if (!data.success || !data.document) return
      const doc = data.document
      setArticle(prev => prev ? { ...prev, title: doc.title, content: doc.html || "", markdown: "", raw: doc.html || "" } : null)
      setHtml(doc.html || "")
      setHistoryOpen(false)
    } catch {
      // silent
    }
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this document?")) return
    try {
      await fetch(`/api/ai-writer/delete?id=${id}`, { method: "DELETE" })
      loadHistory()
    } catch {
      // silent
    }
  }, [loadHistory])

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-muted hover:text-foreground transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">AI Writer</h1>
              <p className="text-xs sm:text-sm text-muted">Enterprise-grade content generation engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {profile && (
              <Button variant="ghost" size="sm" onClick={toggleHistory} className="gap-1.5">
                <History className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">History</span>
              </Button>
            )}
            {!profile && (
              <Link href="/login">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <LogIn className="w-3.5 h-3.5" /> Sign in to save
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="glass-card rounded-xl p-4 sm:p-5">
              <WriterInput onGenerate={handleGenerate} loading={loading} disabled={historyOpen} />
            </div>
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2">
            {(loading || error || article) && (
              <div className="glass-card rounded-xl overflow-hidden">
                {article && (
                  <WriterToolbar
                    onCopy={handleCopy}
                    onDownload={handleDownload}
                    canUndo={false}
                    canRedo={false}
                    hasContent={!!article}
                  />
                )}

                <div className="p-4 sm:p-5 max-w-full overflow-hidden">
                  {loading && !article && <WriterSkeleton />}

                  {error && (
                    <WriterError message={error} onRetry={handleRetry} onDismiss={() => setError("")} />
                  )}

                  {article && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight break-words">{article.title}</h2>
                        {article.metaTitle && (
                          <p className="text-xs text-muted mt-1 break-words">Meta: {article.metaTitle}</p>
                        )}
                      </div>

                      {article.metaDescription && (
                        <div className="text-xs text-muted bg-background/50 rounded-lg p-3 border border-border/50">
                          <span className="font-semibold text-foreground">Meta Description: </span>
                          {article.metaDescription}
                        </div>
                      )}

                      {article.excerpt && (
                        <div className="text-xs sm:text-sm italic text-muted border-l-2 border-primary/30 pl-3">
                          {article.excerpt}
                        </div>
                      )}

                      {article.outline.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted mb-2">Outline</p>
                          <div className="flex flex-wrap gap-1.5">
                            {article.outline.map((item, i) => (
                              <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 break-words">{item}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div ref={contentRef} className="w-full max-w-full overflow-x-auto break-words text-xs sm:text-sm leading-relaxed space-y-3">
                        {article.content.split("\n").map((line, i) => {
                          if (line.startsWith("### ")) return <h3 key={i} className="text-sm sm:text-base font-semibold mt-4 mb-1">{line.replace("### ", "")}</h3>
                          if (line.startsWith("## ")) return <h2 key={i} className="text-base sm:text-lg font-bold mt-5 mb-2">{line.replace("## ", "")}</h2>
                          if (line.startsWith("# ")) return <h1 key={i} className="text-lg sm:text-xl font-bold mt-6 mb-3">{line.replace("# ", "")}</h1>
                          if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="ml-4 list-disc text-xs sm:text-sm">{line.replace(/^[-*]\s+/, "")}</li>
                          if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-xs sm:text-sm">{line.replace(/^\d+\.\s+/, "")}</li>
                          if (line.trim() === "") return <div key={i} className="h-2" />
                          if (line.startsWith("|") && line.endsWith("|")) {
                            const cells = line.split("|").filter(Boolean)
                            if (cells.every(c => /^[-:\s]+$/.test(c))) return null
                            return (
                              <div key={i} className="flex gap-2 border-b border-border/30 py-1">
                                {cells.map((c, ci) => <span key={ci} className="text-[10px] sm:text-xs flex-1 break-words">{c.trim()}</span>)}
                              </div>
                            )
                          }
                          return <p key={i} className="text-xs sm:text-sm leading-relaxed">{line}</p>
                        })}
                      </div>

                      {article.faqs.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Frequently Asked Questions</p>
                          {article.faqs.map((faq, i) => (
                            <div key={i} className="glass-card rounded-lg p-3 border border-border/50">
                              <p className="text-xs sm:text-sm font-medium mb-1">{faq.question}</p>
                              <p className="text-xs text-muted">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {(article.pros.length > 0 || article.cons.length > 0) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {article.pros.length > 0 && (
                            <div className="glass-card rounded-lg p-3 border border-green-500/30 bg-green-500/5">
                              <p className="text-xs font-semibold text-success mb-2">Pros</p>
                              {article.pros.map((p, i) => <p key={i} className="text-xs py-0.5">+ {p}</p>)}
                            </div>
                          )}
                          {article.cons.length > 0 && (
                            <div className="glass-card rounded-lg p-3 border border-red-500/30 bg-red-500/5">
                              <p className="text-xs font-semibold text-danger mb-2">Cons</p>
                              {article.cons.map((c, i) => <p key={i} className="text-xs py-0.5">- {c}</p>)}
                            </div>
                          )}
                        </div>
                      )}

                      {article.conclusion && (
                        <div className="border-t border-border/50 pt-4">
                          <p className="text-xs font-semibold text-muted mb-2">Conclusion</p>
                          <p className="text-xs sm:text-sm leading-relaxed">{article.conclusion}</p>
                        </div>
                      )}

                      {article.cta && (
                        <div className="glass-card rounded-lg p-3 border border-primary/30 bg-primary/5 text-center">
                          <p className="text-xs sm:text-sm font-medium">{article.cta}</p>
                        </div>
                      )}

                      {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {article.tags.map((tag, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/20 text-muted border border-border/30">{tag}</span>
                          ))}
                        </div>
                      )}

                      {article.schemaJson && (
                        <details className="glass-card rounded-lg border border-border/50">
                          <summary className="text-xs font-medium px-3 py-2 cursor-pointer hover:bg-background/50">JSON-LD Schema</summary>
                          <pre className="p-3 text-[10px] font-mono overflow-x-auto whitespace-pre-wrap break-all bg-background/50 max-w-full">{article.schemaJson}</pre>
                        </details>
                      )}

                      {article.internalLinks.length > 0 && (
                        <div className="text-[10px] text-muted">
                          <p className="font-semibold mb-1">Internal Link Suggestions</p>
                          {article.internalLinks.map((l, i) => (
                            <p key={i} className="py-0.5">[{l.anchor}] → /{l.path}</p>
                          ))}
                        </div>
                      )}

                      {article.externalLinks.length > 0 && (
                        <div className="text-[10px] text-muted">
                          <p className="font-semibold mb-1">External Authority Suggestions</p>
                          {article.externalLinks.map((l, i) => (
                            <p key={i} className="py-0.5">[{l.anchor}] → ({l.url})</p>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted border-t border-border/50 pt-3">
                        <span>Provider: {provider}</span>
                        {article.readingTime > 0 && <span>· {article.readingTime} min read</span>}
                        {article.wordCount > 0 && <span>· {article.wordCount.toLocaleString()} words</span>}
                        {article.slug && <span>· /{article.slug}</span>}
                      </div>
                    </div>
                  )}
                </div>

                {article && profile && (
                  <div className="border-t border-border/50 px-4 sm:px-5 py-3 flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={handleSave} disabled={saving || saved} className="gap-1.5">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5 text-success" /> : <Save className="w-3.5 h-3.5" />}
                      {saved ? "Saved" : "Save Project"}
                    </Button>
                    <p className="text-[10px] text-muted">Autosave enabled</p>
                  </div>
                )}
              </div>
            )}

            {!loading && !error && !article && (
              <div className="flex items-center justify-center py-16 sm:py-24">
                <div className="text-center max-w-sm">
                  <Sparkles className="w-10 h-10 text-muted mx-auto mb-3" />
                  <p className="text-sm font-medium">Ready to Write</p>
                  <p className="text-xs text-muted mt-1">Fill in the form and click Generate Article to create professional content.</p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 order-3">
            {(seo || readability) && (
              <WriterSidebar seo={seo} readability={readability} provider={provider} wordCount={article?.wordCount} />
            )}
          </div>
        </div>
      </div>

      {historyOpen && profile && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setHistoryOpen(false)} />
          <div className="relative ml-auto w-full max-w-md bg-background border-l border-border h-full overflow-y-auto shadow-xl">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Project History</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setHistoryOpen(false)}>✕</Button>
            </div>
            <div className="p-4 space-y-2">
              {historyLoading && <p className="text-xs text-muted text-center py-4">Loading...</p>}
              {!historyLoading && history.length === 0 && (
                <p className="text-xs text-muted text-center py-4">No saved documents yet.</p>
              )}
              {history.map(item => (
                <div key={item.id} className="glass-card rounded-lg p-3 border border-border/50 hover:border-primary/30 cursor-pointer transition-all" onClick={() => loadDocument(item.id)}>
                  <p className="text-xs font-medium truncate">{item.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted mt-1">
                    <span>{item.wordCount?.toLocaleString() || 0} words</span>
                    <span>·</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(item.id) }}
                    className="text-[10px] text-danger hover:underline mt-1"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
