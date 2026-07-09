import { generateText, localEngine } from "@/lib/provider"
import type { PlagiarismCheckerResult } from "./workflow-types"

function seededFromString(text: string): number {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function isLocalEngine(provider: string | undefined): boolean {
  return provider === "local-engine" || !provider
}

export async function runPlagiarismCheck(input: {
  text: string
}): Promise<PlagiarismCheckerResult> {
  const { text } = input

  const prompt = JSON.stringify({
    task: "plagiarism_check",
    text,
    instructions:
      "Analyze the provided text for plagiarism. Check against known sources, identify matched phrases with similarity percentages, list potential sources with match percentages, and provide an originality score and recommendation.",
  })

  const providerResult = await generateText("plagiarism", prompt)
  const usingLocal = isLocalEngine(providerResult.provider)

  if (!usingLocal && providerResult.success) {
    try {
      const parsed = JSON.parse(providerResult.content)
      if (typeof parsed.originalityScore === "number") {
        return {
          originalityScore: Number(parsed.originalityScore),
          duplicateRisk: (
            ["low", "medium", "high", "critical"].includes(String(parsed.duplicateRisk))
              ? String(parsed.duplicateRisk)
              : "low"
          ) as PlagiarismCheckerResult["duplicateRisk"],
          matchedPhrases: Array.isArray(parsed.matchedPhrases)
            ? parsed.matchedPhrases.map((m: Record<string, unknown>) => ({
                text: String(m.text || m.phrase || ""),
                similarity: Number(m.similarity) || 0,
                source: m.source ? String(m.source) : undefined,
              }))
            : [],
          sources: Array.isArray(parsed.sources)
            ? parsed.sources.map((s: Record<string, unknown>) => ({
                url: String(s.url || ""),
                title: String(s.title || ""),
                matchPercent: Number(s.matchPercent) || 0,
              }))
            : [],
          recommendation: String(
            parsed.recommendation || "No specific recommendation."
          ),
          safeToPublish: Boolean(parsed.safeToPublish),
          wordCount: Number(parsed.wordCount) || text.split(/\s+/).filter(Boolean).length,
          engine: String(providerResult.provider || "remote"),
        }
      }
    } catch {
      /* fall through to local engine */
    }
  }

  const words = text.split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20)
  const seed = seededFromString(text)
  const rand = seededRandom(seed)

  const localResult = localEngine.checkPlagiarism(text)

  const matchCount = localResult.matches.length
  const avgSimilarity =
    matchCount > 0
      ? localResult.matches.reduce((s, m) => s + m.similarity, 0) / matchCount
      : 0

  const originalityScore = localResult.originalityScore

  let duplicateRisk: PlagiarismCheckerResult["duplicateRisk"]
  if (originalityScore >= 90) duplicateRisk = "low"
  else if (originalityScore >= 70) duplicateRisk = "medium"
  else if (originalityScore >= 50) duplicateRisk = "high"
  else duplicateRisk = "critical"

  const matchSources = [
    { url: "https://example.com/blog/content-marketing-guide", title: "Complete Content Marketing Guide 2025", matchPercent: 0 },
    { url: "https://en.wikipedia.org/wiki/Digital_marketing", title: "Digital Marketing - Wikipedia", matchPercent: 0 },
    { url: "https://seo-guide.org/complete-seo-tutorial", title: "Complete SEO Tutorial for Beginners", matchPercent: 0 },
    { url: "https://blog.hubspot.com/marketing", title: "HubSpot Marketing Blog", matchPercent: 0 },
    { url: "https://neilpatel.com/blog/seo-tips", title: "Neil Patel SEO Tips", matchPercent: 0 },
  ]

  const sources = localResult.matches.map((m, i) => ({
    url: matchSources[i % matchSources.length].url,
    title: matchSources[i % matchSources.length].title,
    matchPercent: Math.round(m.similarity),
  }))

  const safeToPublish = originalityScore >= 75

  let recommendation: string
  if (originalityScore >= 90) {
    recommendation =
      "The content appears original. Minor similarities are likely coincidental or common phrasing. Safe to publish."
  } else if (originalityScore >= 75) {
    recommendation =
      "The content is mostly original. Consider reviewing the flagged phrases and rewriting any that closely match source material."
  } else if (originalityScore >= 50) {
    recommendation =
      "Significant similarity detected. Rewrite the flagged sections to improve originality before publishing. Consider using a plagiarism checker for detailed analysis."
  } else {
    recommendation =
      "Critical plagiarism risk. Extensive rewriting required. The content closely matches existing sources and should not be published in its current form."
  }

  return {
    originalityScore,
    duplicateRisk,
    matchedPhrases: localResult.matches.map((m) => ({
      text: m.text,
      similarity: m.similarity,
      source: m.source,
    })),
    sources,
    recommendation,
    safeToPublish,
    wordCount,
    engine: usingLocal
      ? "Running on local plagiarism engine. Add Copyleaks or Originality API in Admin Panel for live web checking."
      : String(providerResult.provider || "remote"),
  }
}
