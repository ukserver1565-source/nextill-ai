import { runPlagiarismLocal } from "@/lib/engine"
import type { PlagiarismResult } from "@/lib/engine"

export interface PlagiarismWorkflowInput {
  text: string
  checkType?: "web" | "local"
}

export interface PlagiarismWorkflowOutput {
  success: boolean
  result?: PlagiarismResult
  error?: string
  engine: "copyleaks" | "originality" | "local"
}

export async function runPlagiarismCheck(input: PlagiarismWorkflowInput): Promise<PlagiarismWorkflowOutput> {
  const { text } = input

  if (!text || text.trim().length === 0) {
    return { success: false, error: "No text provided for plagiarism check", engine: "local" }
  }

  try {
    const result = runPlagiarismLocal(text)
    return {
      success: true,
      result,
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
