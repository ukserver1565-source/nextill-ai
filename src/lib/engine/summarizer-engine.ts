export interface SummaryResult {
  summary: string
  originalWordCount: number
  summaryWordCount: number
  compressionRatio: number
  keyPoints: string[]
}

function sentences(text: string): string[] {
  return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0)
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9']+/).filter(w => w.length > 0)
}

export function summarizeText(text: string, length: "short" | "medium" | "long" = "medium"): SummaryResult {
  const words = tokenize(text)
  const originalWordCount = words.length
  const sentList = sentences(text)

  if (sentList.length === 0) {
    return { summary: "", originalWordCount: 0, summaryWordCount: 0, compressionRatio: 0, keyPoints: [] }
  }

  // Score sentences by word frequency (extractive summarization)
  const wordFreq: Record<string, number> = {}
  for (const w of words) {
    if (w.length > 2) wordFreq[w] = (wordFreq[w] || 0) + 1
  }

  const sentenceScores: Array<{ sentence: string; score: number; index: number }> = sentList.map((s, i) => {
    const sWords = tokenize(s)
    let score = 0
    for (const w of sWords) {
      score += wordFreq[w] || 0
    }
    // Position bias (first and last sentences get bonus)
    if (i === 0) score *= 1.5
    if (i === sentList.length - 1) score *= 1.3
    // Normalize by length
    score = score / Math.max(1, sWords.length)
    return { sentence: s, score, index: i }
  })

  sentenceScores.sort((a, b) => b.score - a.score)

  const targetRatio = length === "short" ? 0.15 : length === "medium" ? 0.3 : 0.5
  const targetWordCount = Math.max(20, Math.round(originalWordCount * targetRatio))

  // Select top sentences maintaining order
  const selectedIndices = new Set<number>()
  let wordSum = 0
  for (const ss of sentenceScores) {
    if (wordSum >= targetWordCount) break
    if (!selectedIndices.has(ss.index)) {
      selectedIndices.add(ss.index)
      wordSum += tokenize(ss.sentence).length
    }
  }

  const selected = [...selectedIndices].sort((a, b) => a - b)
  const summary = selected.map(i => sentList[i]).join(". ") + "."

  // Key points (top 3-5 sentences by score)
  const keyPoints = sentenceScores
    .slice(0, Math.min(5, sentenceScores.length))
    .map(s => s.sentence.length > 100 ? s.sentence.substring(0, 100) + "..." : s.sentence)

  return {
    summary,
    originalWordCount,
    summaryWordCount: tokenize(summary).length,
    compressionRatio: Math.round((1 - tokenize(summary).length / Math.max(1, originalWordCount)) * 100),
    keyPoints,
  }
}
