/**
 * RewriteAI API Client
 * Base URL: https://rewriteai.com
 * Endpoints: /api/v1/humanize, /api/v1/write
 */

const REWRITEAI_BASE = "https://rewriteai.com"
const API_KEY = process.env.REWRITEAI_API_KEY || ""

export interface RewriteAIResponse {
  results: Array<{ text: string }>
  wordsUsed: number
}

export async function humanizeText(text: string): Promise<{
  success: boolean
  content: string
  wordsUsed: number
  error?: string
}> {
  if (!API_KEY) {
    return { success: false, content: "", wordsUsed: 0, error: "REWRITEAI_API_KEY not configured" }
  }

  try {
    const res = await fetch(`${REWRITEAI_BASE}/api/v1/humanize`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })

    if (!res.ok) {
      const err = await res.text()
      return { success: false, content: "", wordsUsed: 0, error: `RewriteAI ${res.status}: ${err}` }
    }

    const data: RewriteAIResponse = await res.json()
    const humanized = data.results?.[0]?.text || text
    return { success: true, content: humanized, wordsUsed: data.wordsUsed || 0 }
  } catch (e) {
    return { success: false, content: "", wordsUsed: 0, error: `RewriteAI request failed: ${e}` }
  }
}

export async function generateText(
  prompt: string,
  options?: { wordCount?: number; category?: string }
): Promise<{
  success: boolean
  content: string
  wordsUsed: number
  error?: string
}> {
  if (!API_KEY) {
    return { success: false, content: "", wordsUsed: 0, error: "REWRITEAI_API_KEY not configured" }
  }

  try {
    const body: Record<string, unknown> = { text: prompt }
    if (options?.wordCount) body.wordCount = options.wordCount
    if (options?.category) body.category = options.category

    const res = await fetch(`${REWRITEAI_BASE}/api/v1/write`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      return { success: false, content: "", wordsUsed: 0, error: `RewriteAI ${res.status}: ${err}` }
    }

    const data: RewriteAIResponse = await res.json()
    const generated = data.results?.[0]?.text || ""
    return { success: true, content: generated, wordsUsed: data.wordsUsed || 0 }
  } catch (e) {
    return { success: false, content: "", wordsUsed: 0, error: `RewriteAI request failed: ${e}` }
  }
}
