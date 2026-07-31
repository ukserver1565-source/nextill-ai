export interface PlagiarismMatch {
  text: string
  similarity: number
  source: string
  type: "web" | "local_duplicate" | "common_phrase" | "ai_pattern"
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
  analysis: {
    vocabularyDiversity: number
    sentenceVariety: number
    aiPatternScore: number
    commonPhraseCount: number
    selfDuplicationPercent: number
  }
}

// Common AI/templated phrases that indicate low originality
const COMMON_AI_PHRASES = [
  "in today's digital landscape",
  "it's important to note that",
  "harness the power of",
  "at its core",
  "in conclusion",
  "it goes without saying",
  "as we move forward",
  "the bottom line is",
  "in this article we will",
  "let's dive in",
  "without further ado",
  "in the world of",
  "when it comes to",
  "one of the most significant",
  "plays a crucial role",
  "has gained tremendous traction",
  "streamline complex processes",
  "enhance decision-making",
  "measurable improvements",
  "sustainable competitive advantages",
  "data-driven insights",
  "cutting-edge",
  "leverage",
  "synergy",
  "paradigm shift",
  "game changer",
  "best practices",
  "key performance indicators",
  "return on investment",
  "holistic approach",
  "value proposition",
  "stakeholder engagement",
  "continuous improvement",
  "organizational buy-in",
  "phased implementation",
  "cross-functional team",
  "knowledge sharing",
  "proven best practices",
  "real-world implementation",
  "diverse contexts and industries",
  "collective wisdom",
  "practitioners who have successfully",
  "foundations of effective",
  "solid understanding of the basic principles",
  "foundation for every technique",
]

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean)
}

function sentences(text: string): string[] {
  return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10)
}

function paragraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 20)
}

