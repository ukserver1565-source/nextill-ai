export interface SeoTitle {
  id: number
  title: string
  score: number
  chars: number
}

export interface MetaDescription {
  id: number
  text: string
  score: number
  chars: number
}

export interface FaqItem {
  question: string
  answer: string
}

export interface InternalLink {
  from: string
  to: string
  anchor: string
  relevance: number
}

export interface SchemaOutput {
  "@context": string
  "@type": string
  [key: string]: unknown
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9']+/).filter(w => w.length > 0)
}

function extractKeywords(text: string, count = 5): string[] {
  const words = tokenize(text)
  const freq: Record<string, number> = {}
  for (const w of words) {
    if (w.length > 3) freq[w] = (freq[w] || 0) + 1
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([w]) => w)
}

export function generateSeoTitlesLocal(text: string, topic: string): SeoTitle[] {
  const kw = topic || extractKeywords(text, 1)[0] || "topic"
  const capitalized = kw.charAt(0).toUpperCase() + kw.slice(1)
  const year = new Date().getFullYear().toString()

  const templates = [
    { pattern: `{keyword}: The Ultimate Guide for {year}`, score: 92 },
    { pattern: `{keyword} – Everything You Need to Know`, score: 88 },
    { pattern: `Top 10 {keyword} Strategies That Actually Work`, score: 85 },
    { pattern: `How to Master {keyword} in Easy Steps`, score: 83 },
    { pattern: `The Complete {keyword} Handbook for Beginners`, score: 80 },
    { pattern: `{keyword} Explained: A Simple Guide`, score: 78 },
    { pattern: `Why {keyword} Matters More Than Ever in {year}`, score: 82 },
    { pattern: `Expert {keyword} Tips You Need to Know`, score: 79 },
    { pattern: `{keyword} vs Traditional Approaches`, score: 76 },
    { pattern: `The Future of {keyword}: Trends to Watch`, score: 77 },
  ]

  return templates.map((t, i) => {
    const title = t.pattern.replace(/\{keyword\}/g, capitalized).replace(/\{year\}/g, year)
    return {
      id: i + 1,
      title,
      score: Math.min(100, t.score + Math.floor(Math.random() * 6 - 3)),
      chars: title.length,
    }
  })
}

export function generateMetaDescriptionsLocal(text: string, keywords: string): MetaDescription[] {
  const kw = keywords || extractKeywords(text, 1)[0] || "topic"
  const capitalized = kw.charAt(0).toUpperCase() + kw.slice(1)

  const templates = [
    `Discover everything about ${capitalized} in this comprehensive guide. Learn proven strategies, best practices, and expert tips to master ${kw} and achieve your goals.`,
    `Looking for the best ${kw} resources? Our complete guide covers everything from basics to advanced techniques for maximum results.`,
    `${capitalized} doesn't have to be complicated. Learn how to implement effective ${kw} strategies with our step-by-step guide.`,
    `Unlock the power of ${capitalized} with expert insights and actionable tips. This guide shows you how to leverage ${kw} for maximum impact.`,
    `Master ${capitalized} with our expertly curated guide. From fundamentals to advanced tactics, get everything you need to succeed.`,
  ]

  return templates.map((t, i) => ({
    id: i + 1,
    text: t,
    score: Math.max(70, 95 - i * 4 - Math.floor(Math.random() * 5)),
    chars: t.length,
  }))
}

export function generateFaqsLocal(text: string, keyword: string, count = 5): { faqs: FaqItem[]; schema: string } {
  const kw = keyword || extractKeywords(text, 1)[0] || "topic"
  const capitalized = kw.charAt(0).toUpperCase() + kw.slice(1)

  const faqTemplates: Array<FaqItem> = [
    { question: `What is ${kw}?`, answer: `${capitalized} refers to the practice of optimizing content and strategies to achieve better visibility, engagement, and results in the digital landscape.` },
    { question: `Why is ${kw} important?`, answer: `${capitalized} is important because it helps businesses and individuals achieve better outcomes through targeted, data-driven approaches and proven methodologies.` },
    { question: `How does ${kw} work?`, answer: `${capitalized} works by applying systematic frameworks and analytical methods to understand, optimize, and improve performance across relevant metrics.` },
    { question: `What are the benefits of ${kw}?`, answer: `Key benefits include improved efficiency, better resource allocation, enhanced decision-making, and measurable improvements in key performance indicators.` },
    { question: `How can I get started with ${kw}?`, answer: `Getting started involves understanding your goals, researching best practices, selecting appropriate tools, and developing a structured implementation plan.` },
    { question: `What tools are best for ${kw}?`, answer: `The best tools depend on your specific needs but typically include analytics platforms, research tools, optimization software, and performance monitors.` },
    { question: `What are common mistakes with ${kw}?`, answer: `Common mistakes include lack of clear strategy, insufficient planning, poor execution, inconsistent application, and failing to measure results.` },
    { question: `How do I measure ${kw} success?`, answer: `Success can be measured through KPIs such as engagement rates, conversion metrics, quality scores, efficiency gains, and ROI measurements.` },
  ]

  const faqs = faqTemplates.slice(0, Math.min(count, faqTemplates.length))
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }, null, 2)

  return { faqs, schema }
}

