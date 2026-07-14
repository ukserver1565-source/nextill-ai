// Semrush API provider adapter for Domain Intelligence
// Uses the Semrush Reporting API v2 (REST/CSV format)
// Docs: https://developer.semrush.com/api/

import type {
  DomainInput, DomainOverview, GrowthDataPoint, CountryRow,
  KeywordRow, KeywordOverview, CompetitorRow, BacklinkRow,
  ReferringDomain, ProviderStatus,
} from "./domain-intelligence.types"
import type { IDomainOverviewProvider, IKeywordProvider, IBacklinkProvider, ProviderResult } from "./provider.interface"
import { resolveProviderKey } from "./provider-key-resolver"
import { cacheGet, cacheSet, TTL } from "./cache.service"
import { getCacheKey } from "./domain-normalizer"

const SEMRUSH_BASE = "https://api.semrush.com"
const TIMEOUT_MS = 15000

// Semrush export column sets
const DOMAIN_RANKS_COLS = "Db,Dn,Ad,Ch,Nr,Or,Ot,Op,Dr,Ur"
const DOMAIN_ORGANIC_COLS = "Ph,Po,Nq,Cp,Ur,Tr,Trend"
const DOMAIN_BACKLINK_COLS = "as,ua,ul,dp,at,lt,td"
const DOMAIN_COMPETITORS_COLS = "Cr,Dn,In,Or"

function parseCSV(text: string): string[][] {
  const lines = text.trim().split("\n")
  return lines.map(line => {
    const fields: string[] = []
    let current = ""
    let inQuotes = false
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue }
      if (ch === ";" && !inQuotes) { fields.push(current); current = ""; continue }
      current += ch
    }
    fields.push(current)
    return fields
  })
}

