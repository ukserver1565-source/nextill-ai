import { analyzeKeywordsLocal } from "@/lib/engine"
import type { KeywordResult } from "@/lib/engine"

export interface KeywordWorkflowInput {
  keyword: string
  country?: string
  language?: string
}

export interface KeywordWorkflowOutput {
  success: boolean
  result?: KeywordResult
  error?: string
  engine: "dataforseo" | "local"
}

export async function runKeywordIntelligence(input: KeywordWorkflowInput): Promise<KeywordWorkflowOutput> {
  const { keyword } = input

  if (!keyword || keyword.trim().length === 0) {
    return { success: false, error: "No keyword provided for analysis", engine: "local" }
  }

  try {
    const result = analyzeKeywordsLocal(keyword)
    return {
      success: true,
      result,
      engine: "local",
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Keyword analysis failed",
      engine: "local",
    }
  }
}
