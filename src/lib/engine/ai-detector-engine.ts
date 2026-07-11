export interface AIDetectionPattern {
  type: string
  frequency: number
  examples: string[]
}

export interface AIDetectionSentence {
  text: string
  score: number
  label: "ai" | "human" | "uncertain"
}

export interface AIDetectionResult {
  overallScore: number
  label: string
  sentences: AIDetectionSentence[]
  patterns: AIDetectionPattern[]
  burstiness: number
  perplexity: number
  sentenceVariation: number
  vocabularyDiversity: number
  avgSentenceLength: number
  transitionWordRatio: number
  passiveVoiceRatio: number
}

const transitionWords = new Set([
  "however", "therefore", "furthermore", "moreover", "nevertheless",
  "consequently", "additionally", "meanwhile", "otherwise", "thus",
  "hence", "accordingly", "besides", "indeed", "instead", "likewise",
  "meanwhile", "nonetheless", "otherwise", "subsequently", "then",
  "thereafter", "thereby", "therefore", "furthermore", "additionally",
  "also", "and", "but", "or", "yet", "so", "because", "since",
  "although", "though", "while", "whereas", "after", "before",
  "firstly", "secondly", "finally", "next", "lastly",
])

const aiIndicatorPhrases = [
  "in conclusion", "it is important to note", "when it comes to",
  "it is worth noting", "dive into", "in today's digital",
  "landscape", "harness the power", "revolutionize",
  "game-changer", "cutting-edge", "world-class", "best-in-class",
  "seamlessly", "robust", "dynamic", "innovative", "transformative",
  "it is crucial", "it is essential", "it is imperative",
  "in the realm of", "a plethora of", "the fact of the matter",
  "it goes without saying", "in the ever-evolving",
  "in this article, we will", "this article aims to",
]

const passiveIndicators = /\b(am|is|are|was|were|be|been|being)\s+(\w+ed|written|built|created|known|seen|taken|given|found|shown|made|used|set|told|held|kept|led|felt|meant|let|put|run|paid|said|done|gone|got|won|lost)\b/gi

function sentences(text: string): string[] {
  return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0)
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean)
}

function estimatePerplexity(text: string): number {
  const words = tokenize(text)
  if (words.length < 5) return 0
  const freq: Record<string, number> = {}
  for (const w of words) freq[w] = (freq[w] || 0) + 1
  let logProb = 0
  for (const w of words) {
    const prob = (freq[w] || 1) / words.length
    logProb += Math.log(prob)
  }
  return Math.round(Math.exp(-logProb / words.length) * 100) / 100
}

