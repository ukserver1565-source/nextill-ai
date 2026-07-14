// Domain Intelligence — core types
// All nullable fields represent data that may come from a provider.
// null = "not available from any connected provider"

export type DeviceType = "desktop" | "mobile"
export type AnalysisMode = "root_domain" | "exact_url" | "subdomain"

export interface DomainInput {
  raw: string
  normalized: string
  rootDomain: string
  subdomain: string | null
  mode: AnalysisMode
  country: string        // ISO 3166-1 alpha-2, e.g. "us"
  language: string       // ISO 639-1, e.g. "en"
  device: DeviceType
  date: string           // ISO date string
  currency: string       // e.g. "usd"
}

export interface SummaryCard {
  label: string
  value: number | string | null
  change: number | null       // percentage change vs previous period
  changeLabel: string | null  // "vs previous 30 days" etc.
  source: string | null       // "semrush", "pagespeed", "local"
  status: "loading" | "available" | "unavailable" | "error"
  tooltip: string | null
}

export interface DomainOverview {
  authorityScore: SummaryCard
  organicTraffic: SummaryCard
  paidTraffic: SummaryCard
  organicKeywords: SummaryCard
  paidKeywords: SummaryCard
  backlinks: SummaryCard
  referringDomains: SummaryCard
  trafficShare: SummaryCard
  aiVisibility: SummaryCard
  aiMentions: SummaryCard
  citedPages: SummaryCard
}

export interface GrowthDataPoint {
  date: string
  organicTraffic: number | null
  paidTraffic: number | null
  organicKeywords: number | null
  paidKeywords: number | null
  backlinks: number | null
  referringDomains: number | null
  aiVisibility: number | null
}

export interface CountryRow {
  country: string
  countryCode: string
  trafficShare: number | null
  visibility: number | null
  keywords: number | null
  mentions: number | null
  trend: number[] | null
}

export interface KeywordRow {
  id: string
  keyword: string
  intent: string | null        // "informational", "navigational", "transactional", "commercial"
  volume: number | null
  kd: number | null            // keyword difficulty 0-100
  cpc: number | null
  competition: number | null   // 0-1
  serpFeatures: string[] | null
  trend: number[] | null       // 12-month trend values
  position: number | null      // organic position
  url: string | null           // ranking URL
  lastUpdated: string | null
  isFavorite?: boolean
}

export interface CompetitorRow {
  domain: string
  overlap: number | null       // keyword overlap count
  keywordGap: number | null
  trafficGap: number | null
  authorityScore: number | null
  commonKeywords: number | null
  organicTraffic: number | null
}

export interface BacklinkRow {
  id: string
  sourceUrl: string
  sourceDomain: string
  targetUrl: string
  anchorText: string | null
  type: "dofollow" | "nofollow" | "ugc" | "sponsored" | "unknown"
  authority: number | null
  firstSeen: string | null
  lastSeen: string | null
}

export interface ReferringDomain {
  domain: string
  backlinks: number | null
  authority: number | null
  type: "dofollow" | "nofollow" | "mixed"
}

export interface TechnicalSEO {
  performance: number | null     // 0-100
  accessibility: number | null
  bestPractices: number | null
  seo: number | null
  cls: number | null            // Cumulative Layout Shift
  lcp: number | null            // Largest Contentful Paint (ms)
  inp: number | null            // Interaction to Next Paint (ms)
  fcp: number | null            // First Contentful Paint (ms)
  ttfb: number | null           // Time to First Byte (ms)
  https: boolean | null
  title: string | null
  metaDescription: string | null
  canonical: string | null
  robots: string | null
  hasSitemap: boolean | null
  hasSchema: boolean | null
  mobileUsable: boolean | null
  source: string | null         // "pagespeed", "local"
}

export interface Recommendation {
  id: string
  priority: "critical" | "high" | "medium" | "low"
  issue: string
  evidence: string | null
  impact: string | null
  fix: string | null
  affectedUrl: string | null
  source: string | null
  status: "open" | "in_progress" | "resolved" | "ignored"
}

export interface AISearchMetrics {
  aiVisibility: number | null
  aiMentions: number | null
  citedPages: number | null
  citedDomains: string[] | null
  lastUpdated: string | null
}

export interface DomainReport {
  id: string
  domain: string
  input: DomainInput
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
  createdAt: string
  updatedAt: string
  providerStatus: ProviderStatus[]
}

export interface ProviderStatus {
  provider: string               // "semrush", "pagespeed", "local"
  connected: boolean
  lastError: string | null
  unitsUsed: number | null
  unitsLimit: number | null
  estimatedCost: number | null
}

export interface KeywordOverview {
  keyword: string
  volume: number | null
  globalVolume: number | null
  intent: string | null
  difficulty: number | null
  cpc: number | null
  competition: number | null
  trend: number[] | null
  questions: { keyword: string; volume: number | null }[] | null
  variations: { keyword: string; volume: number | null; kd: number | null }[] | null
  clusters: { name: string; keywords: string[] }[] | null
  serpResults: SerpResult[] | null
}

export interface SerpResult {
  position: number
  url: string
  domain: string
  title: string
  snippet: string | null
  authority: number | null
  backlinks: number | null
}

export type SortDirection = "asc" | "desc"
export type SortField = string

export interface PaginationState {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface KeywordFilters {
  intent: string[]
  volumeMin: number | null
  volumeMax: number | null
  kdMin: number | null
  kdMax: number | null
  cpcMin: number | null
  cpcMax: number | null
  include: string
  exclude: string
  questionsOnly: boolean
  matchType: "broad" | "exact" | "phrase" | "related"
  language: string
}

export type TabId =
  | "overview"
  | "growth"
  | "countries"
  | "keywords"
  | "competitors"
  | "backlinks"
  | "technical"
  | "ai-search"
  | "recommendations"

export type GrowthTimeframe = "1m" | "6m" | "1y" | "2y" | "all"
export type GrowthGranularity = "days" | "months"
