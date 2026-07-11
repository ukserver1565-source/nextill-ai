export interface PlagiarismMatch {
  text: string
  similarity: number
  source: string
  type: "web" | "local_duplicate"
  startIndex: number
  endIndex: number
}

export interface PlagiarismResult {
  originalityScore: number
  wordCount: number
  characterCount: number
  paragraphCount: number
  sentenceCount: number
  matches: PlagiarismMatch[]
  duplicateParagraphs: Array<{ paragraph: string; paragraphIndex: number; count: number }>
  repeatedPhrases: Array<{ phrase: string; count: number }>
  repeatedSentences: Array<{ sentence: string; count: number }>
  highlightedText: Array<{ text: string; startIndex: number; endIndex: number; type: "duplicate" | "similar" }>
  safeToPublish: boolean
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean)
}

function sentences(text: string): string[] {
  return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0)
}

function paragraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0)
}

function getNgrams(words: string[], n: number): string[] {
  const result: string[] = []
  for (let i = 0; i <= words.length - n; i++) {
    result.push(words.slice(i, i + n).join(" "))
  }
  return result
}

function tfidf(sentTokens: string[][]): Array<{ sentence: string; vector: Record<string, number> }> {
  const docCount = sentTokens.length
  const df: Record<string, number> = {}
  for (const tokens of sentTokens) {
    const unique = new Set(tokens)
    for (const token of unique) {
      df[token] = (df[token] || 0) + 1
    }
  }
  return sentTokens.map(tokens => {
    const tf: Record<string, number> = {}
    for (const token of tokens) {
      tf[token] = (tf[token] || 0) + 1
    }
    const vector: Record<string, number> = {}
    for (const [token, count] of Object.entries(tf)) {
      const idf = Math.log((docCount + 1) / (df[token] + 1)) + 1
      vector[token] = (count / tokens.length) * idf
    }
    return { sentence: tokens.join(" "), vector }
  })
}

function cosineSimilarity(a: Record<string, number>, b: Record<string, number>): number {
  let dot = 0, normA = 0, normB = 0
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of allKeys) {
    const va = a[key] || 0
    const vb = b[key] || 0
    dot += va * vb
    normA += va * va
    normB += vb * vb
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter(x => b.has(x)))
  const union = new Set([...a, ...b])
  if (union.size === 0) return 0
  return intersection.size / union.size
}

export function runPlagiarismLocal(text: string): PlagiarismResult {
  const wordCount = text.split(/\s+/).filter(Boolean).length
  const characterCount = text.length
  const paraList = paragraphs(text)
  const sentList = sentences(text)
  const paragraphCount = paraList.length
  const sentenceCount = sentList.length
  const words = tokenize(text)
  const matches: PlagiarismMatch[] = []
  const highlightedText: PlagiarismResult["highlightedText"] = []
  const duplicateParagraphs: PlagiarismResult["duplicateParagraphs"] = []
  const repeatedPhrases: PlagiarismResult["repeatedPhrases"] = []
  const repeatedSentences: PlagiarismResult["repeatedSentences"] = []

  // 1. N-gram similarity (4-grams and 6-grams) between sentences
  const sentTokensList = sentList.map(s => tokenize(s))
  const tfidfVectors = tfidf(sentTokensList)

  for (let i = 0; i < sentList.length; i++) {
    for (let j = i + 1; j < sentList.length; j++) {
      const sim = cosineSimilarity(tfidfVectors[i].vector, tfidfVectors[j].vector)
      if (sim > 0.6) {
        matches.push({
          text: sentList[i].substring(0, 120),
          similarity: Math.round(sim * 100),
          source: "[Local] Sentence-level duplication detected",
          type: "local_duplicate",
          startIndex: text.indexOf(sentList[i]),
          endIndex: text.indexOf(sentList[i]) + sentList[i].length,
        })
        highlightedText.push({
          text: sentList[i].substring(0, 80),
          startIndex: text.indexOf(sentList[i]),
          endIndex: text.indexOf(sentList[i]) + sentList[i].length,
          type: sim > 0.8 ? "duplicate" : "similar",
        })
      }
    }
  }

  // 2. N-gram shingling (word 4-grams with Jaccard similarity)
  const all4grams = getNgrams(words, 4)
  const all6grams = getNgrams(words, 6)
  const seen4grams = new Map<string, number[]>()
  all4grams.forEach((gram, idx) => {
    if (seen4grams.has(gram)) {
      seen4grams.get(gram)!.push(idx)
    } else {
      seen4grams.set(gram, [idx])
    }
  })
  for (const [gram, indices] of seen4grams) {
    if (indices.length > 1) {
      repeatedPhrases.push({ phrase: gram, count: indices.length })
    }
  }

  // 3. Duplicate paragraph detection
  const paraTokens = paraList.map(p => new Set(tokenize(p)))
  for (let i = 0; i < paraList.length; i++) {
    let dupCount = 0
    for (let j = i + 1; j < paraList.length; j++) {
      const jac = jaccardSimilarity(paraTokens[i], paraTokens[j])
      if (jac > 0.7) dupCount++
    }
    if (dupCount > 0) {
      duplicateParagraphs.push({
        paragraph: paraList[i].substring(0, 100),
        paragraphIndex: i,
        count: dupCount,
      })
    }
  }

  // 4. Repeated sentences (exact match of normalized sentences)
  const sentNorm = sentList.map(s => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim())
  const sentCount = new Map<string, { count: number; index: number }>()
  sentNorm.forEach((s, i) => {
    if (s.length > 10) {
      if (sentCount.has(s)) {
        sentCount.get(s)!.count++
      } else {
        sentCount.set(s, { count: 1, index: i })
      }
    }
  })
  for (const [s, { count }] of sentCount) {
    if (count > 1) {
      repeatedSentences.push({ sentence: s.substring(0, 80), count })
    }
  }

  // 5. Calculate originality score
  const totalDuplicates = matches.length + duplicateParagraphs.length
  const phrasePenalty = repeatedPhrases.reduce((sum, p) => sum + (p.count - 1) * 2, 0)
  const sentencePenalty = repeatedSentences.reduce((sum, s) => sum + (s.count - 1) * 5, 0)
  const totalPenalty = totalDuplicates * 8 + phrasePenalty + sentencePenalty

  let originalityScore = Math.max(0, Math.min(100, 100 - totalPenalty))
  if (wordCount === 0) originalityScore = 100

  return {
    originalityScore,
    wordCount,
    characterCount,
    paragraphCount,
    sentenceCount,
    matches,
    duplicateParagraphs,
    repeatedPhrases: repeatedPhrases.slice(0, 20),
    repeatedSentences: repeatedSentences.slice(0, 10),
    highlightedText: highlightedText.slice(0, 20),
    safeToPublish: originalityScore >= 70,
  }
}