function getNgrams(words: string[], n: number): string[] {
  const result: string[] = []
  for (let i = 0; i <= words.length - n; i++) {
    result.push(words.slice(i, i + n).join(" "))
  }
  return result
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

// Calculate vocabulary diversity (unique words / total words)
function vocabularyDiversity(words: string[]): number {
  if (words.length === 0) return 1
  const unique = new Set(words)
  return unique.size / words.length
}

// Calculate sentence length variety (coefficient of variation)
function sentenceVariety(sents: string[]): number {
  if (sents.length < 2) return 1
  const lengths = sents.map(s => s.split(/\s+/).length)
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length
  const variance = lengths.reduce((sum, l) => sum + (l - mean) ** 2, 0) / lengths.length
  const cv = Math.sqrt(variance) / (mean || 1)
  return Math.min(1, cv) // Normalize to 0-1
}

// Detect AI patterns in text
function detectAiPatterns(text: string): { score: number; matches: string[] } {
  const lower = text.toLowerCase()
  const matches: string[] = []
  let score = 0

  for (const phrase of COMMON_AI_PHRASES) {
    if (lower.includes(phrase)) {
      matches.push(phrase)
      score += 5
    }
  }

  // Check for overly formal patterns
  const formalPatterns = [
    /\bFurthermore\b/g,
    /\bMoreover\b/g,
    /\bConsequently\b/g,
    /\bAdditionally\b/g,
    /\bNevertheless\b/g,
    /\bSubsequently\b/g,
    /\bNotwithstanding\b/g,
  ]
  for (const pattern of formalPatterns) {
    const count = (text.match(pattern) || []).length
    if (count > 2) {
      score += count * 3
      matches.push(`Overuse of formal transition (${count}x)`)
    }
  }

  // Check for sentence starter patterns
  const starters = text.match(/^(It is|This is|There are|There is|In order to)/gm) || []
  if (starters.length > 3) {
    score += starters.length * 4
    matches.push(`Repetitive sentence starters (${starters.length}x)`)
  }

  return { score: Math.min(100, score), matches }
}

export function runPlagiarismLocal(text: string): PlagiarismResult {
  const wordCount = text.split(/\s+/).filter(Boolean).length
  const characterCount = text.length
  const paraList = paragraphs(text)
  const sentList = sentences(text)
  const paragraphCount = paraList.length
  const sentenceCount = sentList.length

  if (wordCount < 30) {
    return {
      originalityScore: 100,
      wordCount,
      characterCount,
      paragraphCount,
      sentenceCount,
      matches: [],
      duplicateParagraphs: [],
      repeatedPhrases: [],
      repeatedSentences: [],
      highlightedText: [],
      safeToPublish: true,
      analysis: {
        vocabularyDiversity: 1,
        sentenceVariety: 1,
        aiPatternScore: 0,
        commonPhraseCount: 0,
        selfDuplicationPercent: 0,
      },
    }
  }

  const words = tokenize(text)
  const matches: PlagiarismMatch[] = []
  const highlightedText: PlagiarismResult["highlightedText"] = []
  const duplicateParagraphs: PlagiarismResult["duplicateParagraphs"] = []
  const repeatedPhrases: PlagiarismResult["repeatedPhrases"] = []
  const repeatedSentences: PlagiarismResult["repeatedSentences"] = []

  // 1. TF-IDF + Cosine similarity between sentences (self-duplication)
  const sentTokensList = sentList.map(s => tokenize(s))
  const tfidfVectors = tfidf(sentTokensList)

  for (let i = 0; i < sentList.length; i++) {
    for (let j = i + 1; j < sentList.length; j++) {
      const sim = cosineSimilarity(tfidfVectors[i].vector, tfidfVectors[j].vector)
      if (sim > 0.5) {
        matches.push({
          text: sentList[i].substring(0, 120),
          similarity: Math.round(sim * 100),
          source: "[Self] Sentence-level duplication detected",
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

  // 2. N-gram shingling (4-grams) for repeated phrases
  const all4grams = getNgrams(words, 4)
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

  // 3. Duplicate paragraph detection (Jaccard similarity)
  const paraTokens = paraList.map(p => new Set(tokenize(p)))
  for (let i = 0; i < paraList.length; i++) {
    let dupCount = 0
    for (let j = i + 1; j < paraList.length; j++) {
      const jac = jaccardSimilarity(paraTokens[i], paraTokens[j])
      if (jac > 0.6) dupCount++
    }
    if (dupCount > 0) {
      duplicateParagraphs.push({
        paragraph: paraList[i].substring(0, 100),
        paragraphIndex: i,
        count: dupCount,
      })
    }
  }

  // 4. Repeated sentences (exact match)
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

  // 5. AI pattern detection
  const aiResult = detectAiPatterns(text)
  for (const phrase of aiResult.matches) {
    const idx = text.toLowerCase().indexOf(phrase.toLowerCase())
    if (idx >= 0) {
      matches.push({
        text: phrase,
        similarity: 100,
        source: "[AI Pattern] Common AI/templated phrase detected",
        type: "ai_pattern",
        startIndex: idx,
        endIndex: idx + phrase.length,
      })
    }
  }

  // 6. Calculate metrics
  const vocabDiv = vocabularyDiversity(words)
  const sentVar = sentenceVariety(sentList)
  const selfDupPercent = Math.round((matches.filter(m => m.type === "local_duplicate").length / Math.max(1, sentenceCount)) * 100)

  // 7. Calculate originality score
  const totalSentenceDups = matches.filter(m => m.type === "local_duplicate").length
  const phrasePenalty = repeatedPhrases.reduce((sum, p) => sum + (p.count - 1) * 2, 0)
  const sentencePenalty = repeatedSentences.reduce((sum, s) => sum + (s.count - 1) * 5, 0)
  const paraPenalty = duplicateParagraphs.length * 10
  const aiPenalty = Math.floor(aiResult.score / 5)

  const totalPenalty = totalSentenceDups * 6 + phrasePenalty + sentencePenalty + paraPenalty + aiPenalty

  // Vocabulary diversity bonus (higher = more original)
  const vocabBonus = vocabDiv > 0.6 ? 5 : vocabDiv > 0.5 ? 2 : 0

  let originalityScore = Math.max(0, Math.min(100, 100 - totalPenalty + vocabBonus))
  if (wordCount === 0) originalityScore = 100

  return {
    originalityScore,
    wordCount,
    characterCount,
    paragraphCount,
    sentenceCount,
    matches: matches.slice(0, 50),
    duplicateParagraphs,
    repeatedPhrases: repeatedPhrases.slice(0, 20),
    repeatedSentences: repeatedSentences.slice(0, 10),
    highlightedText: highlightedText.slice(0, 20),
    safeToPublish: originalityScore >= 70,
    analysis: {
      vocabularyDiversity: Math.round(vocabDiv * 100),
      sentenceVariety: Math.round(sentVar * 100),
      aiPatternScore: aiResult.score,
      commonPhraseCount: aiResult.matches.length,
      selfDuplicationPercent: selfDupPercent,
    },
  }
}
