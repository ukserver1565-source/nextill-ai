// Google PageSpeed Insights provider for technical SEO analysis
// Uses the free PageSpeed Insights API (no key required for basic usage)
// Can optionally use a Google API key for higher rate limits

import type { TechnicalSEO, Recommendation } from "./domain-intelligence.types"
import type { ITechnicalProvider, ProviderResult } from "./provider.interface"
import { cacheGet, cacheSet, TTL } from "./cache.service"

const PSI_BASE = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
const TIMEOUT_MS = 30000

interface PSIResponse {
  lighthouseResult?: {
    categories?: {
      performance?: { score: number }
      accessibility?: { score: number }
      "best-practices"?: { score: number }
      seo?: { score: number }
    }
    audits?: {
      "cumulative-layout-shift"?: { score: number; numericValue: number }
      "largest-contentful-paint"?: { score: number; numericValue: number }
      "interactive"?: { score: number; numericValue: number }
      "first-contentful-paint"?: { score: number; numericValue: number }
      "server-response-time"?: { score: number; numericValue: number }
      "document-title"?: { score: number; title: string }
      "meta-description"?: { score: number }
      "canonical"?: { score: number }
      "is-crawlable"?: { score: number }
      "robots-txt"?: { score: number }
      "hreflang"?: { score: number }
      "structured-data"?: { score: number }
      "viewport"?: { score: number }
      "font-size"?: { score: number }
      "tap-targets"?: { score: number }
    }
  }
  error?: { message: string }
}

export class PageSpeedProvider implements ITechnicalProvider {
  name = "pagespeed"
  enabled = true

