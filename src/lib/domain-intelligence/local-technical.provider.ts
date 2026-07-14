// Local technical SEO analyzer
// Performs lightweight checks without external API calls
// Checks: HTTPS, DNS, robots.txt, sitemap.xml, response headers, basic HTML analysis

import type { TechnicalSEO, Recommendation } from "./domain-intelligence.types"
import type { ITechnicalProvider, ProviderResult } from "./provider.interface"
import { cacheGet, cacheSet, TTL } from "./cache.service"

const TIMEOUT_MS = 10000

export class LocalTechnicalProvider implements ITechnicalProvider {
  name = "local"
  enabled = true

  async analyze(url: string): Promise<ProviderResult<TechnicalSEO>> {
    const start = Date.now()
    try {
      const cacheKey = `local:${url}`
      const cached = cacheGet<TechnicalSEO>(cacheKey)
      if (cached) return { data: cached, error: null, provider: this.name, latencyMs: 0 }

      const target = url.startsWith("http") ? url : `https://${url}`
      const parsedUrl = new URL(target)

      const results: Partial<TechnicalSEO> = {
        https: parsedUrl.protocol === "https:",
        source: "local",
      }

      // Fetch the page
      try {
        const res = await fetch(target, {
          signal: AbortSignal.timeout(TIMEOUT_MS),
          headers: { "User-Agent": "NextillAI/1.0 SEO-Analyzer" },
          redirect: "follow",
        })

        const html = await res.text().catch(() => "")

        // Title check
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        results.title = titleMatch ? titleMatch[1].trim().slice(0, 200) : null

        // Meta description
        const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
        results.metaDescription = metaDescMatch ? metaDescMatch[1].trim().slice(0, 300) : null

        // Canonical
        const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)
        results.canonical = canonicalMatch ? canonicalMatch[1] : null

        // Robots
        const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i)
        results.robots = robotsMatch ? robotsMatch[1] : null

        // Schema/structured data
        results.hasSchema = html.includes('type="application/ld+json"') || html.includes("type='application/ld+json'")

        // Mobile viewport
        results.mobileUsable = html.includes('name="viewport"')
      } catch {
        // Fetch failed — still return basic info
      }

      // Check robots.txt
      try {
        const robotsUrl = `${parsedUrl.protocol}//${parsedUrl.host}/robots.txt`
        const robotsRes = await fetch(robotsUrl, { signal: AbortSignal.timeout(5000), headers: { "User-Agent": "NextillAI/1.0" } })
        if (robotsRes.ok) {
          const robotsText = await robotsRes.text()
          if (robotsText.includes("Disallow: /") && !robotsText.includes("Allow:")) {
            results.robots = "Blocked (all paths disallowed)"
          } else {
            results.robots = results.robots || "Crawlable (robots.txt found)"
          }
        }
      } catch { /* ignore */ }

      // Check sitemap
      try {
        const sitemapUrl = `${parsedUrl.protocol}//${parsedUrl.host}/sitemap.xml`
        const sitemapRes = await fetch(sitemapUrl, { signal: AbortSignal.timeout(5000), headers: { "User-Agent": "NextillAI/1.0" } })
        results.hasSitemap = sitemapRes.ok
      } catch {
        results.hasSitemap = false
      }

      const technical: TechnicalSEO = {
        performance: null, // Requires PageSpeed
        accessibility: null,
        bestPractices: null,
        seo: null,
        cls: null,
        lcp: null,
        inp: null,
        fcp: null,
        ttfb: null,
        https: results.https ?? false,
        title: results.title ?? null,
        metaDescription: results.metaDescription ?? null,
        canonical: results.canonical ?? null,
        robots: results.robots ?? null,
        hasSitemap: results.hasSitemap ?? null,
        hasSchema: results.hasSchema ?? null,
        mobileUsable: results.mobileUsable ?? null,
        source: "local",
      }

      cacheSet(cacheKey, technical, TTL.LOCAL)
      return { data: technical, error: null, provider: this.name, latencyMs: Date.now() - start }
    } catch (e) {
      return { data: null, error: String(e), provider: this.name, latencyMs: Date.now() - start }
    }
  }

  async getRecommendations(technical: TechnicalSEO, domain: string): Promise<ProviderResult<Recommendation[]>> {
    const recs: Recommendation[] = []
    let id = 0

    if (!technical.https) {
      recs.push({ id: `local-${++id}`, priority: "critical", issue: "HTTPS not enabled", evidence: "Site does not use HTTPS", impact: "Security risk, browsers show warnings, SEO penalty", fix: "Install an SSL certificate and redirect HTTP to HTTPS", affectedUrl: domain, source: "local", status: "open" })
    }
    if (!technical.title) {
      recs.push({ id: `local-${++id}`, priority: "critical", issue: "Missing page title", evidence: "No <title> tag found", impact: "Critical for SEO", fix: "Add a descriptive title tag", affectedUrl: domain, source: "local", status: "open" })
    }
    if (!technical.metaDescription) {
      recs.push({ id: `local-${++id}`, priority: "high", issue: "Missing meta description", evidence: "No meta description found", impact: "Search engines auto-generate snippets", fix: "Add a compelling meta description", affectedUrl: domain, source: "local", status: "open" })
    }
    if (!technical.canonical) {
      recs.push({ id: `local-${++id}`, priority: "medium", issue: "Missing canonical tag", evidence: "No canonical URL specified", impact: "May cause duplicate content issues", fix: "Add a canonical link tag", affectedUrl: domain, source: "local", status: "open" })
    }
    if (technical.hasSitemap === false) {
      recs.push({ id: `local-${++id}`, priority: "medium", issue: "No sitemap.xml found", evidence: "Sitemap not accessible at /sitemap.xml", impact: "Search engines may not discover all pages", fix: "Generate and submit a sitemap.xml", affectedUrl: domain, source: "local", status: "open" })
    }
    if (!technical.hasSchema) {
      recs.push({ id: `local-${++id}`, priority: "low", issue: "No structured data detected", evidence: "No JSON-LD schema found", impact: "Missing rich snippet opportunities", fix: "Add relevant schema.org JSON-LD markup", affectedUrl: domain, source: "local", status: "open" })
    }
    if (!technical.mobileUsable) {
      recs.push({ id: `local-${++id}`, priority: "high", issue: "No viewport meta tag", evidence: "Viewport tag missing", impact: "Page may not render correctly on mobile", fix: "Add <meta name='viewport' content='width=device-width, initial-scale=1'>", affectedUrl: domain, source: "local", status: "open" })
    }

    return { data: recs, error: null, provider: this.name, latencyMs: 0 }
  }
}
