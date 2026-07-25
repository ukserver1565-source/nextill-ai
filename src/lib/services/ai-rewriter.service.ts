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
    const result = await generateText("post-generator", prompt, {
      systemPrompt: REWRITE_SYSTEM_PROMPT,
      temperature: 0.7,
      maxTokens: Math.min(content.split(/\s+/).length * 4, 16000),
    })

    if (result.success && result.content && result.content.trim().length > 50) {
      const rewrittenText = result.content.trim()
      const changes = countChanges(content, rewrittenText)
      return { rewritten: rewrittenText, changes, method: "ai" }
    }

    // AI failed — use local humanizer as fallback
    const localResult = humanizeContentLocal(content)
    return { rewritten: localResult.humanized, changes: localResult.changes.length, method: "local" }
  } catch {
    const localResult = humanizeContentLocal(content)
    return { rewritten: localResult.humanized, changes: localResult.changes.length, method: "local" }
  }
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