  async analyze(url: string): Promise<ProviderResult<TechnicalSEO>> {
    const start = Date.now()
    try {
      const cacheKey = `pagespeed:${url}`
      const cached = cacheGet<TechnicalSEO>(cacheKey)
      if (cached) return { data: cached, error: null, provider: this.name, latencyMs: 0 }

      const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || process.env.PAGESPEED_API_KEY || ""
      const params = new URLSearchParams({
        url: url.startsWith("http") ? url : `https://${url}`,
        strategy: "mobile",
        category: "performance,accessibility,best-practices,seo",
      })
      if (apiKey) params.set("key", apiKey)

      const res = await fetch(`${PSI_BASE}?${params}`, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })

      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`PageSpeed API ${res.status}: ${body.slice(0, 200)}`)
      }

      const data: PSIResponse = await res.json()
      if (data.error) throw new Error(data.error.message)

      const lr = data.lighthouseResult
      const cats = lr?.categories || {}
      const audits = lr?.audits || {}

      const technical: TechnicalSEO = {
        performance: cats.performance?.score != null ? Math.round(cats.performance.score * 100) : null,
        accessibility: cats.accessibility?.score != null ? Math.round(cats.accessibility.score * 100) : null,
        bestPractices: cats["best-practices"]?.score != null ? Math.round(cats["best-practices"].score * 100) : null,
        seo: cats.seo?.score != null ? Math.round(cats.seo.score * 100) : null,
        cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
        lcp: audits["largest-contentful-paint"]?.numericValue ?? null,
        inp: audits["interactive"]?.numericValue ?? null,
        fcp: audits["first-contentful-paint"]?.numericValue ?? null,
        ttfb: audits["server-response-time"]?.numericValue ?? null,
        https: url.startsWith("https"),
        title: audits["document-title"]?.score === 1 ? "Present" : "Missing",
        metaDescription: audits["meta-description"]?.score === 1 ? "Present" : "Missing",
        canonical: audits["canonical"]?.score === 1 ? "Present" : "Missing",
        robots: audits["is-crawlable"]?.score === 1 ? "Crawlable" : "Blocked",
        hasSitemap: null, // Not available via PageSpeed
        hasSchema: audits["structured-data"]?.score === 1,
        mobileUsable: audits["viewport"]?.score === 1 && audits["font-size"]?.score === 1,
        source: "pagespeed",
      }

      cacheSet(cacheKey, technical, TTL.PAGESPEED)
      return { data: technical, error: null, provider: this.name, latencyMs: Date.now() - start }
    } catch (e) {
      return { data: null, error: String(e), provider: this.name, latencyMs: Date.now() - start }
    }
  }

  async getRecommendations(technical: TechnicalSEO, domain: string): Promise<ProviderResult<Recommendation[]>> {
    const recs: Recommendation[] = []
    let id = 0

    if (technical.performance != null && technical.performance < 50) {
      recs.push({ id: `rec-${++id}`, priority: "critical", issue: "Low performance score", evidence: `Score: ${technical.performance}/100`, impact: "Poor user experience and lower search rankings", fix: "Optimize images, reduce JavaScript, implement caching", affectedUrl: domain, source: "pagespeed", status: "open" })
    }
    if (technical.lcp != null && technical.lcp > 4000) {
      recs.push({ id: `rec-${++id}`, priority: "critical", issue: "Slow Largest Contentful Paint", evidence: `LCP: ${Math.round(technical.lcp)}ms (target: <2500ms)`, impact: "Users may leave before content loads", fix: "Optimize hero images, use CDN, preload critical resources", affectedUrl: domain, source: "pagespeed", status: "open" })
    }
    if (technical.cls != null && technical.cls > 0.25) {
      recs.push({ id: `rec-${++id}`, priority: "high", issue: "High Cumulative Layout Shift", evidence: `CLS: ${technical.cls.toFixed(3)} (target: <0.1)`, impact: "Layout shifts frustrate users and harm Core Web Vitals", fix: "Set explicit dimensions for images/ads, avoid dynamic content injection", affectedUrl: domain, source: "pagespeed", status: "open" })
    }
    if (technical.inp != null && technical.inp > 500) {
      recs.push({ id: `rec-${++id}`, priority: "high", issue: "Slow Interaction to Next Paint", evidence: `INP: ${Math.round(technical.inp)}ms (target: <200ms)`, impact: "Page feels unresponsive to user interactions", fix: "Reduce main thread work, break up long tasks, optimize event handlers", affectedUrl: domain, source: "pagespeed", status: "open" })
    }
    if (technical.accessibility != null && technical.accessibility < 80) {
      recs.push({ id: `rec-${++id}`, priority: "high", issue: "Accessibility issues detected", evidence: `Score: ${technical.accessibility}/100`, impact: "Some users may not be able to use your site", fix: "Add alt text, ensure color contrast, use semantic HTML", affectedUrl: domain, source: "pagespeed", status: "open" })
    }
    if (technical.seo != null && technical.seo < 90) {
      recs.push({ id: `rec-${++id}`, priority: "medium", issue: "SEO issues detected", evidence: `Score: ${technical.seo}/100`, impact: "May reduce search visibility", fix: "Fix missing titles, meta descriptions, or link issues", affectedUrl: domain, source: "pagespeed", status: "open" })
    }
    if (technical.title === "Missing") {
      recs.push({ id: `rec-${++id}`, priority: "critical", issue: "Missing page title", evidence: "Document title not found", impact: "Critical for SEO — title appears in search results", fix: "Add a descriptive <title> tag to the HTML", affectedUrl: domain, source: "pagespeed", status: "open" })
    }
    if (technical.metaDescription === "Missing") {
      recs.push({ id: `rec-${++id}`, priority: "high", issue: "Missing meta description", evidence: "Meta description not found", impact: "Search engines will auto-generate a snippet", fix: "Add a compelling <meta name='description'> tag", affectedUrl: domain, source: "pagespeed", status: "open" })
    }
    if (technical.canonical === "Missing") {
      recs.push({ id: `rec-${++id}`, priority: "medium", issue: "Missing canonical tag", evidence: "No canonical URL specified", impact: "May cause duplicate content issues", fix: "Add a <link rel='canonical'> tag", affectedUrl: domain, source: "pagespeed", status: "open" })
    }
    if (technical.robots === "Blocked") {
      recs.push({ id: `rec-${++id}`, priority: "critical", issue: "Page blocked by robots", evidence: "Crawling is disallowed", impact: "Search engines cannot index this page", fix: "Check robots.txt and meta robots tag", affectedUrl: domain, source: "pagespeed", status: "open" })
    }

    return { data: recs, error: null, provider: this.name, latencyMs: 0 }
  }
}
