export interface WriterInput {
  keyword?: string
  primaryKeyword?: string
  secondaryKeywords?: string
  topic?: string
  articleType: string
  wordCount: number
  tone: string
  audience?: string
  keyPoints?: string[]
  brandVoice?: string
  targetCountry?: string
  targetLanguage?: string
  writingStyle?: string
  temperature?: number
  creativity?: number
  pointOfView?: string
  [key: string]: unknown
}

function getKeyword(input: WriterInput): string {
  return input.keyword || input.primaryKeyword || input.topic || ""
}

export function buildSystemPrompt(input: WriterInput): string {
  const kw = getKeyword(input)
  return `You are an expert SEO content writer. Write a ${input.articleType} about "${kw}".
Tone: ${input.tone}
Word count: ${input.wordCount}
${input.audience ? `Target audience: ${input.audience}` : ""}
${input.brandVoice ? `Brand voice: ${input.brandVoice}` : ""}
${input.targetCountry ? `Target country: ${input.targetCountry}` : ""}
${input.targetLanguage ? `Target language: ${input.targetLanguage}` : ""}
Write with proper SEO structure including H1, H2, H3 headings, meta description, and schema markup.`
}

export function buildGenerationPrompt(input: WriterInput): string {
  const kw = getKeyword(input)
  let prompt = `Write a comprehensive ${input.articleType} about "${kw}".\n\n`
  prompt += `Requirements:\n`
  prompt += `- Word count: approximately ${input.wordCount} words\n`
  prompt += `- Tone: ${input.tone}\n`
  if (input.audience) prompt += `- Target audience: ${input.audience}\n`
  if (input.keyPoints?.length) prompt += `- Key points to cover: ${input.keyPoints.join(", ")}\n`
  if (input.brandVoice) prompt += `- Brand voice: ${input.brandVoice}\n`
  prompt += `\nStructure the article with:\n`
  prompt += `1. SEO-optimized title and meta description\n`
  prompt += `2. Well-structured H1, H2, H3 headings\n`
  prompt += `3. Engaging introduction\n`
  prompt += `4. Comprehensive body content\n`
  prompt += `5. FAQ section\n`
  prompt += `6. Conclusion with call-to-action\n`
  prompt += `7. Schema JSON-LD markup\n`
  prompt += `8. Internal and external link suggestions\n`
  prompt += `\nFormat the response with clear section labels (TITLE:, SEO META TITLE:, SEO META DESCRIPTION:, SLUG:, EXCERPT:, OUTLINE:, CONTENT:, FAQS:, CONCLUSION:, CTA:, SCHEMA JSON-LD:, TAGS:, CATEGORIES:)`
  return prompt
}
