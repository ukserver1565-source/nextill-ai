import { providerEngine } from "@/lib/provider/provider-engine"
const { generateText } = providerEngine
import { humanizeContentLocal } from "@/lib/engine"
import type { HumanizeResult } from "@/lib/engine"

const HUMANIZE_SYSTEM_PROMPT = `You are an expert content humanizer. Your job is to rewrite AI-generated text to make it sound completely natural and human-written while preserving the original meaning and SEO value.

RULES:
1. Keep the same topic, meaning, and key points — do NOT add or remove information
2. Vary sentence length — mix short punchy sentences with longer ones
3. Use natural conversational transitions (not formulaic ones like "Furthermore" or "Moreover")
4. Add personal touches — opinions, rhetorical questions, relatable examples
5. Use contractions naturally (don't, it's, we're, they've)
6. Break AI patterns — avoid "In today's digital landscape", "It's important to note", "Harness the power"
7. Add imperfect but natural phrasing — real humans don't write perfectly
8. Keep paragraphs varied in length — not all the same size
9. Use active voice predominantly
10. Maintain the original structure (headings, sections) but make the prose feel organic
11. If the text has SEO keywords, weave them in naturally — don't stuff them

OUTPUT: Return ONLY the rewritten text. No explanations, no meta-commentary, no "Here is the rewritten version:" — just the text itself.`

function buildHumanizePrompt(content: string): string {
  const wordCount = content.split(/\s+/).length
  return `Rewrite this ${wordCount}-word article to sound completely human-written. Make it feel like a knowledgeable person wrote it naturally, not like an AI generated it. Keep the same meaning, structure, and SEO value.

ARTICLE TO HUMANIZE:

${content}`
}

export async function humanizeContentWithAI(content: string): Promise<HumanizeResult> {
  if (!content || content.trim().length < 50) {
    return humanizeContentLocal(content)
  }

  try {
    const prompt = buildHumanizePrompt(content)
    const result = await generateText("ai-humanizer", prompt, {
      systemPrompt: HUMANIZE_SYSTEM_PROMPT,
      temperature: 0.85,
      maxTokens: Math.min(content.split(/\s+/).length * 4, 16000),
    })

    const candidate = result.content?.trim() || ""
    // Only accept if the result is actually related to the original — a generic
    // template fallback ("Content for X via ai-humanizer") fails the overlap check.
    if (result.success && candidate.length > 50 && contentOverlap(content, candidate) >= 0.15) {
      const humanizedText = candidate
      const afterScore = humanizeContentLocal(humanizedText)

      const changes = extractChanges(content, humanizedText)

      return {
        original: content,
        humanized: humanizedText,
        changes,
        readabilityImprovement: Math.round((afterScore.readabilityImprovement || 0) * 10) / 10,
      }
    }

    // AI failed or returned empty/unrelated — fall back to local
    return humanizeContentLocal(content)
  } catch {
    // On any error, fall back to local engine
    return humanizeContentLocal(content)
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

function extractChanges(original: string, humanized: string): HumanizeResult["changes"] {
  const origSentences = original.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10)
  const humanSentences = humanized.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10)

  const changes: HumanizeResult["changes"] = []
  const checked = new Set<number>()

  for (let i = 0; i < Math.min(origSentences.length, humanSentences.length); i++) {
    if (checked.has(i)) continue
    const orig = origSentences[i]?.trim()
    const hum = humanSentences[i]?.trim()
    if (!orig || !hum) continue

    if (orig !== hum) {
      changes.push({
        original: orig.length > 120 ? orig.slice(0, 117) + "..." : orig,
        replacement: hum.length > 120 ? hum.slice(0, 117) + "..." : hum,
        reason: "AI-rewritten for natural tone",
      })
      checked.add(i)
    }
  }

  return changes.slice(0, 20)
}
