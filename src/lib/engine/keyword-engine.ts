export interface KeywordData {
  keyword: string
  volume: number
  difficulty: number
  cpc: number | null
  intent: string
  trend: string
  competition: number
}

export interface QuestionData {
  question: string
  volume: number
  difficulty: number
  topic: string
}

export interface LongTailData {
  keyword: string
  volume: number
  difficulty: number
  parentKeyword: string
}

export interface RelatedData {
  keyword: string
  relevance: number
  volume: number
}

export interface LsiTerm {
  term: string
  category: string
  strength: number
}

export interface TopicalCluster {
  topic: string
  subtopics: string[]
  volume: number
}

export interface KeywordResult {
  keywords: KeywordData[]
  questions: QuestionData[]
  longTail: LongTailData[]
  related: RelatedData[]
  lsiNlp: LsiTerm[]
  topicalMap: TopicalCluster[]
  stats: {
    totalKeywords: number
    avgDifficulty: number
    totalVolume: number
    topPosition: string
  }
  engine: "dataforseo" | "local"
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9']+/).filter(w => w.length > 2)
}

function getNGrams(words: string[], n: number): string[] {
  const result: string[] = []
  for (let i = 0; i <= words.length - n; i++) {
    result.push(words.slice(i, i + n).join(" "))
  }
  return result
}

const questionWords = ["what", "how", "why", "when", "where", "which", "can", "do", "is", "are", "does", "will", "should"]
const intentPatterns: Array<{ regex: RegExp; intent: string }> = [
  { regex: /\b(buy|price|cost|pricing|cheap|affordable|discount|deal|shop|order|purchase)\b/i, intent: "transactional" },
  { regex: /\b(best|top|vs|versus|compare|comparison|review|alternative|vs\s|or\s)/i, intent: "commercial" },
  { regex: /\b(how|what|why|when|where|tutorial|guide|learn|understand|explain|meaning|definition)\b/i, intent: "informational" },
  { regex: /\b(login|signup|register|download|app|website|official|site|homepage)\b/i, intent: "navigational" },
]

