// Domain Intelligence Service — orchestrates all providers and aggregates results
// This is the single entry point for the API route and page components

import type {
  DomainInput, DomainOverview, GrowthDataPoint, CountryRow,
  KeywordRow, KeywordOverview, CompetitorRow, BacklinkRow,
  ReferringDomain, TechnicalSEO, Recommendation, AISearchMetrics,
  ProviderStatus, KeywordFilters, PaginationState,
} from "./domain-intelligence.types"
import type { ProviderResult } from "./provider.interface"
import { SemrushProvider } from "./semrush.provider"
import { PageSpeedProvider } from "./pagespeed.provider"
import { LocalTechnicalProvider } from "./local-technical.provider"
import { cacheGet, cacheSet, TTL, cacheClear } from "./cache.service"
import { getCacheKey } from "./domain-normalizer"

// Provider instances (singleton)
let semrush: SemrushProvider | null = null
let pageSpeed: PageSpeedProvider | null = null
let localTech: LocalTechnicalProvider | null = null

async function getProviders() {
  if (!semrush) {
    semrush = new SemrushProvider()
    await semrush.init()
  }
  if (!pageSpeed) pageSpeed = new PageSpeedProvider()
  if (!localTech) localTech = new LocalTechnicalProvider()
  return { semrush, pageSpeed, localTech }
}

export interface DomainAnalysisResult {
  overview: DomainOverview
  growth: GrowthDataPoint[]
  countries: CountryRow[]
  keywords: KeywordRow[]
  competitors: CompetitorRow[]
  backlinks: BacklinkRow[]
  referringDomains: ReferringDomain[]
  technical: TechnicalSEO
  recommendations: Recommendation[]
  aiSearch: AISearchMetrics
  providerStatus: ProviderStatus[]
}

