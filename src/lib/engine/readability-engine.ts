export interface ReadabilityResult {
  score: number
  grade: string
  fleschKincaid: number
  fleschKincaidGrade: number
  sentenceCount: number
  wordCount: number
  syllableCount: number
  characterCount: number
  paragraphCount: number
  averageSentenceLength: number
  averageSyllablesPerWord: number
  readingTimeMinutes: number
  readingTimeSeconds: number
  suggestions: string[]
}

export interface HumanizeResult {
  original: string
  humanized: string
  changes: Array<{ original: string; replacement: string; reason: string }>
  readabilityImprovement: number
}

const replacements: Array<{ pattern: RegExp; replacement: string; reason: string }> = [
  { pattern: /\bin order to\b/gi, replacement: "to", reason: "Simplify phrasing" },
  { pattern: /\butilize\b/gi, replacement: "use", reason: "More natural word choice" },
  { pattern: /\bimplementation\b/gi, replacement: "setup", reason: "More conversational" },
  { pattern: /\bdemonstrate\b/gi, replacement: "show", reason: "Simplify vocabulary" },
  { pattern: /\bsubsequently\b/gi, replacement: "then", reason: "Reduce formality" },
  { pattern: /\bcommence\b/gi, replacement: "start", reason: "Use everyday language" },
  { pattern: /\bendeavor\b/gi, replacement: "try", reason: "Simplify word choice" },
  { pattern: /\bfurthermore\b/gi, replacement: "also", reason: "More conversational flow" },
  { pattern: /\bnevertheless\b/gi, replacement: "but", reason: "Natural transition" },
  { pattern: /\bconsequently\b/gi, replacement: "so", reason: "Simplify cause-effect" },
  { pattern: /\bacquire\b/gi, replacement: "get", reason: "Everyday vocabulary" },
  { pattern: /\bconstruct\b/gi, replacement: "build", reason: "Natural wording" },
  { pattern: /\bdetermine\b/gi, replacement: "figure out", reason: "Conversational tone" },
  { pattern: /\bestablish\b/gi, replacement: "set up", reason: "Simplify phrasing" },
  { pattern: /\bfacilitate\b/gi, replacement: "help", reason: "More direct" },
  { pattern: /\bindicate\b/gi, replacement: "show", reason: "Simplify" },
  { pattern: /\bnumerous\b/gi, replacement: "many", reason: "Natural quantity word" },
  { pattern: /\bobtain\b/gi, replacement: "get", reason: "Everyday language" },
  { pattern: /\bpossess\b/gi, replacement: "have", reason: "Common verb" },
  { pattern: /\bprior to\b/gi, replacement: "before", reason: "Natural timing" },
  { pattern: /\bprovide\b/gi, replacement: "give", reason: "Simplify" },
  { pattern: /\bregarding\b/gi, replacement: "about", reason: "More conversational" },
  { pattern: /\brequired\b/gi, replacement: "needed", reason: "Everyday word" },
  { pattern: /\bsufficient\b/gi, replacement: "enough", reason: "Natural quantity" },
  { pattern: /\bverify\b/gi, replacement: "check", reason: "Common action word" },
  { pattern: /\bperuse\b/gi, replacement: "read", reason: "Simplify word choice" },
  { pattern: /\bdisambiguate\b/gi, replacement: "clarify", reason: "More direct" },
  { pattern: /\butilizing\b/gi, replacement: "using", reason: "Common grammar" },
  { pattern: /\bleverage\b/gi, replacement: "use", reason: "Reduce jargon" },
  { pattern: /\boptimize\b/gi, replacement: "improve", reason: "More natural" },
]

const contractions: Array<[RegExp, string]> = [
  [/\bcannot\b/gi, "can't"],
  [/\bwill not\b/gi, "won't"],
  [/\bdo not\b/gi, "don't"],
  [/\bdid not\b/gi, "didn't"],
  [/\bdoes not\b/gi, "doesn't"],
  [/\bis not\b/gi, "isn't"],
  [/\bare not\b/gi, "aren't"],
  [/\bwas not\b/gi, "wasn't"],
  [/\bwere not\b/gi, "weren't"],
  [/\bhave not\b/gi, "haven't"],
  [/\bhas not\b/gi, "hasn't"],
  [/\bhad not\b/gi, "hadn't"],
  [/\bI am\b/gi, "I'm"],
  [/\byou are\b/gi, "you're"],
  [/\bwe are\b/gi, "we're"],
  [/\bthey are\b/gi, "they're"],
  [/\bit is\b/gi, "it's"],
]

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "")
  if (w.length <= 3) return 1
  const syls = w.replace(/[^aeiouy]*[aeiouy]+/g, "a").length
  return Math.max(1, syls)
}

export function calculateReadability(text: string): ReadabilityResult {
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  const wordCount = words.length
  const characterCount = text.length
  const sentenceCount = Math.max(1, sentences.length)
  const paragraphCount = Math.max(1, paragraphs.length)

  const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0)
  const avgSentenceLength = wordCount / sentenceCount
  const avgSyllablesPerWord = syllableCount / wordCount

  const fleschKincaid = Math.round((206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord) * 10) / 10
  const fleschKincaidGrade = Math.round((0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59) * 10) / 10
  const score = Math.max(0, Math.min(100, fleschKincaid))

  let grade: string
  if (score >= 90) grade = "Very Easy (5th grade)"
  else if (score >= 80) grade = "Easy (6th grade)"
  else if (score >= 70) grade = "Fairly Easy (7th grade)"
  else if (score >= 60) grade = "Standard (8th-9th grade)"
  else if (score >= 50) grade = "Fairly Difficult (10th-12th grade)"
  else if (score >= 30) grade = "Difficult (College)"
  else grade = "Very Difficult (College Graduate)"

  const readingTimeMinutes = wordCount / 200
  const readingTimeSeconds = Math.round((wordCount / 200) * 60)

  const suggestions: string[] = []
  if (avgSentenceLength > 20) suggestions.push("Consider shortening sentences for better readability.")
  if (avgSyllablesPerWord > 1.7) suggestions.push("Try using shorter words to improve comprehension.")
  if (score < 60) suggestions.push("Aim for shorter paragraphs and simpler vocabulary.")
  if (sentenceCount < 5) suggestions.push("Break content into more sentences for better flow.")
  if (paragraphCount < 3) suggestions.push("Use more paragraphs to improve visual structure.")

  return {
    score: Math.round(score),
    grade,
    fleschKincaid,
    fleschKincaidGrade,
    sentenceCount,
    wordCount,
    syllableCount,
    characterCount,
    paragraphCount,
    averageSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    averageSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10,
    readingTimeMinutes: Math.round(readingTimeMinutes * 10) / 10,
    readingTimeSeconds,
    suggestions,
  }
}

export function humanizeContentLocal(content: string): HumanizeResult {
  const beforeScore = calculateReadability(content).score
  let humanized = content
  const changes: HumanizeResult["changes"] = []

  for (const { pattern, replacement, reason } of replacements) {
    const match = humanized.match(pattern)
    if (match) {
      humanized = humanized.replace(pattern, replacement)
      changes.push({ original: match[0], replacement, reason })
    }
  }

  for (const [pattern, replacement] of contractions) {
    if (pattern.test(humanized)) {
      humanized = humanized.replace(pattern, replacement)
    }
  }

  const afterScore = calculateReadability(humanized).score

  return {
    original: content,
    humanized,
    changes,
    readabilityImprovement: Math.round((afterScore - beforeScore) * 10) / 10,
  }
}
