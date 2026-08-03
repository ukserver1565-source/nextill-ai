import { providerEngine } from "@/lib/provider/provider-engine"
const { generateText } = providerEngine
import { humanizeContentLocal } from "@/lib/engine"

const REWRITE_SYSTEM_PROMPT = `You are an expert content rewriter. Your job is to take AI-humanized text and restructure it for maximum readability, engagement, and SEO performance while keeping the same meaning.

RULES:
1. Fix any awkward phrasing left over from humanization
2. Improve sentence flow and transitions between paragraphs
3. Strengthen weak sentences — make them more impactful
4. Ensure consistent tone throughout (professional but approachable)
5. Optimize paragraph breaks for readability (not walls of text)
6. Add variety to sentence beginnings — avoid repeating the same word
7. Remove filler words and redundant phrases
8. Strengthen the introduction hook and conclusion impact
9. Keep all headings (H1, H2, H3) unchanged
10. Preserve all SEO keywords in their original positions
11. Make the article feel polished and publication-ready

OUTPUT: Return ONLY the rewritten text. No explanations, no meta-commentary — just the polished text.`

function buildRewritePrompt(content: string): string {
  const wordCount = content.split(/\s+/).length
  return `Polish and restructure this ${wordCount}-word article for maximum readability and engagement. Fix awkward phrasing, improve flow, and make it publication-ready. Keep the same meaning, structure, and SEO keywords.

ARTICLE TO POLISH:

${content}`
}

export async function rewriteContentWithAI(content: string): Promise<{
  rewritten: string
  changes: number
  method: "ai" | "local"
}> {
  if (!content || content.trim().length < 100) {
    return { rewritten: content, changes: 0, method: "local" }
  }

  try {
    const prompt = buildRewritePrompt(content)
    // NOTE: use a non-template workflow slug so that when no AI provider is
    // available, generateText does NOT substitute a generic template article.
    const result = await generateText("ai-rewriter", prompt, {
      systemPrompt: REWRITE_SYSTEM_PROMPT,
      temperature: 0.7,
      maxTokens: Math.min(content.split(/\s+/).length * 4, 16000),
    })

    const candidate = result.content?.trim() || ""
    const origWordCount = content.split(/\s+/).length
    const candWordCount = candidate.split(/\s+/).length
    // Only accept the result if it is a REAL provider rewrite: not a local-engine
    // fallback, is actually related to the original content, and is a substantial
    // fraction of its length (a generic one-liner would fail all three checks).
    if (
      result.success &&
      result.provider !== "local-engine" &&
      candidate.length > 50 &&
      candWordCount >= Math.max(20, Math.floor(origWordCount * 0.3)) &&
      contentOverlap(content, candidate) >= 0.15
    ) {
      const rewrittenText = candidate
      const changes = countChanges(content, rewrittenText)
      return { rewritten: rewrittenText, changes, method: "ai" }
    }

    // AI failed or produced unrelated content — use local humanizer as fallback
    const localResult = humanizeContentLocal(content)
    return { rewritten: localResult.humanized, changes: localResult.changes.length, method: "local" }
  } catch {
    const localResult = humanizeContentLocal(content)
    return { rewritten: localResult.humanized, changes: localResult.changes.length, method: "local" }
  }
}

// Fraction of the candidate's significant words that appear in the original.
function contentOverlap(original: string, candidate: string): number {
  const stop = new Set(["the", "and", "for", "are", "that", "this", "with", "from", "you", "your", "have", "will", "not", "was", "were", "they", "them", "about", "what", "when", "where", "which", "into", "more", "than", "then"])
  const origWords = new Set(
    original.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, "")).filter(w => w.length > 3 && !stop.has(w))
  )
  const candWords = candidate.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, "")).filter(w => w.length > 3 && !stop.has(w))
  if (candWords.length === 0) return 0
  const matched = candWords.filter(w => origWords.has(w)).length
  return matched / candWords.length
}

function countChanges(original: string, rewritten: string): number {
  const origWords = original.split(/\s+/)
  const rewWords = rewritten.split(/\s+/)
  let diff = Math.abs(origWords.length - rewWords.length)

  const origSet = new Set(origWords.map(w => w.toLowerCase()))
  const rewSet = new Set(rewWords.map(w => w.toLowerCase()))
  for (const w of rewSet) {
    if (!origSet.has(w)) diff++
  }

  return Math.min(diff, origWords.length)
}
