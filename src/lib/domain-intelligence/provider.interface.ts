// Provider interface for Domain Intelligence
// Each provider (Semrush, PageSpeed, local) implements this interface.
// The service layer aggregates results from all connected providers.

import type {
  DomainInput,
  DomainOverview,
  GrowthDataPoint,
  CountryRow,
  KeywordRow,
  KeywordOverview,
  CompetitorRow,
  BacklinkRow,
  ReferringDomain,
  TechnicalSEO,
  Recommendation,
  AISearchMetrics,
  ProviderStatus,
  KeywordFilters,
  PaginationState,
} from "./domain-intelligence.types"

export interface ProviderResult<T> {
  data: T | null
  error: string | null
  provider: string
  latencyMs: number
  unitsUsed?: number
  estimatedCost?: number
}

export interface IDomainOverviewProvider {
  name: string
  enabled: boolean
  getOverview(input: DomainInput): Promise<ProviderResult<DomainOverview>>
  getGrowth(input: DomainInput, months?: number): Promise<ProviderResult<GrowthDataPoint[]>>
  getCountries(input: DomainInput): Promise<ProviderResult<CountryRow[]>>
  getCompetitors(input: DomainInput): Promise<ProviderResult<CompetitorRow[]>>
  getStatus(): Promise<ProviderStatus>
}

export interface IKeywordProvider {
  name: string
  enabled: boolean
  getKeywordOverview(keyword: string, country: string): Promise<ProviderResult<KeywordOverview>>
  getKeywords(
    domain: string,
    filters: KeywordFilters,
    pagination: PaginationState,
    sort: { field: string; direction: "asc" | "desc" }
  ): Promise<ProviderResult<{ keywords: KeywordRow[]; total: number }>>
}

export interface IBacklinkProvider {
  name: string
  enabled: boolean
  getBacklinks(
    domain: string,
    pagination: PaginationState
  ): Promise<ProviderResult<{ backlinks: BacklinkRow[]; total: number }>>
  getReferringDomains(
    domain: string,
    pagination: PaginationState
  ): Promise<ProviderResult<{ domains: ReferringDomain[]; total: number }>>
}

export interface ITechnicalProvider {
  name: string
  enabled: boolean
  analyze(url: string): Promise<ProviderResult<TechnicalSEO>>
  getRecommendations(technical: TechnicalSEO, domain: string): Promise<ProviderResult<Recommendation[]>>
}

export interface IAISearchProvider {
  name: string
  enabled: boolean
  getAISearchMetrics(domain: string): Promise<ProviderResult<AISearchMetrics>>
}
