/**
 * PlagiarismCheck.org API Client
 * Docs: https://plagiarismcheck.org/for-developers/
 *
 * Auth: X-API-TOKEN header (NOT Authorization: Token)
 * Base URL: https://plagiarismcheck.org (NOT api.plagiarismcheck.org)
 * Min text length: 80 characters
 */

const BASE_URL = "https://plagiarismcheck.org"
const API_TOKEN = process.env.PLAGIARISMCHECK_API_KEY || ""

export interface PlagiarismResult {
  success: boolean
  score: number
  originalityScore: number
  similarityScore: number
  totalWords: number
  matchedSources: Array<{ url: string; matchedWords: number }>
  reportUrl?: string
  error?: string
}

export async function checkPlagiarism(text: string): Promise<PlagiarismResult> {
  if (!API_TOKEN) {
    return {
      success: false, score: 0, originalityScore: 0, similarityScore: 0,
      totalWords: 0, matchedSources: [], error: "PLAGIARISMCHECK_API_KEY not configured",
    }
  }

  // PlagiarismCheck requires minimum 80 characters
  if (text.length < 80) {
    return {
      success: false, score: 0, originalityScore: 0, similarityScore: 0,
      totalWords: text.split(/\s+/).filter(Boolean).length,
      matchedSources: [],
      error: "Text must be at least 80 characters for PlagiarismCheck.org API",
    }
  }

  try {
    // Step 1: Submit text for checking (API requires form-data, NOT JSON)
    const formData = new FormData()
    formData.append("text", text)
    formData.append("language", "en")

    const submitRes = await fetch(`${BASE_URL}/api/v1/text`, {
      method: "POST",
      headers: {
        "X-API-TOKEN": API_TOKEN,
        // NOTE: Do NOT set Content-Type — browser sets it automatically with boundary for FormData
      },
      body: formData,
    })

    if (!submitRes.ok) {
      const err = await submitRes.text()
      // Handle specific error codes with user-friendly messages
      if (submitRes.status === 409 || err.includes("Not enough pages")) {
        return {
          success: false, score: 0, originalityScore: 0, similarityScore: 0,
          totalWords: text.split(/\s+/).filter(Boolean).length,
          matchedSources: [],
          error: "PlagiarismCheck.org API credits exhausted. Please renew your plan at plagiarismcheck.org or contact support.",
        }
      }
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
        totalWords: 0, matchedSources: [], error: `No check ID returned: ${JSON.stringify(submitData)}`,
      }
    }

    // Step 2: Poll for results (max 60 seconds)
    // Status codes: 2=STORED, 3=SUBMITTED, 4=FAILED, 5=CHECKED
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000))

      const resultRes = await fetch(`${BASE_URL}/api/v1/text/${checkId}`, {
        headers: { "X-API-TOKEN": API_TOKEN },
      })

      if (!resultRes.ok) continue

      const resultData = await resultRes.json()

      // Still processing (status 2 or 3)
      if (resultData.status === 2 || resultData.status === 3) {
        continue
      }

      // Failed
      if (resultData.status === 4) {
        return {
          success: false, score: 0, originalityScore: 0, similarityScore: 0,
          totalWords: 0, matchedSources: [], error: "PlagCheck processing failed on server",
        }
      }

      // Checked (status 5) — get the report
      if (resultData.status === 5) {
        const percentage = resultData.percentage ?? 0
        const totalWords = text.split(/\s+/).filter(Boolean).length
        const reportUrl = `${BASE_URL}/api/v1/text/report/${checkId}`
        const sources = resultData.sources?.map((s: any) => ({
          url: s.url || s.source_url || "",
          matchedWords: s.matched_words || 0,
        })) || []

        return {
          success: true,
          score: 100 - percentage,
          originalityScore: 100 - percentage,
          similarityScore: percentage,
          totalWords,
          matchedSources: sources,
          reportUrl,
        }
      }

      // Check for done flag (legacy format)
      if (resultData.done || resultData.percentage !== undefined) {
        const percentage = resultData.percentage ?? 0
        const totalWords = text.split(/\s+/).filter(Boolean).length

        return {
          success: true,
          score: 100 - percentage,
          originalityScore: 100 - percentage,
          similarityScore: percentage,
          totalWords,
          matchedSources: [],
        }
      }
    }

    return {
      success: false, score: 0, originalityScore: 0, similarityScore: 0,
      totalWords: 0, matchedSources: [], error: "PlagCheck timed out after 60s",
    }
  } catch (e) {
    return {
      success: false, score: 0, originalityScore: 0, similarityScore: 0,
      totalWords: 0, matchedSources: [], error: `PlagCheck request failed: ${e}`,
    }
  }
}