export const domainIntelligenceService = {
  async analyze(input: DomainInput): Promise<DomainAnalysisResult> {
    const providers = await getProviders()
    const cacheKey = getCacheKey(input, "full")
    const cached = cacheGet<DomainAnalysisResult>(cacheKey)
    if (cached) return cached

    // Run independent providers in parallel
    const [overviewResult, competitorsResult, technicalResult, backlinksResult] = await Promise.all([
      providers.semrush.enabled
        ? providers.semrush.getOverview(input)
        : Promise.resolve<ProviderResult<DomainOverview>>({ data: null, error: "Semrush not configured", provider: "semrush", latencyMs: 0 }),
      providers.semrush.enabled
        ? providers.semrush.getCompetitors(input)
        : Promise.resolve<ProviderResult<CompetitorRow[]>>({ data: null, error: "Semrush not configured", provider: "semrush", latencyMs: 0 }),
      providers.localTech.analyze(`${input.rootDomain}`),
      providers.semrush.enabled
        ? providers.semrush.getBacklinks(input.rootDomain, { page: 1, pageSize: 20, total: 0, totalPages: 0 })
        : Promise.resolve<ProviderResult<{ backlinks: BacklinkRow[]; total: number }>>({ data: null, error: "Semrush not configured", provider: "semrush", latencyMs: 0 }),
    ])

    // Run PageSpeed in parallel with local (PageSpeed is slower)
    const pagespeedResult = await providers.pageSpeed.analyze(`https://${input.rootDomain}`)

    // Merge technical SEO: PageSpeed + local
    const technical = mergeTechnical(technicalResult.data, pagespeedResult.data)

    // Generate recommendations from both sources
    const [localRecs, pagespeedRecs] = await Promise.all([
      providers.localTech.getRecommendations(technical, input.rootDomain),
      pagespeedResult.data ? providers.pageSpeed.getRecommendations(pagespeedResult.data, input.rootDomain) : Promise.resolve<ProviderResult<Recommendation[]>>({ data: [], error: null, provider: "pagespeed", latencyMs: 0 }),
    ])
    const recommendations = dedupeRecommendations([
      ...(localRecs.data || []),
      ...(pagespeedRecs.data || []),
    ])

    // Build overview — use Semrush data if available, mark rest unavailable
    const overview = overviewResult.data || buildEmptyOverview()

    // Growth — Semrush returns null for non-business tiers
    const growthResult = await (providers.semrush.enabled && overviewResult.data
      ? providers.semrush.getGrowth(input)
      : Promise.resolve<ProviderResult<GrowthDataPoint[]>>({ data: null, error: null, provider: "semrush", latencyMs: 0 }))

    // Countries
    const countriesResult = await (providers.semrush.enabled && overviewResult.data
      ? providers.semrush.getCountries(input)
      : Promise.resolve<ProviderResult<CountryRow[]>>({ data: [], error: null, provider: "semrush", latencyMs: 0 }))

    const aiSearch: AISearchMetrics = {
      aiVisibility: null,
      aiMentions: null,
      citedPages: null,
      citedDomains: null,
      lastUpdated: null,
    }

    const providerStatus: ProviderStatus[] = [
      {
        provider: "semrush",
        connected: providers.semrush.enabled,
        lastError: providers.semrush.enabled ? null : "Not configured — add API key in Admin > Providers > Semrush",
        unitsUsed: null,
        unitsLimit: null,
        estimatedCost: null,
      },
      {
        provider: "pagespeed",
        connected: true,
        lastError: pagespeedResult.error,
        unitsUsed: null,
        unitsLimit: null,
        estimatedCost: null,
      },
      {
        provider: "local",
        connected: true,
        lastError: technicalResult.error,
        unitsUsed: null,
        unitsLimit: null,
        estimatedCost: null,
      },
    ]

    const result: DomainAnalysisResult = {
      overview,
      growth: growthResult.data || [],
      countries: countriesResult.data || [],
      keywords: [],
      competitors: competitorsResult.data || [],
      backlinks: backlinksResult.data?.backlinks || [],
      referringDomains: backlinksResult.data ? [] : [],
      technical,
      recommendations,
      aiSearch,
      providerStatus,
    }

    cacheSet(cacheKey, result, TTL.SEMRUSH)
    return result
  },

  async getKeywordOverview(keyword: string, country: string): Promise<KeywordOverview | null> {
    const providers = await getProviders()
    if (!providers.semrush.enabled) return null
    const result = await providers.semrush.getKeywordOverview(keyword, country)
    return result.data
  },

  async getKeywords(
    domain: string,
    filters: KeywordFilters,
    pagination: PaginationState,
    sort: { field: string; direction: "asc" | "desc" }
  ): Promise<{ keywords: KeywordRow[]; total: number } | null> {
    const providers = await getProviders()
    if (!providers.semrush.enabled) return null
    const result = await providers.semrush.getKeywords(domain, filters, pagination, sort)
    return result.data
  },

  async getProviderStatus(): Promise<ProviderStatus[]> {
    const providers = await getProviders()
    return Promise.all([
      providers.semrush.getStatus(),
      Promise.resolve<ProviderStatus>({
        provider: "pagespeed",
        connected: true,
        lastError: null,
        unitsUsed: null,
        unitsLimit: null,
        estimatedCost: null,
      }),
      Promise.resolve<ProviderStatus>({
        provider: "local",
        connected: true,
        lastError: null,
        unitsUsed: null,
        unitsLimit: null,
        estimatedCost: null,
      }),
    ])
  },

  async saveReport(input: DomainInput, result: DomainAnalysisResult, userId: string): Promise<string | null> {
    // Save to Supabase — called from API route with auth
    const { supabaseAdmin } = await import("@/lib/supabase/admin")
    const { data, error } = await supabaseAdmin
      .from("domain_reports")
      .insert({
        user_id: userId,
        domain: input.rootDomain,
        input_json: input,
        overview_json: result.overview,
        growth_json: result.growth,
        countries_json: result.countries,
        competitors_json: result.competitors,
        backlinks_json: result.backlinks,
        technical_json: result.technical,
        recommendations_json: result.recommendations,
        ai_search_json: result.aiSearch,
      })
      .select("id")
      .single()
    if (error) throw new Error(`Failed to save report: ${error.message}`)
    return data.id
  },

  async listSavedReports(userId: string): Promise<unknown[]> {
    const { supabaseAdmin } = await import("@/lib/supabase/admin")
    const { data, error } = await supabaseAdmin
      .from("domain_reports")
      .select("id, domain, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)
    if (error) throw new Error(`Failed to list reports: ${error.message}`)
    return data || []
  },

  clearCache(domain?: string) {
    if (domain) cacheClear(domain)
    else cacheClear()
  },
}

// === Helpers ===

function mergeTechnical(local: TechnicalSEO | null, pagespeed: TechnicalSEO | null): TechnicalSEO {
  if (!local && !pagespeed) {
    return {
      performance: null, accessibility: null, bestPractices: null, seo: null,
      cls: null, lcp: null, inp: null, fcp: null, ttfb: null,
      https: null, title: null, metaDescription: null, canonical: null,
      robots: null, hasSitemap: null, hasSchema: null, mobileUsable: null,
      source: null,
    }
  }
  const base = local || pagespeed!
  const ps = pagespeed || {}
  return {
    performance: (ps as TechnicalSEO).performance ?? base.performance,
    accessibility: (ps as TechnicalSEO).accessibility ?? base.accessibility,
    bestPractices: (ps as TechnicalSEO).bestPractices ?? base.bestPractices,
    seo: (ps as TechnicalSEO).seo ?? base.seo,
    cls: (ps as TechnicalSEO).cls ?? base.cls,
    lcp: (ps as TechnicalSEO).lcp ?? base.lcp,
    inp: (ps as TechnicalSEO).inp ?? base.inp,
    fcp: (ps as TechnicalSEO).fcp ?? base.fcp,
    ttfb: (ps as TechnicalSEO).ttfb ?? base.ttfb,
    https: base.https,
    title: base.title || (ps as TechnicalSEO).title,
    metaDescription: base.metaDescription || (ps as TechnicalSEO).metaDescription,
    canonical: base.canonical || (ps as TechnicalSEO).canonical,
    robots: base.robots || (ps as TechnicalSEO).robots,
    hasSitemap: base.hasSitemap ?? (ps as TechnicalSEO).hasSitemap,
    hasSchema: base.hasSchema ?? (ps as TechnicalSEO).hasSchema,
    mobileUsable: base.mobileUsable ?? (ps as TechnicalSEO).mobileUsable,
    source: "merged",
  }
}

function buildEmptyOverview(): DomainOverview {
  const unavailable = (label: string): DomainOverview[keyof DomainOverview] => ({
    label,
    value: null,
    change: null,
    changeLabel: null,
    source: null,
    status: "unavailable",
    tooltip: "Semrush not configured — add API key in Admin",
  })
  return {
    authorityScore: unavailable("Authority Score"),
    organicTraffic: unavailable("Organic Traffic"),
    paidTraffic: unavailable("Paid Traffic"),
    organicKeywords: unavailable("Organic Keywords"),
    paidKeywords: unavailable("Paid Keywords"),
    backlinks: unavailable("Backlinks"),
    referringDomains: unavailable("Referring Domains"),
    trafficShare: unavailable("Traffic Share"),
    aiVisibility: unavailable("AI Visibility"),
    aiMentions: unavailable("AI Mentions"),
    citedPages: unavailable("Cited Pages"),
  }
}

function dedupeRecommendations(recs: Recommendation[]): Recommendation[] {
  const seen = new Set<string>()
  return recs.filter(r => {
    const key = `${r.priority}:${r.issue}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
