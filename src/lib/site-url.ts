/**
 * Single source of truth for the site's canonical URL.
 * Reads from NEXT_PUBLIC_SITE_URL env var with a production fallback.
 * Use this everywhere a site URL is needed (metadata, sitemap, robots, OG tags).
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.adultpulse.co.uk"
}
