// Domain normalizer — transforms raw user input into a canonical DomainInput
// Handles: URLs, subdomains, root domains, protocol stripping, path removal
// Blocks: SSRF targets (localhost, private IPs, internal networks)

import type { DomainInput, AnalysisMode, DeviceType } from "./domain-intelligence.types"

// RFC 1918 + loopback + link-local + broadcast + metadata
const BLOCKED_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^169\.254\./,
  /^255\.255\.255\./,
  /^::1$/,
  /^fc00:/i,
  /^fd00:/i,
  /^fe80:/i,
  /^ff00:/i,
  /^ff[0-9a-f]{2}:/i,
  /\.local$/i,
  /\.internal$/i,
  /\.localhost$/i,
  /^metadata\.google/i,
  /^169\.254\.169\.254/i,
]

const COUNTRY_MAP: Record<string, string> = {
  us: "us", uk: "gb", gb: "gb", ca: "ca", au: "au", de: "de", fr: "fr",
  es: "es", it: "it", br: "br", jp: "jp", in: "in", mx: "mx", nl: "nl",
  se: "se", no: "no", dk: "dk", fi: "fi", pl: "pl", pt: "pt", ru: "ru",
  cn: "cn", kr: "kr", tr: "tr", ar: "ar", za: "za", ng: "ng", eg: "eg",
  sa: "sa", ae: "ae", il: "il", ph: "ph", id: "id", th: "th", vn: "vn",
  my: "my", sg: "sg", nz: "nz", ie: "ie", at: "at", ch: "ch", be: "be",
  cl: "cl", co: "co", pe: "pe", cz: "cz", ro: "ro", ua: "ua", bd: "bd",
  pk: "pk", global: "us",
}

export function normalizeDomainInput(
  raw: string,
  opts: {
    mode?: AnalysisMode
    country?: string
    language?: string
    device?: DeviceType
    date?: string
    currency?: string
  } = {}
): DomainInput {
  const trimmed = raw.trim()

  // Try URL parsing
  let hostname = trimmed
  let pathname = ""

  try {
    // Add protocol if missing for URL parsing
    const urlStr = trimmed.match(/^https?:\/\//i) ? trimmed : `https://${trimmed}`
    const url = new URL(urlStr)
    hostname = url.hostname
    pathname = url.pathname
  } catch {
    // Not a valid URL, use as-is (might be bare domain)
  }

  // Strip www. prefix for root domain
  const rootDomain = hostname.replace(/^www\./i, "")

  // Detect subdomain
  const parts = rootDomain.split(".")
  let subdomain: string | null = null
  let effectiveDomain = rootDomain

  if (parts.length > 2) {
    // e.g. blog.example.com → subdomain = "blog", effectiveDomain = "example.com"
    subdomain = parts[0]
    effectiveDomain = parts.slice(1).join(".")
  }

  // Determine mode
  let mode = opts.mode || "root_domain"
  if (pathname && pathname !== "/") {
    mode = "exact_url"
  }

  // Build normalized domain for API calls
  let normalized = effectiveDomain
  if (mode === "exact_url" && pathname) {
    normalized = `${rootDomain}${pathname}`
  }

  // SSRF protection
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(rootDomain) || pattern.test(effectiveDomain) || pattern.test(hostname)) {
      throw new Error(`Blocked: "${raw}" resolves to a private/internal address`)
    }
  }

  // Validate domain format
  if (!effectiveDomain || !effectiveDomain.includes(".")) {
    throw new Error(`Invalid domain: "${raw}"`)
  }

  const country = (opts.country || "us").toLowerCase()
  const language = (opts.language || "en").toLowerCase()
  const device = opts.device || "desktop"
  const date = opts.date || new Date().toISOString().split("T")[0]
  const currency = opts.currency || "usd"

  return {
    raw: trimmed,
    normalized,
    rootDomain: effectiveDomain,
    subdomain,
    mode,
    country: COUNTRY_MAP[country] || country,
    language,
    device,
    date,
    currency,
  }
}

export function getDisplayDomain(input: DomainInput): string {
  if (input.mode === "exact_url") return input.normalized
  if (input.subdomain) return `${input.subdomain}.${input.rootDomain}`
  return input.rootDomain
}

export function getCacheKey(input: DomainInput, suffix: string = ""): string {
  const parts = [
    input.rootDomain,
    input.country,
    input.device,
    input.mode,
    suffix,
  ].filter(Boolean)
  return parts.join(":")
}
