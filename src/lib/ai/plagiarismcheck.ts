/**
 * PlagiarismCheck.org API Client
 * Token: g8wx9zI_K4XhrX7XBuslyphJRg4hVaYh
 * Docs: https://plagiarismcheck.org/api-docs/
 */

const BASE_URL = "https://api.plagiarismcheck.org"
const API_TOKEN = process.env.PLAGIARISMCHECK_API_KEY || ""

export interface PlagiarismResult {
  success: boolean
  score: number // percentage of original content
  originalityScore: number
  similarityScore: number
  totalWords: number
  matchedSources: Array<{ url: string; matchedWords: number }>
  error?: string
}

export async function checkPlagiarism(text: string): Promise<PlagiarismResult> {
  if (!API_TOKEN) {
    return {
      success: false, score: 0, originalityScore: 0, similarityScore: 0,
      totalWords: 0, matchedSources: [], error: "PLAGIARISMCHECK_API_KEY not configured",
    }
  }

  try {
    // Step 1: Submit text for checking
    const submitRes = await fetch(`${BASE_URL}/api/v1/create-text`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, name: "AdultPulse Check" }),
    })

    if (!submitRes.ok) {
      const err = await submitRes.text()
      return {
        success: false, score: 0, originalityScore: 0, similarityScore: 0,
        totalWords: 0, matchedSources: [], error: `PlagCheck submit failed: ${submitRes.status} ${err}`,
      }
    }

    const submitData = await submitRes.json()
    const checkId = submitData.id

    if (!checkId) {
      return {
        success: false, score: 0, originalityScore: 0, similarityScore: 0,
        totalWords: 0, matchedSources: [], error: "No check ID returned",
      }
    }

    // Step 2: Poll for results (max 30 seconds)
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 2000))

      const resultRes = await fetch(`${BASE_URL}/api/v1/result/${checkId}`, {
        headers: { "Authorization": `Token ${API_TOKEN}` },
      })

      if (!resultRes.ok) continue

      const resultData = await resultRes.json()

      if (resultData.percentage === undefined && !resultData.done) {
        continue // Still processing
      }

      const percentage = resultData.percentage ?? 0
      const totalWords = text.split(/\s+/).filter(Boolean).length
      const sources = (resultData.report_url ? [{ url: resultData.report_url, matchedWords: 0 }] : [])

      return {
        success: true,
        score: 100 - percentage, // originality score
        originalityScore: 100 - percentage,
        similarityScore: percentage,
        totalWords,
        matchedSources: sources,
      }
    }

    return {
      success: false, score: 0, originalityScore: 0, similarityScore: 0,
      totalWords: 0, matchedSources: [], error: "PlagCheck timed out after 30s",
    }
  } catch (e) {
    return {
      success: false, score: 0, originalityScore: 0, similarityScore: 0,
      totalWords: 0, matchedSources: [], error: `PlagCheck request failed: ${e}`,
    }
  }
}
