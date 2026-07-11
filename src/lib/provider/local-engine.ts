import {
  runPlagiarismLocal,
  detectAiLocal,
  checkGrammarLocal,
  analyzeKeywordsLocal,
  generateSeoTitlesLocal,
  generateMetaDescriptionsLocal,
  generateFaqsLocal,
  generateSchemaLocal,
  generateInternalLinksLocal,
  calculateReadability,
  humanizeContentLocal,
} from "@/lib/engine"
import type {
  LocalKeywordData,
  LocalOutline,
  LocalArticle,
  LocalSeoTitles,
  LocalMetaDescriptions,
  LocalFaqs,
  LocalSchema,
  LocalInternalLinks,
  LocalReadability,
  LocalHumanized,
  LocalGrammarResult,
  LocalAiDetection,
  LocalPlagiarism,
  LocalOptimization,
} from "./provider-types"

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function extractKeyword(prompt: string): string {
  const m = prompt.match(/"([^"]+)"/)
  return m ? m[1] : "topic"
}

function generateKeywordData(keyword: string, _country: string, _language: string): LocalKeywordData {
  const seed = slugify(keyword)
  const result = analyzeKeywordsLocal(keyword)

  return {
    keywords: result.keywords.map(k => ({
      keyword: k.keyword,
      volume: k.volume ?? 0,
      difficulty: k.difficulty,
      cpc: k.cpc ?? 0,
      trend: k.trend as "rising" | "stable" | "seasonal" | "declining",
      intent: k.intent as "informational" | "commercial" | "transactional" | "navigational",
    })),
    longTail: result.longTail.map(l => l.keyword),
    questions: result.questions.map(q => q.question),
    related: result.related.map(r => r.keyword),
    lsi: result.lsiNlp.map(l => l.term),
    nlpTerms: result.lsiNlp.map(l => `${l.term}_analysis`),
    topicalMap: {
      core: keyword,
      clusters: result.topicalMap.map(c => ({
        topic: c.topic,
        subtopics: c.subtopics,
        relevance: 80,
      })),
    },
    totalResults: result.keywords.length * 100,
  }
}

function generateOutline(keyword: string, _wordCount: number, _audience: string, _tone: string): LocalOutline {
  const sections = [
    { heading: `Understanding ${keyword}`, level: 2 as const, points: 4 },
    { heading: `Why ${keyword} Matters`, level: 2 as const, points: 3 },
    { heading: `Key Benefits of ${keyword}`, level: 2 as const, points: 4 },
    { heading: `Best Practices for ${keyword}`, level: 2 as const, points: 5 },
    { heading: `Conclusion`, level: 2 as const, points: 2 },
  ]

  return {
    h1: `Guide to ${keyword}`,
    sections: sections.map(s => ({
      heading: s.heading,
      level: s.level,
      points: Array.from({ length: s.points }, (_, i) => `Point ${i + 1} about ${keyword}`),
    })),
    introPoints: [`Overview of ${keyword}`, "Key concepts explained"],
    faqIdeas: [`What is ${keyword}?`, `How does ${keyword} work?`],
    cta: `Learn more about ${keyword}.`,
    estimatedWordCount: _wordCount,
  }
}

function generateArticle(keyword: string, _wordCount: number, _tone: string, _audience: string, _outline: string): LocalArticle {
  return {
    title: `Guide to ${keyword}`,
    intro: `This article explores ${keyword} in depth.`,
    body: `## Understanding ${keyword}\n\nContent about ${keyword}.\n\n## Key Aspects\n\nImportant aspects of ${keyword}.`,
    sections: [
      { heading: `Understanding ${keyword}`, content: `Content about ${keyword}.` },
      { heading: "Key Aspects", content: `Important aspects of ${keyword}.` },
    ],
    conclusion: `${keyword} continues to evolve and offers opportunities.`,
    cta: `Start learning about ${keyword} today.`,
    wordCount: 0,
  }
}

function humanizeContent(content: string): LocalHumanized {
  const result = humanizeContentLocal(content)
  return {
    original: result.original,
    humanized: result.humanized,
    changes: result.changes.slice(0, 20).map(c => ({
      original: c.original,
      replacement: c.replacement,
      reason: c.reason,
    })),
  }
}

function checkGrammar(text: string): LocalGrammarResult {
  const result = checkGrammarLocal(text)
  return {
    corrected: result.corrected,
    errors: result.issues.map(i => ({
      type: i.type,
      message: i.message,
      offset: i.offset,
      length: i.length,
      suggestion: i.suggestion,
    })),
    errorCount: result.issues.length,
  }
}

