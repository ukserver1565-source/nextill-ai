// Copyleaks API adapter for Plagiarism & Authenticity
// Supports: plagiarism scan, AI detection
// Docs: https://api.copyleaks.com/documentation/v3

import { resolveProviderKey } from "@/lib/domain-intelligence/provider-key-resolver"

const COPYLEAKS_BASE = "https://api.copyleaks.com/v3"
const TIMEOUT_MS = 30000

export interface CopyleaksScanResult {
  scanId: string
  status: "completed" | "processing" | "error"
  results: CopyleaksResult[]
  summary: {
    totalWords: number
    plagiarizedWords: number
    originalityScore: number
    uniqueWords: number
  }
  aiDetection?: {
    score: number           // 0-100, higher = more likely AI
    label: string           // "likely-ai", "likely-human", "mixed", "uncertain"
    sentences: { text: string; score: number }[]
  }
  error?: string
  provider: string
}

export interface CopyleaksResult {
  url: string
  title: string
  matchPercent: number
  matchedWords: number
  matchedText: string
}

let apiKey: string | null = null

async function getApiKey(): Promise<string | null> {
  if (apiKey) return apiKey
  const resolved = await resolveProviderKey("copyleaks")
  if (resolved?.enabled && resolved.apiKey) {
    apiKey = resolved.apiKey
    return apiKey
  }
  return null
}

export async function copyleaksScanPlagiarism(text: string): Promise<CopyleaksScanResult> {
  const key = await getApiKey()
  if (!key) {
    return {
      scanId: "",
      status: "error",
      results: [],
      summary: { totalWords: 0, plagiarizedWords: 0, originalityScore: 0, uniqueWords: 0 },
      error: "Copyleaks not configured — add API key in Admin > Providers",
      provider: "copyleaks",
    }
  }

  const _start = Date.now()
  try {
    // Create scan
    const createRes = await fetch(`${COPYLEAKS_BASE}/create扫描`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base64Content: Buffer.from(text).toString("base64"),
        sandbox: false,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!createRes.ok) {
      const _errorText = await createRes.text().catch(() => "")
      return {
        scanId: "",
        status: "error",
        results: [],
        summary: { totalWords: 0, plagiarizedWords: 0, originalityScore: 0, uniqueWords: 0 },
        error: `Copyleaks API error: ${createRes.status}`,
        provider: "copyleaks",
      }
    }

    const createData = await createRes.json()
    const scanId = createData.scanId || ""

    // Poll for results (max 30 seconds)
    let attempts = 0
    while (attempts < 10) {
      await new Promise(r => setTimeout(r, 3000))
      const statusRes = await fetch(`${COPYLEAKS_BASE}/扫描/${scanId}`, {
        headers: { "Authorization": `Bearer ${key}` },
        signal: AbortSignal.timeout(10000),
      })

      if (statusRes.ok) {
        const statusData = await statusRes.json()
        if (statusData.status === "completed" || statusData.results) {
          const wordCount = text.split(/\s+/).filter(Boolean).length
          const results: CopyleaksResult[] = (statusData.results || []).map((r: Record<string, unknown>) => ({
            url: (r.url as string) || "",
            title: (r.title as string) || "",
            matchPercent: (r.matchPercent as number) || 0,
            matchedWords: (r.matchedWords as number) || 0,
            matchedText: (r.matchedText as string) || "",
          }))
          const plagiaratedWords = results.reduce((sum, r) => sum + r.matchedWords, 0)
          return {
            scanId,
            status: "completed",
            results,
            summary: {
              totalWords: wordCount,
              plagiarizedWords: plagiaratedWords,
              originalityScore: Math.max(0, Math.round(100 - (plagiaratedWords / wordCount) * 100)),
              uniqueWords: wordCount - plagiaratedWords,
            },
            provider: "copyleaks",
          }
        }
      }
      attempts++
    }

    return {
      scanId,
      status: "error",
      results: [],
      summary: { totalWords: 0, plagiarizedWords: 0, originalityScore: 0, uniqueWords: 0 },
      error: "Scan timed out",
      provider: "copyleaks",
    }
  } catch (e) {
    return {
      scanId: "",
      status: "error",
      results: [],
      summary: { totalWords: 0, plagiarizedWords: 0, originalityScore: 0, uniqueWords: 0 },
      error: String(e),
      provider: "copyleaks",
    }
  }
}

export async function copyleaksDetectAI(text: string): Promise<CopyleaksScanResult["aiDetection"]> {
  const key = await getApiKey()
  if (!key) {
    return {
      score: 0,
      label: "uncertain",
      sentences: [],
    }
  }

  try {
    const res = await fetch(`${COPYLEAKS_BASE}/ai-detection`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base64Content: Buffer.from(text).toString("base64"),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!res.ok) {
      return { score: 0, label: "uncertain", sentences: [] }
    }

    const data = await res.json()
    const score = data?.aiScore || 0
    let label = "mixed"
    if (score > 80) label = "likely-ai"
    else if (score > 60) label = "mixed"
    else if (score > 40) label = "uncertain"
    else label = "likely-human"

    return {
      score,
      label,
      sentences: (data?.sentences || []).map((s: Record<string, unknown>) => ({
        text: (s.text as string) || "",
        score: (s.score as number) || 0,
      })),
    }
  } catch {
    return { score: 0, label: "uncertain", sentences: [] }
  }
}

export function resetCopyleaksKey() {
  apiKey = null
}