export function generateSchemaLocal(
  type: string,
  name: string,
  description: string,
  keyword: string
): SchemaOutput[] {
  const schemas: SchemaOutput[] = []

  switch (type) {
    case "article":
    case "Article":
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: name || `${keyword} Guide`,
        description: description || `Comprehensive guide about ${keyword}.`,
        author: { "@type": "Organization", name: "Nextill AI" },
        datePublished: new Date().toISOString().split("T")[0],
      })
      break
    case "localBusiness":
      schemas.push({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: name || "Business Name",
        description: description || `Local business specializing in ${keyword}.`,
      })
      break
    case "product":
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Product",
        name: name || keyword,
        description: description || `${keyword} product details.`,
      })
      break
    default:
      schemas.push({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: name || keyword,
        description: description || `Page about ${keyword}.`,
      })
  }

  return schemas
}

export function generateInternalLinksLocal(content: string, keyword: string): InternalLink[] {
  const kw = keyword || extractKeywords(content, 1)[0] || "topic"
  const slug = kw.toLowerCase().replace(/[^a-z0-9]+/g, "-")

  return [
    { from: "/blog", to: `/guides/${slug}`, anchor: `Complete ${kw} Guide`, relevance: 95 },
    { from: "/tools", to: `/blog/${slug}-strategies`, anchor: `Effective ${kw} Strategies`, relevance: 85 },
    { from: "/resources", to: `/tools/${slug}-analyzer`, anchor: `${kw} Analyzer Tool`, relevance: 78 },
  ]
}

export function analyzeSeo(text: string, keyword: string): {
  seoScore: number
  keywordDensity: number
  headingStructure: string[]
  wordCount: number
  readingTime: number
  suggestions: Array<{ type: "error" | "warning" | "info"; message: string }>
} {
  const words = tokenize(text)
  const wordCount = words.length
  const readingTime = Math.max(1, Math.round(wordCount / 200))
  const lowerText = text.toLowerCase()

  // Keyword density
  const kwRegex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
  const keywordCount = (lowerText.match(kwRegex) || []).length
  const keywordDensity = wordCount > 0 ? Math.round((keywordCount / wordCount) * 1000) / 10 : 0

  // Heading structure
  const headingRegex = /^#{1,6}\s+.+$/gm
  const headingMatches = text.match(headingRegex) || []

  const suggestions: Array<{ type: "error" | "warning" | "info"; message: string }> = []

  if (keywordDensity < 0.5) {
    suggestions.push({ type: "warning", message: `Keyword "${keyword}" appears ${keywordCount} times. Consider increasing to 1-2% density.` })
  } else if (keywordDensity > 3) {
    suggestions.push({ type: "error", message: `Keyword density is ${keywordDensity}%. Reduce to avoid keyword stuffing.` })
  } else {
    suggestions.push({ type: "info", message: `Keyword density at ${keywordDensity}% is within optimal range.` })
  }

  if (headingMatches.length < 2) {
    suggestions.push({ type: "warning", message: "Add headings (H2, H3) to improve structure and SEO." })
  } else {
    suggestions.push({ type: "info", message: `${headingMatches.length} headings found. Good structure.` })
  }

  if (wordCount < 300) {
    suggestions.push({ type: "error", message: `Content is too short (${wordCount} words). Aim for 300+ words.` })
  } else if (wordCount < 1000) {
    suggestions.push({ type: "warning", message: "Consider expanding content beyond 1000 words." })
  } else {
    suggestions.push({ type: "info", message: `Word count of ${wordCount} is good for SEO.` })
  }

  const hasLinks = lowerText.includes("</a>") || lowerText.includes("href=")
  if (!hasLinks) {
    suggestions.push({ type: "warning", message: "Add internal/external links to improve authority." })
  }

  const hasImages = lowerText.includes("<img") || lowerText.includes("![")
  if (!hasImages) {
    suggestions.push({ type: "info", message: "Add images with alt text to improve engagement." })
  }

  const errorCount = suggestions.filter(s => s.type === "error").length
  const warningCount = suggestions.filter(s => s.type === "warning").length
  const baseScore = 85
  const seoScore = Math.max(0, Math.min(100,
    baseScore - errorCount * 10 - warningCount * 5 +
    (keywordDensity >= 0.5 && keywordDensity <= 3 ? 5 : -5) +
    (headingMatches.length >= 2 ? 5 : -5) +
    (hasLinks ? 5 : 0)
  ))

  return {
    seoScore,
    keywordDensity,
    headingStructure: headingMatches.map(h => h.trim()),
    wordCount,
    readingTime,
    suggestions,
  }
}