export function detectAiLocal(text: string): AIDetectionResult {
  const sentList = sentences(text)
  const words = tokenize(text)
  const wordCount = words.length
  const sentenceCount = sentList.length

  if (wordCount === 0) {
    return {
      overallScore: 0, label: "No Content",
      sentences: [], patterns: [],
      burstiness: 0, perplexity: 0, sentenceVariation: 0,
      vocabularyDiversity: 0, avgSentenceLength: 0,
      transitionWordRatio: 0, passiveVoiceRatio: 0,
    }
  }

  // Sentence lengths
  const sentLengths = sentList.map(s => s.split(/\s+/).filter(Boolean).length)
  const avgSentenceLength = sentLengths.reduce((a, b) => a + b, 0) / Math.max(1, sentenceCount)

  // Burstiness = coefficient of variation of sentence lengths (higher = more human-like)
  const mean = avgSentenceLength
  const variance = sentLengths.reduce((sum, l) => sum + (l - mean) ** 2, 0) / Math.max(1, sentenceCount)
  const stdDev = Math.sqrt(variance)
  const burstiness = mean > 0 ? stdDev / mean : 0

  // Sentence variation: how much sentence beginnings vary
  const firstWords = sentList.map(s => tokenize(s)[0]).filter(Boolean)
  const uniqueStarts = new Set(firstWords)
  const sentenceVariation = Math.min(1, uniqueStarts.size / Math.max(1, firstWords.length))

  // Vocabulary diversity (type-token ratio)
  const uniqueWords = new Set(words)
  const vocabularyDiversity = Math.min(1, uniqueWords.size / Math.max(1, wordCount))

  // Transition word ratio
  const transitionCount = words.filter(w => transitionWords.has(w)).length
  const transitionWordRatio = transitionCount / Math.max(1, wordCount)

  // Passive voice ratio
  const passiveMatches = text.match(passiveIndicators)
  const passiveVoiceCount = passiveMatches ? passiveMatches.length : 0
  const passiveVoiceRatio = passiveVoiceCount / Math.max(1, sentenceCount)

  // AI phrase patterns
  const lowerText = text.toLowerCase()
  const foundPatterns: Record<string, number> = {}
  for (const phrase of aiIndicatorPhrases) {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
    const count = (lowerText.match(regex) || []).length
    if (count > 0) foundPatterns[phrase] = count
  }

  // Perplexity estimate
  const perplexity = estimatePerplexity(text)

  // Score calculation: combine signals
  // Low burstiness (< 0.6) suggests AI (uniform sentences)
  // Low sentence variation suggests AI
  // Low vocabulary diversity suggests AI
  // High transition word ratio suggests AI
  // High passive voice suggests AI
  // Many AI phrases → AI
  // Low perplexity → AI

  const burstinessScore = burstiness < 0.5 ? 25 : burstiness < 0.7 ? 15 : burstiness < 1.0 ? 5 : 0
  const sentenceVarScore = sentenceVariation < 0.3 ? 20 : sentenceVariation < 0.5 ? 12 : sentenceVariation < 0.7 ? 5 : 0
  const vocabScore = vocabularyDiversity < 0.3 ? 15 : vocabularyDiversity < 0.5 ? 8 : vocabularyDiversity < 0.7 ? 3 : 0
  const transitionScore = transitionWordRatio > 0.12 ? 12 : transitionWordRatio > 0.08 ? 6 : 0
  const passiveScore = passiveVoiceRatio > 0.3 ? 8 : passiveVoiceRatio > 0.15 ? 4 : 0
  const aiPhraseScore = Object.values(foundPatterns).reduce((sum: number, c) => sum + c * 3, 0)
  const perplexityScore = perplexity > 0 && perplexity < 0.05 ? 10 : perplexity < 0.1 ? 5 : 0

  const totalAiScore = Math.min(100,
    burstinessScore + sentenceVarScore + vocabScore +
    transitionScore + passiveScore + aiPhraseScore + perplexityScore
  )

  const overallScore = Math.round(totalAiScore)
  let label: string
  if (overallScore < 25) label = "Likely Human-Written"
  else if (overallScore < 50) label = "Possibly Human-Written"
  else if (overallScore < 75) label = "Possibly AI-Generated"
  else label = "Likely AI-Generated"

  // Per-sentence analysis
  const sentenceScores: AIDetectionSentence[] = sentList.slice(0, 20).map(s => {
    const sWords = tokenize(s)
    const sLen = sWords.length
    const sUnique = new Set(sWords)
    const sVocab = sUnique.size / Math.max(1, sLen)
    const sPassive = passiveIndicators.test(s)
    let sScore = 0
    if (sVocab < 0.4) sScore += 20
    if (sPassive) sScore += 15
    if (sLen > 30 || sLen < 3) sScore += 10
    const pCount = aiIndicatorPhrases.filter(p => s.toLowerCase().includes(p)).length
    sScore += pCount * 10
    const final = Math.min(100, sScore)
    return {
      text: s.substring(0, 120),
      score: final,
      label: final < 30 ? "human" : final < 60 ? "uncertain" : "ai",
    }
  })

  const patterns: AIDetectionPattern[] = [
    { type: "burstiness", frequency: Math.round((1 - burstiness) * 100), examples: [`CV=${burstiness.toFixed(2)}`] },
    { type: "sentence variation", frequency: Math.round((1 - sentenceVariation) * 100), examples: [`unique starts: ${uniqueStarts.size}/${firstWords.length}`] },
    { type: "vocabulary diversity", frequency: Math.round((1 - vocabularyDiversity) * 100), examples: [`TTR=${vocabularyDiversity.toFixed(2)}`] },
    { type: "AI phrasing patterns", frequency: Math.round(aiPhraseScore), examples: Object.keys(foundPatterns).slice(0, 3) },
    { type: "passive voice density", frequency: Math.round(passiveVoiceRatio * 100), examples: [`${passiveVoiceCount} passive constructions`] },
  ].filter(p => p.frequency > 0)

  return {
    overallScore,
    label,
    sentences: sentenceScores,
    patterns,
    burstiness: Math.round(burstiness * 100) / 100,
    perplexity: Math.round(perplexity * 100) / 100,
    sentenceVariation: Math.round(sentenceVariation * 100) / 100,
    vocabularyDiversity: Math.round(vocabularyDiversity * 100) / 100,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    transitionWordRatio: Math.round(transitionWordRatio * 100) / 100,
    passiveVoiceRatio: Math.round(passiveVoiceRatio * 100) / 100,
  }
}
