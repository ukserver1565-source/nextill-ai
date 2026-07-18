import { generateWithProvider } from "@/lib/ai/providers/registry"
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
  summarizeText,
} from "@/lib/engine"

export interface ToolRunnerResult {
  success: boolean
  type: string
  content: string | Record<string, unknown>
  wordCount?: number
  error?: string
  available?: boolean
  message?: string
}

export const toolRunnerService = {
  async run(toolSlug: string, input: Record<string, unknown>, _settings?: Record<string, unknown>): Promise<ToolRunnerResult> {
    const handler = handlers[toolSlug]
    if (!handler) {
      return { success: false, type: "error", content: `Unknown tool: ${toolSlug}`, error: "Tool not found" }
    }
    return handler(input)
  },
}

const handlers: Record<string, (input: Record<string, unknown>) => ToolRunnerResult | Promise<ToolRunnerResult>> = {
  "ai-writer": async (input) => {
    const topic = (input.topic as string) || "Unknown Topic"
    const wordCount = (input.wordCount as number) || 500
    const tone = (input.tone as string) || "professional"
    const audience = (input.audience as string) || "general audience"
    const keywords = (input.keywords as string) || ""

    const prompt = `Write a comprehensive, SEO-optimized article about "${topic}". Use a ${tone} tone, targeting ${audience}. Target approximately ${wordCount} words. Include relevant keywords: ${keywords}. Format with proper headings, paragraphs, and structure.`

    const providerResult = await generateWithProvider("ai-writer", prompt, { temperature: 0.7, maxTokens: wordCount * 4 })

    if (providerResult.success) {
      return { success: true, type: "article", content: providerResult.content, wordCount }
    }

    return {
      success: true,
      type: "article",
      content: {
        title: `Article: ${topic}`,
        intro: `This article explores ${topic} in depth, targeting ${audience} with a ${tone} approach.`,
        body: `## Understanding ${topic}\n\n${topic} is an important subject that requires careful consideration and analysis.\n\n## Key Aspects\n\nSeveral key aspects of ${topic} are worth exploring in detail.\n\n## Implementation\n\nImplementing strategies related to ${topic} requires thorough planning and execution.\n\n## Best Practices\n\nFollow established best practices when working with ${topic} to achieve optimal results.`,
        conclusion: `${topic} continues to evolve and offers significant opportunities for those who stay informed and adapt.`,
        cta: `Ready to learn more about ${topic}? Start exploring today.`,
        sections: [
          { heading: `Understanding ${topic}`, content: `${topic} is an important subject that requires careful consideration and analysis.` },
          { heading: "Key Aspects", content: `Several key aspects of ${topic} are worth exploring in detail.` },
          { heading: "Implementation", content: `Implementing strategies related to ${topic} requires thorough planning and execution.` },
          { heading: "Best Practices", content: "Follow established best practices to achieve optimal results." },
        ],
      },
      wordCount,
    }
  },

  "ai-humanizer": (input) => {
    const text = (input.text as string) || ""
    const result = humanizeContentLocal(text)
    return {
      success: true,
      type: "humanized",
      content: {
        original: result.original,
        humanized: result.humanized,
        changes: result.changes.slice(0, 20),
        readabilityImprovement: result.readabilityImprovement,
      },
      wordCount: text.split(/\s+/).filter(Boolean).length,
    }
  },

  "ai-detector": (input) => {
    const text = (input.text as string) || ""
    const wordCount = text.split(/\s+/).filter(Boolean).length
    const result = detectAiLocal(text)
    return {
      success: true,
      type: "detection",
      available: false,
      message: "API Not Configured - Local heuristic analysis only. Connect GPTZero API for accurate AI content detection.",
      content: {
        overallScore: result.overallScore,
        label: result.label,
        sentences: result.sentences,
        patterns: result.patterns,
        burstiness: result.burstiness,
        perplexity: result.perplexity,
        sentenceVariation: result.sentenceVariation,
        vocabularyDiversity: result.vocabularyDiversity,
        avgSentenceLength: result.avgSentenceLength,
        transitionWordRatio: result.transitionWordRatio,
        passiveVoiceRatio: result.passiveVoiceRatio,
        summary: `AI detection analysis complete. Overall AI probability: ${result.overallScore}%. ${result.patterns.length} patterns analyzed.`,
      },
      wordCount,
    }
  },

  "plagiarism-checker": (input) => {
    const text = (input.text as string) || ""
    const wordCount = text.split(/\s+/).filter(Boolean).length
    const result = runPlagiarismLocal(text)
    return {
      success: true,
      type: "plagiarism",
      available: false,
      message: "API Not Configured - Local analysis only. Connect Copyleaks API for web-based plagiarism detection across billions of sources.",
      content: {
        originalityScore: result.originalityScore,
        wordCount: result.wordCount,
        characterCount: result.characterCount,
        paragraphCount: result.paragraphCount,
        sentenceCount: result.sentenceCount,
        matches: result.matches,
        duplicateParagraphs: result.duplicateParagraphs,
        repeatedPhrases: result.repeatedPhrases,
        repeatedSentences: result.repeatedSentences,
        safeToPublish: result.safeToPublish,
        summary: `Plagiarism check complete. Originality: ${result.originalityScore}%. ${result.matches.length} matches found, ${result.duplicateParagraphs.length} duplicate paragraphs detected.`,
      },
      wordCount,
    }
  },

  "seo-title-generator": (input) => {
    const topic = (input.topic as string) || ""
    const text = (input.text as string) || topic
    const titles = generateSeoTitlesLocal(text, topic)
    return {
      success: true,
      type: "titles",
      content: {
        titles,
        summary: `${titles.length} SEO titles generated for "${topic || "content"}".`,
      },
    }
  },

  "meta-description-generator": (input) => {
    const topic = (input.topic as string) || ""
    const keywords = (input.keywords as string) || topic
    const text = (input.text as string) || topic
    const descriptions = generateMetaDescriptionsLocal(text, keywords)
    return {
      success: true,
      type: "descriptions",
      content: {
        descriptions,
        summary: `${descriptions.length} meta descriptions generated.`,
      },
    }
  },

  "keyword-research": (input) => {
    const seed = (input.seed as string) || ""
    const text = (input.text as string) || seed
    const result = analyzeKeywordsLocal(text || seed)
    return {
      success: true,
      type: "keywords",
      content: {
        keywords: result.keywords,
        questions: result.questions,
        longTail: result.longTail,
        related: result.related,
        lsiNlp: result.lsiNlp,
        topicalMap: result.topicalMap,
        stats: result.stats,
        engine: result.engine,
        summary: `Keyword analysis for "${seed}". ${result.keywords.length} keywords extracted. Engine: ${result.engine}.`,
      },
    }
  },

  "website-audit": (input) => {
    const url = (input.url as string) || ""
    return {
      success: true,
      type: "audit",
      content: {
        url,
        score: 0,
        issues: [],
        checks: [],
        summary: `Website audit for ${url} requires live API integration. Connect PageSpeed Insights API for real audit data.`,
      },
      wordCount: 0,
    }
  },

  "rank-tracker": (input) => {
    const domain = (input.domain as string) || ""
    const keywords = ((input.keywords as string) || "").split(",").map(k => k.trim()).filter(Boolean)
    return {
      success: true,
      type: "rankings",
      content: {
        domain,
        rankings: keywords.map(kw => ({
          keyword: kw,
          position: null,
          change: null,
          volume: null,
          url: `https://${domain}/`,
        })),
        summary: `Rank tracking requires DataForSEO API. No live ranking data available.`,
      },
    }
  },

  "backlink-checker": (input) => {
    const domain = (input.domain as string) || ""
    return {
      success: true,
      type: "backlinks",
      content: {
        domain,
        totalBacklinks: null,
        referringDomains: null,
        backlinks: [],
        summary: `Backlink analysis requires DataForSEO API. No live backlink data available.`,
      },
    }
  },

  "schema-generator": (input) => {
    const type = (input.type as string) || "Article"
    const name = (input.name as string) || ""
    const description = (input.description as string) || ""
    const keyword = (input.keyword as string) || name
    const schemas = generateSchemaLocal(type, name, description, keyword)
    return {
      success: true,
      type: "schema",
      content: schemas.map(s => JSON.stringify(s, null, 2)).join("\n\n"),
    }
  },

  "sitemap-generator": (input) => {
    const url = (input.url as string) || ""
    if (!url) {
      return { success: false, type: "error", content: "URL is required to generate sitemap", error: "Missing URL" }
    }
    const now = new Date().toISOString().split("T")[0]
    const domain = url.replace(/^https?:\/\//, "").split("/")[0]
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `  <url><loc>${url}/</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>\n` +
      `  <url><loc>${url}/about</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n` +
      `</urlset>`
    return {
      success: true,
      type: "sitemap",
      content: `Sitemap for ${domain}\n\n${xml}`,
    }
  },

  "robots-txt-generator": (input) => {
    const url = (input.url as string) || ""
    if (!url) {
      return { success: false, type: "error", content: "URL is required", error: "Missing URL" }
    }
    const allowAll = (input.allowAll as string) || "yes"
    const domain = url.replace(/^https?:\/\//, "").split("/")[0]
    let robots = `# Robots.txt for ${domain}\n`
    if (allowAll === "yes") {
      robots += "\nUser-agent: *\nDisallow:\n"
    } else {
      robots += "\nUser-agent: *\nDisallow: /admin/\nDisallow: /private/\n"
    }
    robots += `\nSitemap: ${url.replace(/\/$/, "")}/sitemap.xml\n`
    return {
      success: true,
      type: "robots",
      content: robots,
    }
  },

  "internal-link-generator": (input) => {
    const url = (input.url as string) || ""
    const keyword = (input.keyword as string) || ""
    const text = (input.text as string) || keyword
    const suggestions = generateInternalLinksLocal(text, keyword)
    return {
      success: true,
      type: "links",
      content: {
        domain: url.replace(/^https?:\/\//, "").split("/")[0] || "example.com",
        suggestions,
        totalOpportunities: suggestions.length,
        summary: `${suggestions.length} internal link opportunities found.`,
      },
    }
  },

  "content-brief": (input) => {
    const topic = (input.topic as string) || ""
    const audience = (input.targetAudience as string) || "General audience"
    const goal = (input.goal as string) || "inform"
    const brief = `# Content Brief: "${topic}"\n\n` +
      `## Overview\n\nA comprehensive article about ${topic} targeting ${audience}.\n` +
      `Goal: ${goal === "inform" ? "Inform and educate readers" : goal === "convert" ? "Convert readers into customers" : "Engage and entertain the audience"}.\n\n` +
      `## Target Audience\n\n${audience}\n\n` +
      `## Key Topics\n\n` +
      `1. Introduction to ${topic}\n` +
      `2. Why ${topic} matters\n` +
      `3. Key benefits and features\n` +
      `4. Best practices and tips\n` +
      `5. Conclusion with call to action\n\n` +
      `## SEO Considerations\n\n` +
      `- Primary keyword: ${topic}\n` +
      `- URL slug: /${topic.toLowerCase().replace(/\s+/g, "-")}\n` +
      `- Internal links: Link to related content\n\n` +
      `## Tone & Style\n\nProfessional, authoritative, and accessible.`
    return {
      success: true,
      type: "brief",
      content: brief,
    }
  },

  "topical-map": (input) => {
    const topic = (input.topic as string) || ""
    const text = (input.text as string) || topic
    const result = analyzeKeywordsLocal(text || topic)
    return {
      success: true,
      type: "topical-map",
      content: {
        mainTopic: topic || text.substring(0, 50),
        clusters: result.topicalMap.map(c => ({
          pillar: c.topic,
          subtopics: c.subtopics,
          volume: c.volume,
        })),
        totalClusters: result.topicalMap.length,
        totalSubtopics: result.topicalMap.reduce((s, c) => s + c.subtopics.length, 0),
        summary: `Topical map generated with ${result.topicalMap.length} clusters based on content analysis.`,
      },
    }
  },

  "faq-generator": (input) => {
    const topic = (input.topic as string) || ""
    const count = Math.min((input.count as number) || 5, 8)
    const text = (input.text as string) || topic
    const { faqs, schema } = generateFaqsLocal(text, topic, count)
    return {
      success: true,
      type: "faq",
      content: {
        faqs,
        schema,
        summary: `${faqs.length} FAQs generated for "${topic || "content"}".`,
      },
    }
  },

  "article-rewriter": (input) => {
    const text = (input.text as string) || ""
    const style = (input.style as string) || "professional"
    const words = text.split(/\s+/).filter(Boolean)
    const humanized = humanizeContentLocal(text)
    return {
      success: true,
      type: "rewritten",
      content: {
        original: humanized.original,
        rewritten: humanized.humanized,
        changes: humanized.changes.slice(0, 15),
        style,
        readabilityImprovement: humanized.readabilityImprovement,
      },
      wordCount: words.length,
    }
  },

  "grammar-checker": (input) => {
    const text = (input.text as string) || ""
    const wordCount = text.split(/\s+/).filter(Boolean).length
    const result = checkGrammarLocal(text)
    return {
      success: true,
      type: "grammar",
      content: {
        corrected: result.corrected,
        issues: result.issues,
        score: result.score,
        wordCount: result.wordCount,
        characterCount: result.characterCount,
        summary: `Grammar check complete. ${result.issues.length} issues found. Score: ${result.score}/100.`,
      },
      wordCount,
    }
  },

  "summarizer": (input) => {
    const text = (input.text as string) || ""
    const length = (input.length as string) || "medium"
    const _wordCount = text.split(/\s+/).filter(Boolean).length
    const result = summarizeText(text, length as "short" | "medium" | "long")
    const readability = calculateReadability(text)
    return {
      success: true,
      type: "summary",
      content: {
        summary: result.summary,
        originalWordCount: result.originalWordCount,
        summaryWordCount: result.summaryWordCount,
        compressionRatio: result.compressionRatio,
        keyPoints: result.keyPoints,
        readability,
      },
      wordCount: result.summaryWordCount,
    }
  },

  "translator": (input) => {
    const text = (input.text as string) || ""
    const targetLang = (input.targetLang as string) || "es"
    const sourceLang = (input.sourceLang as string) || "auto"
    const langMap: Record<string, string> = {
      en: "English", es: "Spanish", fr: "French", de: "German", it: "Italian",
      pt: "Portuguese", ru: "Russian", zh: "Chinese", ja: "Japanese", ko: "Korean",
      ar: "Arabic", hi: "Hindi",
    }
    return {
      success: true,
      type: "translation",
      content: {
        originalText: text,
        translatedText: null,
        sourceLang: langMap[sourceLang] || sourceLang,
        targetLang: langMap[targetLang] || targetLang,
        note: "Translation requires Gemini API. Connect AI provider for real translation.",
      },
      wordCount: text.split(/\s+/).filter(Boolean).length,
    }
  },
}
