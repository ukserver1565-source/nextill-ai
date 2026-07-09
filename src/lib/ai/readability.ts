export interface ReadabilityResult {
  score: number
  level: string
  fleschKincaid: number
  passiveVoice: { count: number; percentage: number }
  avgSentenceLength: number
  avgParagraphLength: number
  transitionWords: { count: number; words: string[] }
  longSentences: number
  shortSentences: number
}

const PASSIVE_PATTERN = /\b(am|is|are|was|were|be|been|being|get|gets|got|gotten)\s+(\w+ed|written|built|made|done|said|seen|taken|given|known|shown|kept|left|lost|found|brought|bought|sold|taught|thought|sent|broken|chosen|spoken|driven|drawn|grown|worn|frozen)\b/gi
const TRANSITION_WORDS = [
  "however", "therefore", "furthermore", "moreover", "nevertheless", "consequently",
  "additionally", "meanwhile", "finally", "first", "second", "third", "next", "then",
  "after", "before", "while", "during", "since", "until", "because", "although",
  "though", "whereas", "while", "unless", "despite", "in addition", "on the other hand",
  "in contrast", "similarly", "likewise", "as a result", "for example", "for instance",
  "in particular", "specifically", "usually", "generally", "overall", "thus", "hence",
]

const LONG_SENTENCE_THRESHOLD = 30
const SHORT_SENTENCE_THRESHOLD = 8

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "")
  if (word.length <= 3) return 1
  let count = 0
  const vowels = "aeiouy"
  let prevVowel = false
  for (const ch of word) {
    const isVowel = vowels.includes(ch)
    if (isVowel && !prevVowel) count++
    prevVowel = isVowel
  }
  return Math.max(1, word.endsWith("e") ? count - 1 : count)
}

export function analyzeReadability(text: string): ReadabilityResult {
  if (!text.trim()) {
    return { score: 0, level: "N/A", fleschKincaid: 0, passiveVoice: { count: 0, percentage: 0 }, avgSentenceLength: 0, avgParagraphLength: 0, transitionWords: { count: 0, words: [] }, longSentences: 0, shortSentences: 0 }
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.split(/\s+/).filter(Boolean)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)

  const totalWords = words.length
  const totalSentences = sentences.length || 1
  const totalParagraphs = paragraphs.length || 1
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0)

  const avgSentenceLength = totalWords / totalSentences
  const avgParagraphLength = words.length / totalParagraphs

  const passiveMatches = text.match(PASSIVE_PATTERN)
  const passiveCount = passiveMatches ? passiveMatches.length : 0

  const foundTransitions: string[] = []
  const textLower = text.toLowerCase()
  let transitionCount = 0
  for (const tw of TRANSITION_WORDS) {
    const re = new RegExp(`\\b${tw}\\b`, "gi")
    const matches = textLower.match(re)
    if (matches) {
      transitionCount += matches.length
      foundTransitions.push(tw)
    }
  }

  let longSentences = 0
  let shortSentences = 0
  for (const s of sentences) {
    const wc = s.split(/\s+/).filter(Boolean).length
    if (wc >= LONG_SENTENCE_THRESHOLD) longSentences++
    if (wc <= SHORT_SENTENCE_THRESHOLD) shortSentences++
  }

  const fleschKincaid = 206.835 - 1.015 * avgSentenceLength - 84.6 * (totalSyllables / totalWords)
  const normalized = Math.max(0, Math.min(100, fleschKincaid))
  const level = normalized >= 90 ? "Very Easy" : normalized >= 80 ? "Easy" : normalized >= 70 ? "Fairly Easy" : normalized >= 60 ? "Standard" : normalized >= 50 ? "Fairly Difficult" : normalized >= 30 ? "Difficult" : "Very Difficult"

  return {
    score: Math.round(normalized),
    level,
    fleschKincaid: Math.round(fleschKincaid * 100) / 100,
    passiveVoice: { count: passiveCount, percentage: Math.round((passiveCount / totalSentences) * 100) },
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgParagraphLength: Math.round(avgParagraphLength * 10) / 10,
    transitionWords: { count: transitionCount, words: [...new Set(foundTransitions)] },
    longSentences,
    shortSentences,
  }
}
