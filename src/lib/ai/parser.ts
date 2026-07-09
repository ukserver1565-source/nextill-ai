export interface ParsedArticle {
  title: string
  metaTitle: string
  metaDescription: string
  slug: string
  excerpt: string
  outline: string[]
  content: string
  faqs: { question: string; answer: string }[]
  pros: string[]
  cons: string[]
  conclusion: string
  schemaJson: string
  internalLinks: { anchor: string; path: string }[]
  externalLinks: { anchor: string; url: string }[]
  cta: string
  tags: string[]
  categories: string[]
  readingTime: number
  wordCount: number
  raw: string
}

function extractSection(text: string, label: string): string {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const re = new RegExp(`${escaped}\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(?:[A-Z\\s]{3,}:|$))`, "i")
  const match = text.match(re)
  return match ? match[1].trim() : ""
}

function extractBlock(text: string, startMarker: string, endMarker: string): string {
  const escaped = startMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const re = new RegExp(`${escaped}\\s*([\\s\\S]*?)(?:${endMarker}|$)`, "i")
  const match = text.match(re)
  return match ? match[1].trim() : ""
}

function extractListItems(text: string): string[] {
  return text
    .split("\n")
    .map(l => l.replace(/^[-*\d.]+(\s+)/, "").trim())
    .filter(Boolean)
}

function extractFAQs(text: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = []
  const qaRegex = /Q:\s*(.+?)\nA:\s*([\s\S]*?)(?=\nQ:|$)/gi
  let match
  while ((match = qaRegex.exec(text)) !== null) {
    faqs.push({ question: match[1].trim(), answer: match[2].trim() })
  }
  return faqs
}

function extractLinks(text: string, type: "internal" | "external"): { anchor: string; path: string }[] | { anchor: string; url: string }[] {
  const links: { anchor: string; path: string }[] = []
  const re = type === "internal"
    ? /\[([^\]]+)\]\s*→\s*\/?([^\s\n]+)/gi
    : /\[([^\]]+)\]\s*→\s*\(([^)]+)\)/gi
  let match
  while ((match = re.exec(text)) !== null) {
    links.push({ anchor: match[1].trim(), path: match[2].trim() } as { anchor: string; path: string })
  }
  return links
}

function extractTags(text: string): string[] {
  const m = text.match(/TAGS:\s*\[?([^\]]+)\]?/i)
  return m ? m[1].split(",").map(t => t.trim().replace(/^\[|\]$/g, "")).filter(Boolean) : []
}

function extractCategories(text: string): string[] {
  const m = text.match(/CATEGORIES:\s*\[?([^\]]+)\]?/i)
  return m ? m[1].split(",").map(c => c.trim().replace(/^\[|\]$/g, "")).filter(Boolean) : []
}

function extractSchema(text: string): string {
  const re = /SCHEMA\s*JSON-LD\s*:\s*\n?```(?:json)?\s*\n?([\s\S]*?)```/i
  const match = text.match(re)
  if (match) {
    try {
      JSON.parse(match[1])
      return match[1].trim()
    } catch {
      return match[1].trim()
    }
  }
  return ""
}

export function parseArticle(raw: string): ParsedArticle {
  const title = extractSection(raw, "TITLE") || extractSection(raw, "TITLE")
  const metaTitle = extractSection(raw, "SEO META TITLE")
  const metaDescription = extractSection(raw, "SEO META DESCRIPTION")
  const slug = extractSection(raw, "SLUG")
  const excerpt = extractSection(raw, "EXCERPT")
  const outlineText = extractBlock(raw, "OUTLINE:", "CONTENT:")
  const outline = outlineText ? extractListItems(outlineText) : []
  const content = extractBlock(raw, "CONTENT:", "FAQS:") || extractBlock(raw, "CONTENT:", "PROS:") || extractBlock(raw, "CONTENT:", "CONCLUSION:")

  const faqs = extractFAQs(raw)
  const prosText = extractBlock(raw, "PROS:", "CONS:")
  const consText = extractBlock(raw, "CONS:", "CONCLUSION:")
  const pros = prosText ? extractListItems(prosText) : []
  const cons = consText ? extractListItems(consText) : []

  const conclusion = extractSection(raw, "CONCLUSION")
  const schemaJson = extractSchema(raw)

  const internalLinks = extractLinks(raw, "internal") as { anchor: string; path: string }[]
  const externalLinks = extractLinks(raw, "external") as { anchor: string; url: string }[]

  const cta = extractSection(raw, "CTA")
  const tags = extractTags(raw)
  const categories = extractCategories(raw)

  const readingTimeMatch = raw.match(/READING TIME:\s*(\d+)\s*minutes?/i)
  const readingTime = readingTimeMatch ? parseInt(readingTimeMatch[1], 10) : Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200))

  const wordCountMatch = raw.match(/WORD COUNT:\s*(\d+)/i)
  const wordCount = wordCountMatch ? parseInt(wordCountMatch[1], 10) : content.split(/\s+/).filter(Boolean).length

  return {
    title: title || extractTitleFromContent(content),
    metaTitle: metaTitle || title,
    metaDescription: metaDescription || excerpt.substring(0, 160),
    slug: slug || generateSlug(title || extractTitleFromContent(content)),
    excerpt: excerpt || content.substring(0, 300),
    outline,
    content: content || raw,
    faqs,
    pros,
    cons,
    conclusion,
    schemaJson,
    internalLinks,
    externalLinks,
    cta,
    tags,
    categories,
    readingTime,
    wordCount,
    raw,
  }
}

function extractTitleFromContent(content: string): string {
  const lines = content.split("\n")
  const h1 = lines.find(l => l.startsWith("# ") && !l.startsWith("## "))
  if (h1) return h1.replace(/^#\s+/, "")
  return "Untitled Article"
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 100)
}
