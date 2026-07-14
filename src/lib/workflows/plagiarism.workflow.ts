import { runPlagiarismLocal } from "@/lib/engine"
import { copyleaksScanPlagiarism, copyleaksDetectAI } from "@/lib/ai/providers/copyleaks-adapter"
import type { PlagiarismResult } from "@/lib/engine"

export interface PlagiarismWorkflowInput {
  text: string
  checkType?: "web" | "local"
  runAiDetection?: boolean
}

export interface PlagiarismWorkflowOutput {
  success: boolean
  result?: PlagiarismResult
  aiDetection?: {
    score: number
    label: string           // "likely-ai", "likely-human", "mixed", "uncertain"
    sentences: { text: string; score: number }[]
  }
  error?: string
  engine: "copyleaks" | "local"
}

export async function runPlagiarismCheck(input: PlagiarismWorkflowInput): Promise<PlagiarismWorkflowOutput> {
  const { text, runAiDetection = true } = input

  if (!text || text.trim().length === 0) {
    return { success: false, error: "No text provided for plagiarism check", engine: "local" }
  }

  // Minimum length check
  const wordCount = text.split(/\s+/).filter(Boolean).length
  if (wordCount < 20) {
    return {
      success: false,
      error: "Not enough text for a reliable scan. Please provide at least 20 words.",
      engine: "local",
    }
  }

  // Try Copyleaks first, fall back to local
  try {
    const copyleaksResult = await copyleaksScanPlagiarism(text)
    if (copyleaksResult.status === "completed") {
      // Also run AI detection if requested
      let aiDetection = undefined
      if (runAiDetection) {
        aiDetection = await copyleaksDetectAI(text)
      }
      const wordCountVal = text.split(/\s+/).filter(Boolean).length
      return {
        success: true,
        result: {
          originalityScore: copyleaksResult.summary.originalityScore,
          wordCount: wordCountVal,
          characterCount: text.length,
          paragraphCount: text.split(/\n\n+/).length,
          sentenceCount: text.split(/[.!?]+/).filter(Boolean).length,
          matches: copyleaksResult.results.map(r => ({
            text: r.matchedText,
            similarity: r.matchPercent,
            source: r.url,
            type: "web" as const,
            startIndex: 0,
            endIndex: r.matchedText.length,
          })),
          duplicateParagraphs: [],
          repeatedPhrases: [],
          repeatedSentences: [],
          highlightedText: [],
          safeToPublish: copyleaksResult.summary.originalityScore >= 70,
        },
        aiDetection,
        engine: "copyleaks",
      }
    }
    // Copyleaks failed or not configured — fall back to local
  } catch {
    // Fall back to local
  }

  // Local engine fallback
  try {
    const result = runPlagiarismLocal(text)
    let aiDetection = undefined
    if (runAiDetection) {
      const aiScore = localAiDetection(text)
      aiDetection = {
        score: aiScore,
        label: aiScore > 70 ? "likely-ai" : aiScore > 40 ? "mixed" : "likely-human",
        sentences: [],
      }
    }
    return {
      success: true,
      result,
      aiDetection,
      engine: "local",
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Plagiarism check failed",
      engine: "local",
    }
  }
}

// Simple local AI detection heuristic (clearly labeled as estimate)
function localAiDetection(text: string): number {
  const textSentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10)
  if (textSentences.length < 3) return 50

  let aiIndicators = 0
  const total = textSentences.length

  const patterns = [
    /\b(furthermore|moreover|additionally|consequently|therefore|thus|hence|accordingly)\b/gi,
    /\b(it is important to note|it is worth noting|it should be noted)\b/gi,
    /\b(in conclusion|to summarize|in summary|to sum up)\b/gi,
    /\b(comprehensive|multifaceted|nuanced|intricate|paradigm|synergy|holistic|leverage)\b/gi,
    /\b(delve into|embark on|landscape|tapestry|realm|nuances)\b/gi,
  ]

  for (const s of textSentences) {
    let matches = 0
    for (const pattern of patterns) {
      if (pattern.test(s)) matches++
    }
    if (matches >= 2) aiIndicators++
  }

  const baseScore = (aiIndicators / total) * 100
  const lengths = textSentences.map(s => s.trim().split(/\s+/).length)
  const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length
  const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avgLen, 2), 0) / lengths.length
  const uniformityScore = Math.max(0, 60 - Math.sqrt(variance) * 5)

  return Math.min(100, Math.round(baseScore * 0.6 + uniformityScore * 0.4))
}