function detectAi(text: string): LocalAiDetection {
  const result = detectAiLocal(text)
  return {
    score: result.overallScore,
    verdict: result.label,
    patterns: result.patterns.map(p => ({
      type: p.type,
      frequency: p.frequency,
      examples: p.examples,
    })),
  }
}

function checkPlagiarism(text: string): LocalPlagiarism {
  const result = runPlagiarismLocal(text)
  return {
    score: 100 - result.originalityScore,
    matches: result.matches.map(m => ({
      text: m.text,
      similarity: m.similarity,
      source: m.source,
    })),
    originalityScore: result.originalityScore,
    safeToPublish: result.safeToPublish,
  }
}

function generateSeoTitles(keyword: string): LocalSeoTitles {
  const titles = generateSeoTitlesLocal(keyword, keyword)
  return {
    titles: titles.map(t => ({
      title: t.title,
      score: t.score,
      chars: t.chars,
    })),
  }
}

function generateMetaDescriptions(keyword: string): LocalMetaDescriptions {
  const descriptions = generateMetaDescriptionsLocal(keyword, keyword)
  return {
    descriptions: descriptions.map(d => ({
      description: d.text,
      score: d.score,
      chars: d.chars,
    })),
  }
}

function generateFaqs(keyword: string): LocalFaqs {
  const { faqs, schema: schemaStr } = generateFaqsLocal("", keyword, 8)
  let schema = {}
  try { schema = JSON.parse(schemaStr) } catch { schema = {} }
  return {
    faqs: faqs.map(f => ({ question: f.question, answer: f.answer })),
    schema,
  }
}

function generateSchema(keyword: string): LocalSchema {
  const schemas = generateSchemaLocal("Article", `Guide to ${keyword}`, `Comprehensive guide about ${keyword}.`, keyword)
  return {
    schemas: schemas as LocalSchema["schemas"],
  }
}

function generateInternalLinks(keyword: string): LocalInternalLinks {
  const links = generateInternalLinksLocal("", keyword)
  return {
    links: links.map(l => ({
      target: l.to,
      anchor: l.anchor,
      relevance: l.relevance,
    })),
  }
}

function checkReadability(text: string): LocalReadability {
  const result = calculateReadability(text)
  return {
    score: result.score,
    grade: result.grade,
    fleschKincaid: result.fleschKincaid,
    sentenceCount: result.sentenceCount,
    wordCount: result.wordCount,
    syllableCount: result.syllableCount,
    averageSentenceLength: result.averageSentenceLength,
    averageSyllablesPerWord: result.averageSyllablesPerWord,
    suggestions: result.suggestions,
  }
}

function finalOptimization(content: string, keyword: string): LocalOptimization {
  const result = calculateReadability(content)
  const words = content.split(/\s+/).filter(w => w.length > 0)
  const wordCount = words.length
  const readingTime = Math.max(1, Math.round(wordCount / 200))
  const lowerContent = content.toLowerCase()
  const kwRegex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
  const keywordCount = (lowerContent.match(kwRegex) || []).length
  const keywordDensity = wordCount > 0 ? Math.round((keywordCount / wordCount) * 1000) / 10 : 0

  const suggestions: LocalOptimization["suggestions"] = []

  if (keywordDensity < 0.5) {
    suggestions.push({ type: "warning", message: `Keyword appears ${keywordCount} times.` })
  } else if (keywordDensity > 3) {
    suggestions.push({ type: "error", message: `Keyword density ${keywordDensity}% too high.` })
  }

  let seoScore = 70
  if (keywordDensity >= 0.5 && keywordDensity <= 3) seoScore += 10
  if (result.score >= 60) seoScore += 10
  if (wordCount >= 300) seoScore += 5
  seoScore = Math.max(0, Math.min(100, seoScore))

  return {
    seoScore,
    keywordDensity,
    headingStructure: [],
    wordCount,
    readingTime,
    suggestions,
  }
}

function generateFallback(prompt: string, workflowSlug: string): string {
  const keyword = extractKeyword(prompt)
  switch (workflowSlug) {
    case "keyword-intelligence": {
      const data = generateKeywordData(keyword, "us", "en")
      return JSON.stringify(data, null, 2)
    }
    case "post-generator": {
      const article = generateArticle(keyword, 1500, "professional", "general", "")
      return [article.intro, article.body, article.conclusion, article.cta].join("\n\n")
    }
    default:
      return `Content for "${keyword}" via ${workflowSlug}.`
  }
}

export const localEngine = {
  generateKeywordData,
  generateOutline,
  generateArticle,
  humanizeContent,
  checkGrammar,
  detectAi,
  checkPlagiarism,
  generateSeoTitles,
  generateMetaDescriptions,
  generateFaqs,
  generateSchema,
  generateInternalLinks,
  checkReadability,
  finalOptimization,
  generateFallback,
}
