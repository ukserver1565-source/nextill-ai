"use client"

import { Suspense, useState, useCallback, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Search, Download, Globe, Smartphone, Monitor, Loader2,
  Globe2, FileText, BarChart3, Users, Link2, Wrench,
  Brain, Lightbulb, ChevronDown, Copy, ExternalLink, Star,
  ArrowUpRight, TrendingUp, AlertTriangle, CheckCircle2,
  XCircle, Info, RefreshCw, Send, Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SummaryCards } from "@/components/domain-intelligence/summary-cards"
import type {
  DomainOverview as DomainOverviewType, GrowthDataPoint, CountryRow,
  KeywordRow, CompetitorRow, BacklinkRow, TechnicalSEO, Recommendation,
  ProviderStatus, TabId, KeywordFilters, PaginationState, GrowthTimeframe,
} from "@/lib/domain-intelligence/domain-intelligence.types"

const COUNTRIES = [
  { code: "us", name: "United States" }, { code: "gb", name: "United Kingdom" },
  { code: "ca", name: "Canada" }, { code: "au", name: "Australia" },
  { code: "de", name: "Germany" }, { code: "fr", name: "France" },
  { code: "es", name: "Spain" }, { code: "it", name: "Italy" },
  { code: "br", name: "Brazil" }, { code: "jp", name: "Japan" },
  { code: "in", name: "India" }, { code: "mx", name: "Mexico" },
  { code: "nl", name: "Netherlands" }, { code: "se", name: "Sweden" },
  { code: "global", name: "Global" },
]

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "growth", label: "Growth", icon: TrendingUp },
  { id: "countries", label: "Countries", icon: Globe2 },
  { id: "keywords", label: "Keywords", icon: Search },
  { id: "competitors", label: "Competitors", icon: Users },
  { id: "backlinks", label: "Backlinks", icon: Link2 },
  { id: "technical", label: "Technical SEO", icon: Wrench },
  { id: "ai-search", label: "AI Search", icon: Brain },
  { id: "recommendations", label: "Recommendations", icon: Lightbulb },
]

export default function DomainOverviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-6 h-6 animate-spin text-[#6D5EF5]" /></div>}>
      <DomainOverviewContent />
    </Suspense>
  )
}

function DomainOverviewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // State
  const [domain, setDomain] = useState(searchParams.get("domain") || "")
  const [mode, setMode] = useState<"root_domain" | "exact_url">("root_domain")
  const [country, setCountry] = useState("us")
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [providerStatus, setProviderStatus] = useState<ProviderStatus[]>([])

  // Results
  const [overview, setOverview] = useState<DomainOverviewType | null>(null)
  const [competitors, setCompetitors] = useState<CompetitorRow[]>([])
  const [backlinks, setBacklinks] = useState<BacklinkRow[]>([])
  const [technical, setTechnical] = useState<TechnicalSEO | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [growth, setGrowth] = useState<GrowthDataPoint[]>([])
  const [countries, setCountries] = useState<CountryRow[]>([])
  const [keywords, setKeywords] = useState<KeywordRow[]>([])
  const [analyzedDomain, setAnalyzedDomain] = useState("")

  // Keyword explorer state
  const [kwSearch, setKwSearch] = useState("")
  const [kwPage, setKwPage] = useState(1)
  const [kwFilters, setKwFilters] = useState<KeywordFilters>({
    intent: [], volumeMin: null, volumeMax: null, kdMin: null, kdMax: null,
    cpcMin: null, cpcMax: null, include: "", exclude: "", questionsOnly: false,
    matchType: "broad", language: "en",
  })

  const analyze = useCallback(async () => {
    if (!domain.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/domain-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim(), mode, country, device }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Analysis failed")
        return
      }

      setOverview(data.overview)
      setCompetitors(data.competitors || [])
      setBacklinks(data.backlinks || [])
      setTechnical(data.technical)
      setRecommendations(data.recommendations || [])
      setGrowth(data.growth || [])
      setCountries(data.countries || [])
      setKeywords(data.keywords || [])
      setProviderStatus(data.providerStatus || [])
      setAnalyzedDomain(data.input?.rootDomain || domain.trim())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error")
    } finally {
      setLoading(false)
    }
  }, [domain, mode, country, device])

  // Auto-analyze if domain in URL
  useEffect(() => {
    const d = searchParams.get("domain")
    if (d) {
      setDomain(d)
      analyze()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const exportCSV = useCallback(() => {
    if (!overview) return
    const rows = [["Metric", "Value", "Source"]]
    for (const card of Object.values(overview)) {
      rows.push([card.label, String(card.value ?? "—"), card.source ?? "—"])
    }
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `${analyzedDomain}-overview.csv`; a.click()
    URL.revokeObjectURL(url)
  }, [overview, analyzedDomain])

  return (
    <div className="space-y-6 pb-24">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-[#090B16]/90 backdrop-blur-xl border-b border-white/[0.04] -mx-4 px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-6 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
                <input
                  type="text"
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && analyze()}
                  placeholder="Enter domain (e.g., example.com)"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#151C2E]/80 border border-white/[0.06] rounded-xl text-sm text-white placeholder-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors"
                />
              </div>
              <select
                value={mode}
                onChange={e => setMode(e.target.value as "root_domain" | "exact_url")}
                className="px-3 py-2.5 bg-[#151C2E]/80 border border-white/[0.06] rounded-xl text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#6D5EF5]/50"
              >
                <option value="root_domain">Root Domain</option>
                <option value="exact_url">Exact URL</option>
              </select>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="px-3 py-2.5 bg-[#151C2E]/80 border border-white/[0.06] rounded-xl text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#6D5EF5]/50 hidden sm:block"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              <div className="hidden sm:flex items-center border border-white/[0.06] rounded-xl overflow-hidden">
                <button
                  onClick={() => setDevice("desktop")}
                  className={`p-2.5 transition-colors ${device === "desktop" ? "bg-[#6D5EF5]/20 text-[#6D5EF5]" : "text-[#A7B0C0] hover:text-white"}`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDevice("mobile")}
                  className={`p-2.5 transition-colors ${device === "mobile" ? "bg-[#6D5EF5]/20 text-[#6D5EF5]" : "text-[#A7B0C0] hover:text-white"}`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="gradient"
                onClick={analyze}
                disabled={loading || !domain.trim()}
                className="px-6"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                Analyze
              </Button>
              {overview && (
                <Button variant="glass" onClick={exportCSV} className="px-3">
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Provider status */}
          {providerStatus.length > 0 && (
            <div className="flex items-center gap-3 mt-2 text-[11px]">
              {providerStatus.map(ps => (
                <div key={ps.provider} className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${ps.connected ? "bg-emerald-400" : "bg-[#A7B0C0]/40"}`} />
                  <span className="text-[#A7B0C0] capitalize">{ps.provider}</span>
                  {!ps.connected && <span className="text-[#A7B0C0]/60">(not connected)</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Summary Cards */}
        {overview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <SummaryCards overview={overview} loading={loading} />
          </motion.div>
        )}

        {/* Tabs */}
        {overview && (
          <div className="border-b border-white/[0.06]">
            <div className="flex overflow-x-auto no-scrollbar gap-1">
              {TABS.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                      activeTab === tab.id
                        ? "text-[#6D5EF5] border-[#6D5EF5]"
                        : "text-[#A7B0C0] border-transparent hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "overview" && (
            <OverviewTab overview={overview} technical={technical} competitors={competitors} loading={loading} />
          )}
          {activeTab === "growth" && (
            <GrowthTab data={growth} />
          )}
          {activeTab === "countries" && (
            <CountriesTab data={countries} />
          )}
          {activeTab === "keywords" && (
            <KeywordsTab
              domain={analyzedDomain}
              keywords={keywords}
              filters={kwFilters}
              setFilters={setKwFilters}
              page={kwPage}
              setPage={setKwPage}
            />
          )}
          {activeTab === "competitors" && (
            <CompetitorsTab data={competitors} />
          )}
          {activeTab === "backlinks" && (
            <BacklinksTab data={backlinks} />
          )}
          {activeTab === "technical" && (
            <TechnicalTab data={technical} />
          )}
          {activeTab === "ai-search" && (
            <AISearchTab />
          )}
          {activeTab === "recommendations" && (
            <RecommendationsTab data={recommendations} />
          )}
        </div>
      </div>
    </div>
  )
}

// === Tab Components ===

function OverviewTab({ overview, technical, competitors, loading }: { overview: DomainOverviewType | null; technical: TechnicalSEO | null; competitors: CompetitorRow[]; loading: boolean }) {
  if (loading) return <div className="space-y-4">{Array.from({length: 3}).map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>

  return (
    <div className="space-y-6">
      {/* Technical SEO Summary */}
      {technical && (
        <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-[#6D5EF5]" />
            Technical SEO Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Performance", value: technical.performance, color: "from-blue-500 to-cyan-500" },
              { label: "Accessibility", value: technical.accessibility, color: "from-purple-500 to-pink-500" },
              { label: "Best Practices", value: technical.bestPractices, color: "from-emerald-500 to-green-500" },
              { label: "SEO", value: technical.seo, color: "from-amber-500 to-orange-500" },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke={`url(#grad-${item.label})`} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(item.value || 0) * 0.94} 100`} />
                    <defs><linearGradient id={`grad-${item.label}`}><stop offset="0%" stopColor="#6D5EF5" /><stop offset="100%" stopColor="#4CC9F0" /></linearGradient></defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{item.value ?? "—"}</span>
                  </div>
                </div>
                <span className="text-[11px] text-[#A7B0C0]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Web Vitals */}
      {technical && (technical.lcp || technical.cls || technical.inp) && (
        <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#4CC9F0]" />
            Core Web Vitals
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "LCP", value: technical.lcp, unit: "ms", good: (v: number) => v < 2500, warn: (v: number) => v < 4000 },
              { label: "CLS", value: technical.cls, unit: "", good: (v: number) => v < 0.1, warn: (v: number) => v < 0.25 },
              { label: "INP", value: technical.inp, unit: "ms", good: (v: number) => v < 200, warn: (v: number) => v < 500 },
              { label: "FCP", value: technical.fcp, unit: "ms", good: (v: number) => v < 1800, warn: (v: number) => v < 3000 },
            ].map(vit => (
              <div key={vit.label} className="bg-white/[0.02] rounded-lg p-4">
                <span className="text-[11px] text-[#A7B0C0] uppercase tracking-wider">{vit.label}</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-bold text-white">
                    {vit.value != null ? (vit.unit === "ms" ? Math.round(vit.value) : vit.value.toFixed(3)) : "—"}
                  </span>
                  {vit.unit && <span className="text-xs text-[#A7B0C0]">{vit.unit}</span>}
                </div>
                {vit.value != null && (
                  <span className={`text-[10px] font-medium mt-1 inline-block ${
                    vit.good(vit.value) ? "text-emerald-400" : vit.warn(vit.value) ? "text-amber-400" : "text-red-400"
                  }`}>
                    {vit.good(vit.value) ? "Good" : vit.warn(vit.value) ? "Needs Improvement" : "Poor"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Competitors */}
      {competitors.length > 0 && (
        <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#6D5EF5]" />
            Top Competitors
          </h3>
          <div className="space-y-2">
            {competitors.slice(0, 5).map((c, i) => (
              <div key={c.domain} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#A7B0C0] w-5">{i + 1}</span>
                  <span className="text-sm text-white">{c.domain}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#A7B0C0]">
                  {c.overlap != null && <span>{c.overlap} overlap</span>}
                  {c.organicTraffic != null && <span>{c.organicTraffic.toLocaleString()} traffic</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function GrowthTab({ data }: { data: GrowthDataPoint[] }) {
  if (!data.length) {
    return (
      <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl p-12 text-center">
        <TrendingUp className="w-8 h-8 text-[#A7B0C0]/40 mx-auto mb-3" />
        <p className="text-sm text-[#A7B0C0]">No historical data available</p>
        <p className="text-xs text-[#A7B0C0]/60 mt-1">Growth data requires Semrush Business tier or higher</p>
      </div>
    )
  }
  return (
    <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Growth Over Time</h3>
      <p className="text-xs text-[#A7B0C0]">Chart rendering would go here</p>
    </div>
  )
}

function CountriesTab({ data }: { data: CountryRow[] }) {
  if (!data.length) {
    return (
      <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl p-12 text-center">
        <Globe2 className="w-8 h-8 text-[#A7B0C0]/40 mx-auto mb-3" />
        <p className="text-sm text-[#A7B0C0]">No country distribution data available</p>
        <p className="text-xs text-[#A7B0C0]/60 mt-1">Connect Semrush to see country-level data</p>
      </div>
    )
  }
  return (
    <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Country Distribution</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left py-3 px-3 text-[11px] text-[#A7B0C0] font-medium uppercase">Country</th>
              <th className="text-right py-3 px-3 text-[11px] text-[#A7B0C0] font-medium uppercase">Traffic Share</th>
              <th className="text-right py-3 px-3 text-[11px] text-[#A7B0C0] font-medium uppercase">Keywords</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.countryCode} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="py-3 px-3 text-white">{row.country}</td>
                <td className="py-3 px-3 text-right text-[#A7B0C0]">{row.trafficShare != null ? `${row.trafficShare}%` : "—"}</td>
                <td className="py-3 px-3 text-right text-[#A7B0C0]">{row.keywords?.toLocaleString() ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function KeywordsTab({ domain, keywords, filters, setFilters, page, setPage }: {
  domain: string; keywords: KeywordRow[]; filters: KeywordFilters; setFilters: (f: KeywordFilters) => void; page: number; setPage: (p: number) => void
}) {
  const [copiedKw, setCopiedKw] = useState<string | null>(null)

  const copyKeyword = (kw: string) => {
    navigator.clipboard.writeText(kw)
    setCopiedKw(kw)
    setTimeout(() => setCopiedKw(null), 1500)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-[#6D5EF5]" />
          <span className="text-sm font-medium text-white">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={filters.include}
            onChange={e => setFilters({ ...filters, include: e.target.value })}
            placeholder="Include keywords..."
            className="px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-white placeholder-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50"
          />
          <input
            type="text"
            value={filters.exclude}
            onChange={e => setFilters({ ...filters, exclude: e.target.value })}
            placeholder="Exclude keywords..."
            className="px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-white placeholder-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50"
          />
          <select
            value={filters.matchType}
            onChange={e => setFilters({ ...filters, matchType: e.target.value as KeywordFilters["matchType"] })}
            className="px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-white focus:outline-none"
          >
            <option value="broad">Broad Match</option>
            <option value="exact">Exact Match</option>
            <option value="phrase">Phrase Match</option>
            <option value="related">Related</option>
          </select>
          <label className="flex items-center gap-2 text-xs text-[#A7B0C0] cursor-pointer">
            <input
              type="checkbox"
              checked={filters.questionsOnly}
              onChange={e => setFilters({ ...filters, questionsOnly: e.target.checked })}
              className="rounded border-white/20"
            />
            Questions only
          </label>
        </div>
      </div>

      {/* Keyword Table */}
      <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl overflow-hidden">
        {!keywords.length ? (
          <div className="p-12 text-center">
            <Search className="w-8 h-8 text-[#A7B0C0]/40 mx-auto mb-3" />
            <p className="text-sm text-[#A7B0C0]">No keyword data available</p>
            <p className="text-xs text-[#A7B0C0]/60 mt-1">Connect Semrush to see organic keywords for this domain</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-3 px-4 text-[11px] text-[#A7B0C0] font-medium uppercase">Keyword</th>
                  <th className="text-center py-3 px-3 text-[11px] text-[#A7B0C0] font-medium uppercase">Position</th>
                  <th className="text-right py-3 px-3 text-[11px] text-[#A7B0C0] font-medium uppercase">Volume</th>
                  <th className="text-right py-3 px-3 text-[11px] text-[#A7B0C0] font-medium uppercase">CPC</th>
                  <th className="text-center py-3 px-3 text-[11px] text-[#A7B0C0] font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map(kw => (
                  <tr key={kw.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-white">{kw.keyword}</span>
                      {kw.url && <span className="block text-[11px] text-[#A7B0C0]/60 truncate max-w-[300px]">{kw.url}</span>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {kw.position != null ? (
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                          kw.position <= 3 ? "bg-emerald-500/10 text-emerald-400" :
                          kw.position <= 10 ? "bg-blue-500/10 text-blue-400" :
                          "bg-white/5 text-[#A7B0C0]"
                        }`}>{kw.position}</span>
                      ) : "—"}
                    </td>
                    <td className="py-3 px-3 text-right text-[#A7B0C0]">{kw.volume?.toLocaleString() ?? "—"}</td>
                    <td className="py-3 px-3 text-right text-[#A7B0C0]">{kw.cpc != null ? `$${kw.cpc.toFixed(2)}` : "—"}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => copyKeyword(kw.keyword)}
                          className="p-1.5 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-white/[0.06] transition-colors"
                          title="Copy keyword"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`/post-generator?keyword=${encodeURIComponent(kw.keyword)}`}
                          className="p-1.5 rounded-lg text-[#A7B0C0] hover:text-[#6D5EF5] hover:bg-[#6D5EF5]/10 transition-colors"
                          title="Send to Post Generator"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function CompetitorsTab({ data }: { data: CompetitorRow[] }) {
  if (!data.length) {
    return (
      <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl p-12 text-center">
        <Users className="w-8 h-8 text-[#A7B0C0]/40 mx-auto mb-3" />
        <p className="text-sm text-[#A7B0C0]">No competitor data available</p>
        <p className="text-xs text-[#A7B0C0]/60 mt-1">Connect Semrush to see competitors</p>
      </div>
    )
  }
  return (
    <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-[#6D5EF5]" />
          Competitor Research
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left py-3 px-4 text-[11px] text-[#A7B0C0] font-medium uppercase">#</th>
              <th className="text-left py-3 px-3 text-[11px] text-[#A7B0C0] font-medium uppercase">Domain</th>
              <th className="text-right py-3 px-3 text-[11px] text-[#A7B0C0] font-medium uppercase">Overlap</th>
              <th className="text-right py-3 px-3 text-[11px] text-[#A7B0C0] font-medium uppercase">Common KWs</th>
              <th className="text-right py-3 px-3 text-[11px] text-[#A7B0C0] font-medium uppercase">Organic Traffic</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c, i) => (
              <tr key={c.domain} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4 text-[#A7B0C0]">{i + 1}</td>
                <td className="py-3 px-3 text-white font-medium">{c.domain}</td>
                <td className="py-3 px-3 text-right text-[#A7B0C0]">{c.overlap ?? "—"}</td>
                <td className="py-3 px-3 text-right text-[#A7B0C0]">{c.commonKeywords?.toLocaleString() ?? "—"}</td>
                <td className="py-3 px-3 text-right text-[#A7B0C0]">{c.organicTraffic?.toLocaleString() ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BacklinksTab({ data }: { data: BacklinkRow[] }) {
  if (!data.length) {
    return (
      <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl p-12 text-center">
        <Link2 className="w-8 h-8 text-[#A7B0C0]/40 mx-auto mb-3" />
        <p className="text-sm text-[#A7B0C0]">No backlink data available</p>
        <p className="text-xs text-[#A7B0C0]/60 mt-1">Connect Semrush to see backlinks</p>
      </div>
    )
  }
  return (
    <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Link2 className="w-4 h-4 text-[#6D5EF5]" />
          Backlinks
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left py-3 px-4 text-[11px] text-[#A7B0C0] font-medium uppercase">Source</th>
              <th className="text-left py-3 px-3 text-[11px] text-[#A7B0C0] font-medium uppercase">Anchor</th>
              <th className="text-center py-3 px-3 text-[11px] text-[#A7B0C0] font-medium uppercase">Type</th>
              <th className="text-right py-3 px-3 text-[11px] text-[#A7B0C0] font-medium uppercase">Authority</th>
            </tr>
          </thead>
          <tbody>
            {data.map(bl => (
              <tr key={bl.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4">
                  <a href={bl.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#4CC9F0] hover:underline flex items-center gap-1 max-w-[300px] truncate">
                    {bl.sourceDomain}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </td>
                <td className="py-3 px-3 text-[#A7B0C0] truncate max-w-[200px]">{bl.anchorText || "—"}</td>
                <td className="py-3 px-3 text-center">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    bl.type === "dofollow" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-[#A7B0C0]"
                  }`}>{bl.type}</span>
                </td>
                <td className="py-3 px-3 text-right text-[#A7B0C0]">{bl.authority ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TechnicalTab({ data }: { data: TechnicalSEO | null }) {
  if (!data) {
    return (
      <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl p-12 text-center">
        <Wrench className="w-8 h-8 text-[#A7B0C0]/40 mx-auto mb-3" />
        <p className="text-sm text-[#A7B0C0]">No technical data available</p>
        <p className="text-xs text-[#A7B0C0]/60 mt-1">Technical analysis runs automatically</p>
      </div>
    )
  }

  const checks = [
    { label: "HTTPS", ok: data.https, detail: data.https ? "Secure connection" : "Not using HTTPS" },
    { label: "Title Tag", ok: data.title === "Present", detail: data.title || "Not found" },
    { label: "Meta Description", ok: data.metaDescription === "Present", detail: data.metaDescription || "Not found" },
    { label: "Canonical", ok: data.canonical === "Present", detail: data.canonical || "Not found" },
    { label: "Robots", ok: data.robots?.includes("Crawlable"), detail: data.robots || "Unknown" },
    { label: "Sitemap", ok: data.hasSitemap, detail: data.hasSitemap ? "Found" : "Not found" },
    { label: "Schema Markup", ok: data.hasSchema, detail: data.hasSchema ? "Detected" : "Not detected" },
    { label: "Mobile Usable", ok: data.mobileUsable, detail: data.mobileUsable ? "Mobile-friendly" : "Viewport issues" },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#6D5EF5]" />
          Technical SEO Checks
        </h3>
        <div className="space-y-2">
          {checks.map(check => (
            <div key={check.label} className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-3">
                {check.ok ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : check.ok === false ? (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                ) : (
                  <Info className="w-5 h-5 text-[#A7B0C0] shrink-0" />
                )}
                <span className="text-sm text-white font-medium">{check.label}</span>
              </div>
              <span className={`text-xs ${check.ok ? "text-emerald-400" : check.ok === false ? "text-red-400" : "text-[#A7B0C0]"}`}>
                {check.detail}
              </span>
            </div>
          ))}
        </div>
      </div>

      {data.source && (
        <div className="text-center text-[11px] text-[#A7B0C0]/60">
          Source: {data.source} | {new Date().toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

function AISearchTab() {
  return (
    <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl p-12 text-center">
      <Brain className="w-8 h-8 text-[#A7B0C0]/40 mx-auto mb-3" />
      <p className="text-sm text-[#A7B0C0]">AI Search metrics not yet available</p>
      <p className="text-xs text-[#A7B0C0]/60 mt-1">This feature requires an AI search data provider. Check back soon.</p>
    </div>
  )
}

function RecommendationsTab({ data }: { data: Recommendation[] }) {
  if (!data.length) {
    return (
      <div className="bg-[#151C2E]/80 border border-white/[0.06] rounded-xl p-12 text-center">
        <Lightbulb className="w-8 h-8 text-[#A7B0C0]/40 mx-auto mb-3" />
        <p className="text-sm text-[#A7B0C0]">No recommendations yet</p>
        <p className="text-xs text-[#A7B0C0]/60 mt-1">Run an analysis to get SEO recommendations</p>
      </div>
    )
  }

  const priorityColors: Record<string, string> = {
    critical: "bg-red-500/10 text-red-400 border-red-500/20",
    high: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    low: "bg-white/5 text-[#A7B0C0] border-white/[0.06]",
  }

  return (
    <div className="space-y-3">
      {data.sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 }
        return (order[a.priority] ?? 4) - (order[b.priority] ?? 4)
      }).map(rec => (
        <div key={rec.id} className={`border rounded-xl p-4 ${priorityColors[rec.priority] || priorityColors.low}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">{rec.priority}</span>
                {rec.source && <span className="text-[10px] opacity-60">via {rec.source}</span>}
              </div>
              <h4 className="text-sm font-semibold text-white">{rec.issue}</h4>
              {rec.evidence && <p className="text-xs text-[#A7B0C0] mt-1">{rec.evidence}</p>}
              {rec.fix && <p className="text-xs text-[#A7B0C0] mt-2 italic">Fix: {rec.fix}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
