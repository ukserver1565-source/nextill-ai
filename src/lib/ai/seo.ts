export interface SEOResult {
  keywordDensity: KeywordDensityItem[]
  totalWords: number
  lsiKeywords: string[]
  nlpTerms: string[]
  missingKeywords: string[]
  headingScore: HeadingScore
  schemaScore: number
  overallScore: number
  suggestions: string[]
}

export interface KeywordDensityItem {
  keyword: string
  count: number
  density: number
}

export interface HeadingScore {
  hasH1: boolean
  headingCount: { h1: number; h2: number; h3: number; h4: number }
  structureValid: boolean
  issues: string[]
}

const LSI_KEYWORDS: Record<string, string[]> = {
  default: ["comprehensive", "guide", "tips", "strategy", "benefits", "features", "solution", "best", "top", "essential", "complete", "expert", "ultimate", "proven", "effective", "advanced", "simple", "quick", "step-by-step", "beginner"],
}

export function analyzeSEO(text: string, primaryKeyword: string, secondaryKeywords: string[] = []): SEOResult {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean)
  const totalWords = words.length

  const allKeywords = [primaryKeyword, ...secondaryKeywords].filter(Boolean)

  const keywordDensity: KeywordDensityItem[] = allKeywords.map(kw => {
    const kwLower = kw.toLowerCase()
    const re = new RegExp(`\\b${kwLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
    const matches = text.match(re)
    const count = matches ? matches.length : 0
    return { keyword: kw, count, density: totalWords > 0 ? Math.round((count / totalWords) * 1000) / 10 : 0 }
  })

  const foundLSI: string[] = []
  const lsiList = LSI_KEYWORDS.default
  for (const lsi of lsiList) {
    const re = new RegExp(`\\b${lsi}\\b`, "gi")
    if (text.match(re)) foundLSI.push(lsi)
  }

  const nlpTerms = extractNLPTerms(text)
  const missingKeywords = allKeywords.filter(kw => {
    const re = new RegExp(`\\b${kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
    return !text.match(re)
  })

  const h1Count = (text.match(/^#\s.+$/gm) || []).length
  const h2Count = (text.match(/^##\s.+$/gm) || []).length
  const h3Count = (text.match(/^###\s.+$/gm) || []).length
  const h4Count = (text.match(/^####\s.+$/gm) || []).length

  const headingScore: HeadingScore = {
    hasH1: h1Count === 1,
    headingCount: { h1: h1Count, h2: h2Count, h3: h3Count, h4: h4Count },
    structureValid: h1Count === 1 && h2Count >= 2,
    issues: [],
  }
  if (h1Count === 0) headingScore.issues.push("Missing H1 heading")
  if (h1Count > 1) headingScore.issues.push(`${h1Count} H1 headings found (should be exactly 1)`)
  if (h2Count === 0) headingScore.issues.push("No H2 headings found")
  if (h3Count > 0 && h2Count === 0) headingScore.issues.push("H3 headings exist without H2 parents")

  const hasSchemaMarkup = text.includes('"@context"') || text.includes("https://schema.org") || text.includes("application/ld+json")
  const schemaScore = hasSchemaMarkup ? 100 : 30

  const suggestions: string[] = []
  const avgDensity = keywordDensity.reduce((s, k) => s + k.density, 0) / (keywordDensity.length || 1)
  if (avgDensity < 0.5) suggestions.push("Increase keyword density — target 0.5-2.5%")
  if (avgDensity > 3) suggestions.push("Keyword density too high — reduce to avoid keyword stuffing")
  if (missingKeywords.length > 0) suggestions.push(`Add missing keywords: ${missingKeywords.join(", ")}`)
  if (!headingScore.hasH1) suggestions.push("Add exactly one H1 heading")
  if (headingScore.headingCount.h2 < 2) suggestions.push("Add more H2 sections to improve structure")
  if (!hasSchemaMarkup) suggestions.push("Add JSON-LD schema markup")
  if (h2Count > 0 && h2Count < h3Count * 0.3) suggestions.push("Add more H2 headings to balance section structure")

  const headingOk = headingScore.structureValid
  const schemaOk = schemaScore >= 80
  const densityOk = avgDensity >= 0.5 && avgDensity <= 3
  const missingOk = missingKeywords.length === 0
  const checks = [headingOk, schemaOk, densityOk, missingOk]
  const passed = checks.filter(Boolean).length
  const overallScore = Math.round((passed / checks.length) * 100)

  return {
    keywordDensity,
    totalWords,
    lsiKeywords: foundLSI,
    nlpTerms,
    missingKeywords,
    headingScore,
    schemaScore,
    overallScore,
    suggestions,
  }
}

function extractNLPTerms(text: string): string[] {
  const commonNLP = ["because", "therefore", "however", "although", "since", "unless", "while", "whereas", "moreover", "furthermore", "consequently", "nevertheless", "accordingly", "besides", "indeed", "instead", "likewise", "meanwhile", "nonetheless", "otherwise", "subsequently", "thus", "hence"]
  const found: string[] = []
  const lower = text.toLowerCase()
  for (const term of commonNLP) {
    const re = new RegExp(`\\b${term}\\b`, "gi")
    if (lower.match(re)) found.push(term)
  }
  return found
}