export function analyzeKeywordsLocal(text: string): KeywordResult {
  const words = tokenize(text)
  const uniqueWords = [...new Set(words)]
  const wordCount = words.length

  // TF-IDF style frequency
  const freq: Record<string, number> = {}
  for (const w of words) freq[w] = (freq[w] || 0) + 1

  // Extract bigrams and trigrams as phrase candidates
  const bigrams = getNGrams(words, 2)
  const trigrams = getNGrams(words, 3)
  const phraseFreq: Record<string, number> = {}
  for (const bg of bigrams) phraseFreq[bg] = (phraseFreq[bg] || 0) + 1
  for (const tg of trigrams) phraseFreq[tg] = (phraseFreq[tg] || 0) + 1

  // Score candidate keywords
  const candidates: Array<{ keyword: string; score: number }> = []

  for (const [phrase, count] of Object.entries(phraseFreq)) {
    if (count > 0) {
      candidates.push({ keyword: phrase, score: count * Math.log(phrase.split(" ").length + 1) * phrase.length })
    }
  }

  for (const [word, count] of Object.entries(freq)) {
    if (!candidates.find(c => c.keyword === word)) {
      candidates.push({ keyword: word, score: count * Math.log(1 + word.length) })
    }
  }

  candidates.sort((a, b) => b.score - a.score)
  const topKeywords = candidates.slice(0, 25)

  // Determine intent for each keyword
  const getIntent = (kw: string): string => {
    for (const { regex, intent } of intentPatterns) {
      if (regex.test(kw)) return intent
    }
    return "informational"
  }

  const keywords: KeywordData[] = topKeywords.map((k, i) => ({
    keyword: k.keyword,
    volume: null as unknown as number,
    difficulty: Math.round(Math.min(95, Math.max(5, (1 - k.score / (topKeywords[0]?.score || 1)) * 80 + 10))),
    cpc: null,
    intent: getIntent(k.keyword),
    trend: "stable",
    competition: Math.round(Math.min(1, (1 - i / topKeywords.length) * 0.8) * 100) / 100,
  }))

  // Generate question-based keywords
  const questions: QuestionData[] = []
  const contentWords = words.filter(w => w.length > 3)
  const topContentWords = [...new Set(contentWords)].slice(0, 10)
  for (const w of topContentWords) {
    const qw = questionWords[Math.floor(Math.random() * questionWords.length)]
    questions.push({
      question: `${qw.charAt(0).toUpperCase() + qw.slice(1)} ${qw === "How" ? "to" : "does"} ${w} ${["work", "help", "compare", "cost", "benefit", "improve"][Math.floor(Math.random() * 6)]}?`,
      volume: null as unknown as number,
      difficulty: Math.round(Math.random() * 50 + 20),
      topic: w,
    })
  }

  // Generate long-tail keywords
  const longTail: LongTailData[] = []
  for (const k of keywords.slice(0, 8)) {
    const prefixes = ["how to", "best", "what is", "why", "when to", "where to", "top", "simple"]
    const suffixes = ["for beginners", "guide", "tips", "examples", "step by step", "in 2025", "online", "near me"]
    for (let i = 0; i < 2; i++) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
      longTail.push({
        keyword: `${prefix} ${k.keyword} ${suffix}`.trim(),
        volume: null as unknown as number,
        difficulty: Math.round(Math.min(95, k.difficulty + Math.floor(Math.random() * 20 - 10))),
        parentKeyword: k.keyword,
      })
    }
  }

  // Related keywords (word co-occurrence within text)
  const related: RelatedData[] = []
  const seen = new Set<string>()
  for (let i = 0; i < words.length - 1; i++) {
    const pair = words[i] + " " + words[i + 1]
    if (!seen.has(pair) && pair.split(" ").every(w => w.length > 2)) {
      seen.add(pair)
      related.push({
        keyword: pair,
        relevance: Math.round(Math.random() * 40 + 60),
        volume: null as unknown as number,
      })
    }
  }
  related.sort((a, b) => b.relevance - a.relevance)

  // LSI terms (semantically related)
  const lsiNlp: LsiTerm[] = []
  const categories = ["topics", "concepts", "entities", "attributes", "actions"]
  const uniqueContentWords = [...new Set(contentWords)].slice(0, 15)
  for (const w of uniqueContentWords) {
    const cat = categories[Math.floor(Math.random() * categories.length)]
    lsiNlp.push({
      term: w,
      category: cat,
      strength: Math.round((freq[w] / Math.max(1, wordCount)) * 1000) / 10,
    })
  }
  lsiNlp.sort((a, b) => b.strength - a.strength)

  // Topical map (cluster related terms)
  const topicalMap: TopicalCluster[] = []
  const clusterSize = Math.min(5, Math.ceil(keywords.length / 4))
  for (let i = 0; i < Math.min(4, keywords.length); i++) {
    const kw = keywords[i]
    const subtopics = keywords
      .slice(i + 1, i + 1 + clusterSize)
      .map(k => k.keyword)
    topicalMap.push({
      topic: kw.keyword,
      subtopics,
      volume: null as unknown as number,
    })
  }

  // Stats
  const avgDifficulty = Math.round(keywords.reduce((s, k) => s + k.difficulty, 0) / Math.max(1, keywords.length))
  const topPosition = keywords.length > 0 ? keywords[0].keyword : "N/A"

  return {
    keywords: keywords.map(k => ({ ...k, volume: 0, cpc: 0 })),
    questions: questions.map(q => ({ ...q, volume: 0 })),
    longTail: longTail.map(l => ({ ...l, volume: 0 })),
    related: related.slice(0, 15).map(r => ({ ...r, volume: 0 })),
    lsiNlp: lsiNlp.slice(0, 20),
    topicalMap: topicalMap.map(t => ({ ...t, volume: 0 })),
    stats: {
      totalKeywords: keywords.length,
      avgDifficulty,
      totalVolume: 0,
      topPosition,
    },
    engine: "local",
  }
}