async function semrushQuery(
  apiKey: string,
  params: Record<string, string>
): Promise<string> {
  const url = new URL(SEMRUSH_BASE)
  url.searchParams.set("key", apiKey)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Semrush API ${res.status}: ${body.slice(0, 200)}`)
  }
  return res.text()
}

function numOrNull(v: string): number | null {
  if (!v || v === "-" || v === "n/a" || v === "") return null
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}

function trendToArray(v: string): number[] | null {
  if (!v) return null
  return v.split(",").map(s => numOrNull(s.trim()) ?? 0)
}

function intentFromLetter(code: string): string {
  const map: Record<string, string> = {
    I: "informational", N: "navigational", T: "transactional",
    C: "commercial", i: "informational", n: "navigator", t: "transactional", c: "commercial",
  }
  return map[code] || "unknown"
}

export class SemrushProvider implements IDomainOverviewProvider, IKeywordProvider, IBacklinkProvider {
  name = "semrush"
  enabled = false
  private apiKey: string | null = null

  async init(): Promise<boolean> {
    const key = await resolveProviderKey("semrush")
    if (!key || !key.enabled || !key.apiKey) return false
    this.apiKey = key.apiKey
    this.enabled = true
    return true
  }

  private async query(params: Record<string, string>): Promise<string> {
    if (!this.apiKey) throw new Error("Semrush not configured")
    return semrushQuery(this.apiKey, params)
  }

  // === IDomainOverviewProvider ===

  async getOverview(input: DomainInput): Promise<ProviderResult<DomainOverview>> {
    const start = Date.now()
    try {
      if (!this.enabled) return { data: null, error: "Semrush not configured", provider: this.name, latencyMs: 0 }
      const cacheKey = getCacheKey(input, "overview")
      const cached = cacheGet<DomainOverview>(cacheKey)
      if (cached) return { data: cached, error: null, provider: this.name, latencyMs: 0 }

      const csv = await this.query({
        type: "domain_ranks",
        domain: input.rootDomain,
        database: input.country,
        export_columns: DOMAIN_RANKS_COLS,
      })
      const rows = parseCSV(csv)
      if (rows.length < 2) return { data: null, error: "No data returned", provider: this.name, latencyMs: Date.now() - start }

      // Header: Db,Dn,Ad,Ch,Nr,Or,Ot,Op,Dr,Ur
      const r = rows[1]
      const overview: DomainOverview = {
        authorityScore: { label: "Authority Score", value: numOrNull(r[8]), change: null, changeLabel: null, source: "semrush", status: "available", tooltip: "Semrush Authority Score (0-100)" },
        organicTraffic: { label: "Organic Traffic", value: numOrNull(r[5]), change: null, changeLabel: null, source: "semrush", status: "available", tooltip: "Estimated monthly organic traffic" },
        paidTraffic: { label: "Paid Traffic", value: numOrNull(r[3]), change: null, changeLabel: null, source: "semrush", status: "available", tooltip: "Estimated monthly paid traffic" },
        organicKeywords: { label: "Organic Keywords", value: numOrNull(r[6]), change: null, changeLabel: null, source: "semrush", status: "available", tooltip: "Number of organic ranking keywords" },
        paidKeywords: { label: "Paid Keywords", value: numOrNull(r[4]), change: null, changeLabel: null, source: "semrush", status: "available", tooltip: "Number of paid ranking keywords" },
        backlinks: { label: "Backlinks", value: numOrNull(r[7]), change: null, changeLabel: null, source: "semrush", status: "available", tooltip: "Total backlinks" },
        referringDomains: { label: "Referring Domains", value: numOrNull(r[9]), change: null, changeLabel: null, source: "semrush", status: "available", tooltip: "Number of referring domains" },
        trafficShare: { label: "Traffic Share", value: null, change: null, changeLabel: null, source: null, status: "unavailable", tooltip: null },
        aiVisibility: { label: "AI Visibility", value: null, change: null, changeLabel: null, source: null, status: "unavailable", tooltip: "Requires AI-search data provider" },
        aiMentions: { label: "AI Mentions", value: null, change: null, changeLabel: null, source: null, status: "unavailable", tooltip: null },
        citedPages: { label: "Cited Pages", value: null, change: null, changeLabel: null, source: null, status: "unavailable", tooltip: null },
      }
      cacheSet(cacheKey, overview, TTL.SEMRUSH)
      return { data: overview, error: null, provider: this.name, latencyMs: Date.now() - start }
    } catch (e) {
      return { data: null, error: String(e), provider: this.name, latencyMs: Date.now() - start }
    }
  }

  async getGrowth(input: DomainInput, months = 12): Promise<ProviderResult<GrowthDataPoint[]>> {
    const start = Date.now()
    try {
      if (!this.enabled) return { data: null, error: "Semrush not configured", provider: this.name, latencyMs: 0 }
      // Semrush doesn't have a direct growth endpoint in the basic API
      // We return null data with an informative error — historical data requires higher-tier access
      return { data: null, error: "Historical growth data requires Semrush Business tier or higher", provider: this.name, latencyMs: Date.now() - start }
    } catch (e) {
      return { data: null, error: String(e), provider: this.name, latencyMs: Date.now() - start }
    }
  }

  async getCountries(input: DomainInput): Promise<ProviderResult<CountryRow[]>> {
    const start = Date.now()
    try {
      if (!this.enabled) return { data: null, error: "Semrush not configured", provider: this.name, latencyMs: 0 }
      // Country data would require multiple API calls per country — return empty for now
      return { data: [], error: null, provider: this.name, latencyMs: Date.now() - start }
    } catch (e) {
      return { data: null, error: String(e), provider: this.name, latencyMs: Date.now() - start }
    }
  }

  async getCompetitors(input: DomainInput): Promise<ProviderResult<CompetitorRow[]>> {
    const start = Date.now()
    try {
      if (!this.enabled) return { data: null, error: "Semrush not configured", provider: this.name, latencyMs: 0 }
      const cacheKey = getCacheKey(input, "competitors")
      const cached = cacheGet<CompetitorRow[]>(cacheKey)
      if (cached) return { data: cached, error: null, provider: this.name, latencyMs: 0 }

      const csv = await this.query({
        type: "domain_competitors",
        domain: input.rootDomain,
        database: input.country,
        export_columns: DOMAIN_COMPETITORS_COLS,
      })
      const rows = parseCSV(csv)
      const competitors: CompetitorRow[] = []
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i]
        competitors.push({
          domain: r[1] || "",
          overlap: numOrNull(r[2]),
          keywordGap: null,
          trafficGap: null,
          authorityScore: null,
          commonKeywords: numOrNull(r[2]),
          organicTraffic: numOrNull(r[3]),
        })
      }
      cacheSet(cacheKey, competitors, TTL.SEMRUSH)
      return { data: competitors, error: null, provider: this.name, latencyMs: Date.now() - start }
    } catch (e) {
      return { data: null, error: String(e), provider: this.name, latencyMs: Date.now() - start }
    }
  }

  // === IKeywordProvider ===

  async getKeywordOverview(keyword: string, country: string): Promise<ProviderResult<KeywordOverview>> {
    const start = Date.now()
    try {
      if (!this.enabled) return { data: null, error: "Semrush not configured", provider: this.name, latencyMs: 0 }
      const csv = await this.query({
        type: "phrase_this",
        phrase: keyword,
        database: country,
        export_columns: "Ph,Nq,Cp,Co,Nr,Trend",
      })
      const rows = parseCSV(csv)
      if (rows.length < 2) return { data: null, error: "No data for this keyword", provider: this.name, latencyMs: Date.now() - start }

      const r = rows[1]
      const overview: KeywordOverview = {
        keyword: r[0] || keyword,
        volume: numOrNull(r[1]),
        globalVolume: null,
        intent: null,
        difficulty: null,
        cpc: numOrNull(r[2]),
        competition: numOrNull(r[3]),
        trend: trendToArray(r[5]),
        questions: null,
        variations: null,
        clusters: null,
        serpResults: null,
      }
      return { data: overview, error: null, provider: this.name, latencyMs: Date.now() - start }
    } catch (e) {
      return { data: null, error: String(e), provider: this.name, latencyMs: Date.now() - start }
    }
  }

  async getKeywords(
    domain: string,
    filters: { intent: string[]; volumeMin: number | null; volumeMax: number | null; kdMin: number | null; kdMax: number | null; cpcMin: number | null; cpcMax: number | null; include: string; exclude: string; questionsOnly: boolean; matchType: string; language: string },
    pagination: { page: number; pageSize: number; total: number; totalPages: number },
    sort: { field: string; direction: "asc" | "desc" }
  ): Promise<ProviderResult<{ keywords: KeywordRow[]; total: number }>> {
    const start = Date.now()
    try {
      if (!this.enabled) return { data: null, error: "Semrush not configured", provider: this.name, latencyMs: 0 }

      const csv = await this.query({
        type: "domain_organic",
        domain,
        database: filters.language || "us",
        export_columns: DOMAIN_ORGANIC_COLS,
        display_limit: String(pagination.pageSize),
        display_offset: String((pagination.page - 1) * pagination.pageSize),
      })
      const rows = parseCSV(csv)
      const keywords: KeywordRow[] = []
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i]
        keywords.push({
          id: `semrush-${domain}-${i}`,
          keyword: r[0] || "",
          intent: null,
          volume: numOrNull(r[2]),
          kd: null,
          cpc: numOrNull(r[3]),
          competition: null,
          serpFeatures: null,
          trend: trendToArray(r[6]),
          position: numOrNull(r[1]),
          url: r[4] || null,
          lastUpdated: null,
        })
      }
      return { data: { keywords, total: keywords.length }, error: null, provider: this.name, latencyMs: Date.now() - start }
    } catch (e) {
      return { data: null, error: String(e), provider: this.name, latencyMs: Date.now() - start }
    }
  }

  // === IBacklinkProvider ===

  async getBacklinks(
    domain: string,
    pagination: { page: number; pageSize: number; total: number; totalPages: number }
  ): Promise<ProviderResult<{ backlinks: BacklinkRow[]; total: number }>> {
    const start = Date.now()
    try {
      if (!this.enabled) return { data: null, error: "Semrush not configured", provider: this.name, latencyMs: 0 }

      const csv = await this.query({
        type: "domain_backlinks",
        target: domain,
        export_columns: DOMAIN_BACKLINK_COLS,
        display_limit: String(pagination.pageSize),
        display_offset: String((pagination.page - 1) * pagination.pageSize),
      })
      const rows = parseCSV(csv)
      const backlinks: BacklinkRow[] = []
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i]
        backlinks.push({
          id: `bl-${i}`,
          sourceUrl: r[1] || "",
          sourceDomain: r[0] || "",
          targetUrl: domain,
          anchorText: r[4] || null,
          type: r[3] === "1" ? "dofollow" : "nofollow",
          authority: numOrNull(r[0]),
          firstSeen: null,
          lastSeen: r[6] || null,
        })
      }
      return { data: { backlinks, total: backlinks.length }, error: null, provider: this.name, latencyMs: Date.now() - start }
    } catch (e) {
      return { data: null, error: String(e), provider: this.name, latencyMs: Date.now() - start }
    }
  }

  async getReferringDomains(
    domain: string,
    pagination: { page: number; pageSize: number; total: number; totalPages: number }
  ): Promise<ProviderResult<{ domains: ReferringDomain[]; total: number }>> {
    // Semrush doesn't have a direct referring domains endpoint in basic API
    return { data: null, error: "Referring domains requires Semrush Business tier", provider: this.name, latencyMs: 0 }
  }

  async getStatus(): Promise<ProviderStatus> {
    return {
      provider: "semrush",
      connected: this.enabled,
      lastError: this.enabled ? null : "Not configured — add Semrush API key in Admin > Providers",
      unitsUsed: null,
      unitsLimit: null,
      estimatedCost: null,
    }
  }
}
