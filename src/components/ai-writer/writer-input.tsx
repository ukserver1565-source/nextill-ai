"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Settings2 } from "lucide-react"

export interface WriterFormData {
  topic: string
  primaryKeyword: string
  secondaryKeywords: string
  language: string
  country: string
  audience: string
  writingStyle: string
  tone: string
  wordCount: number
  articleType: string
  creativity: number
  temperature: number
  brandVoice: string
  pointOfView: string
  faqCount: number
  includeTables: boolean
  includeLists: boolean
  includeStatistics: boolean
  includeInternalLinks: boolean
  includeExternalLinks: boolean
}

const DEFAULT_FORM: WriterFormData = {
  topic: "",
  primaryKeyword: "",
  secondaryKeywords: "",
  language: "English",
  country: "US",
  audience: "General audience",
  writingStyle: "Professional",
  tone: "Informative",
  wordCount: 800,
  articleType: "seo-blog",
  creativity: 5,
  temperature: 0.7,
  brandVoice: "",
  pointOfView: "third",
  faqCount: 3,
  includeTables: true,
  includeLists: true,
  includeStatistics: true,
  includeInternalLinks: true,
  includeExternalLinks: true,
}

const ARTICLE_TYPES = [
  { value: "seo-blog", label: "SEO Blog Post" },
  { value: "affiliate", label: "Affiliate Article" },
  { value: "review", label: "Product Review" },
  { value: "comparison", label: "Comparison" },
  { value: "best-list", label: "Best X List" },
  { value: "news", label: "News Article" },
  { value: "landing-page", label: "Landing Page" },
  { value: "product-description", label: "Product Description" },
  { value: "category-description", label: "Category Description" },
  { value: "tutorial", label: "Tutorial" },
  { value: "how-to", label: "How-To Guide" },
  { value: "faq", label: "FAQ Page" },
  { value: "case-study", label: "Case Study" },
  { value: "email", label: "Email" },
  { value: "social-post", label: "Social Media Post" },
  { value: "linkedin", label: "LinkedIn Post" },
  { value: "facebook", label: "Facebook Post" },
  { value: "instagram", label: "Instagram Caption" },
  { value: "tweet", label: "Tweet / X Post" },
  { value: "script", label: "Video Script" },
  { value: "press-release", label: "Press Release" },
]

const STYLES = ["Professional", "Casual", "Academic", "Journalistic", "Technical", "Creative", "Conversational", "Luxury", "Minimalist"]
const TONES = ["Informative", "Persuasive", "Inspirational", "Humorous", "Authoritative", "Empathetic", "Bold", "Neutral", "Warm", "Playful"]
const LANGUAGES = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Japanese", "Chinese", "Korean", "Arabic", "Hindi"]
const COUNTRIES = ["US", "UK", "CA", "AU", "DE", "FR", "ES", "IT", "NL", "BR", "JP", "CN", "KR", "IN", "AE"]
const POINTS_OF_VIEW = [
  { value: "first", label: "First Person (I, We)" },
  { value: "second", label: "Second Person (You)" },
  { value: "third", label: "Third Person (He/She/It/They)" },
]

interface WriterInputProps {
  onGenerate: (data: WriterFormData) => void
  loading: boolean
  disabled: boolean
}

export function WriterInput({ onGenerate, loading, disabled }: WriterInputProps) {
  const [form, setForm] = useState<WriterFormData>(DEFAULT_FORM)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const update = (key: keyof WriterFormData, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const isValid = form.topic.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid && !loading) onGenerate(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs text-muted font-medium block">Topic <span className="text-danger">*</span></label>
        <textarea
          value={form.topic}
          onChange={e => update("topic", e.target.value)}
          placeholder="e.g. The Benefits of Meditation for Mental Health"
          rows={3}
          className="flex w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted font-medium block">Primary Keyword</label>
          <Input value={form.primaryKeyword} onChange={e => update("primaryKeyword", e.target.value)} placeholder="e.g. meditation benefits" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted font-medium block">Secondary Keywords</label>
          <Input value={form.secondaryKeywords} onChange={e => update("secondaryKeywords", e.target.value)} placeholder="e.g. stress relief, mindfulness" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted font-medium block">Article Type</label>
          <select value={form.articleType} onChange={e => update("articleType", e.target.value)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            {ARTICLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted font-medium block">Word Count</label>
          <input type="range" min={100} max={5000} step={100} value={form.wordCount} onChange={e => update("wordCount", Number(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-border accent-primary mt-2" />
          <div className="flex justify-between text-[10px] text-muted"><span>100</span><span className="text-primary font-medium">{form.wordCount}</span><span>5000</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted font-medium block">Writing Style</label>
          <select value={form.writingStyle} onChange={e => update("writingStyle", e.target.value)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted font-medium block">Tone</label>
          <select value={form.tone} onChange={e => update("tone", e.target.value)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            {TONES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted font-medium block">Language</label>
          <select value={form.language} onChange={e => update("language", e.target.value)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted font-medium block">Country</label>
          <select value={form.country} onChange={e => update("country", e.target.value)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted font-medium block">Target Audience</label>
        <Input value={form.audience} onChange={e => update("audience", e.target.value)} placeholder="e.g. Health-conscious adults, Marketing professionals" />
      </div>

      <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors">
        <Settings2 className="w-3.5 h-3.5" />
        Advanced Settings
        {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {showAdvanced && (
        <div className="space-y-3 pl-2 border-l-2 border-border/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted font-medium block">Creativity ({form.creativity}/10)</label>
              <input type="range" min={1} max={10} value={form.creativity} onChange={e => update("creativity", Number(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-border accent-primary" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted font-medium block">Temperature ({form.temperature})</label>
              <input type="range" min={0} max={2} step={0.1} value={form.temperature} onChange={e => update("temperature", Number(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-border accent-primary" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted font-medium block">Point of View</label>
            <select value={form.pointOfView} onChange={e => update("pointOfView", e.target.value)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              {POINTS_OF_VIEW.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted font-medium block">Brand Voice Guidelines</label>
            <textarea value={form.brandVoice} onChange={e => update("brandVoice", e.target.value)} placeholder="Describe your brand voice (e.g. 'We speak like a trusted expert - clear, confident, and approachable')" rows={2} className="flex w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.includeTables} onChange={e => update("includeTables", e.target.checked)} className="accent-primary" /> Include Tables</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.includeLists} onChange={e => update("includeLists", e.target.checked)} className="accent-primary" /> Include Lists</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.includeStatistics} onChange={e => update("includeStatistics", e.target.checked)} className="accent-primary" /> Include Stats</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.includeInternalLinks} onChange={e => update("includeInternalLinks", e.target.checked)} className="accent-primary" /> Internal Links</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.includeExternalLinks} onChange={e => update("includeExternalLinks", e.target.checked)} className="accent-primary" /> External Links</label>
            <div className="space-y-1.5">
              <label className="text-xs text-muted font-medium block">FAQ Count</label>
              <input type="number" min={0} max={20} value={form.faqCount} onChange={e => update("faqCount", Number(e.target.value))} className="flex h-8 w-20 rounded-lg border border-border bg-transparent px-2 py-1 text-xs" />
            </div>
          </div>
        </div>
      )}

      <Button type="submit" disabled={!isValid || loading || disabled} className="w-full gap-2" size="lg">
        {loading ? "Generating..." : "Generate Article"}
      </Button>
    </form>
  )
}

export { DEFAULT_FORM }
