export interface GrammarIssue {
  type: "grammar" | "spelling" | "punctuation" | "capitalization" | "style" | "repetition"
  message: string
  text: string
  suggestion: string
  offset: number
  length: number
}

export interface GrammarResult {
  corrected: string
  issues: GrammarIssue[]
  score: number
  wordCount: number
  characterCount: number
}

function sentences(text: string): Array<{ text: string; start: number; end: number }> {
  const result: Array<{ text: string; start: number; end: number }> = []
  const regex = /[^.!?]+[.!?]*/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    const s = match[0].trim()
    if (s.length > 0) {
      result.push({ text: s, start: match.index, end: match.index + match[0].length })
    }
  }
  return result
}

function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(Boolean)
}

export function checkGrammarLocal(text: string): GrammarResult {
  const issues: GrammarIssue[] = []
  const wordCount = tokenize(text).length
  const characterCount = text.length
  let corrected = text

  // 1. Capitalization check - sentences should start with capital letter
  const sentList = sentences(text)
  for (const sent of sentList) {
    const trimmed = sent.text
    if (trimmed.length > 1 && /^[a-z]/.test(trimmed)) {
      issues.push({
        type: "capitalization",
        message: "Sentence should start with a capital letter",
        text: trimmed.substring(0, 50),
        suggestion: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
        offset: sent.start,
        length: 1,
      })
      const before = text.substring(0, sent.start)
      const after = text.substring(sent.start + 1)
      corrected = before + trimmed.charAt(0).toUpperCase() + after
    }
  }

  // 2. Repeated words (e.g., "the the", "in in")
  const repeatedWordRegex = /\b(\w+)\s+\1\b/gi
  let rwMatch: RegExpExecArray | null
  while ((rwMatch = repeatedWordRegex.exec(text)) !== null) {
    issues.push({
      type: "repetition",
      message: `Repeated word: "${rwMatch[1]}"`,
      text: rwMatch[0],
      suggestion: rwMatch[1],
      offset: rwMatch.index,
      length: rwMatch[0].length,
    })
  }

  // 3. Double spaces
  const doubleSpaceRegex = /  +/g
  let dsMatch: RegExpExecArray | null
  while ((dsMatch = doubleSpaceRegex.exec(text)) !== null) {
    issues.push({
      type: "punctuation",
      message: "Double space detected",
      text: dsMatch[0],
      suggestion: " ",
      offset: dsMatch.index,
      length: dsMatch[0].length,
    })
  }
  corrected = corrected.replace(doubleSpaceRegex, " ")

  // 4. Missing spaces after punctuation
  const missingSpaceRegex = /([.!?])([A-Za-z])/g
  let msMatch: RegExpExecArray | null
  while ((msMatch = missingSpaceRegex.exec(text)) !== null) {
    issues.push({
      type: "punctuation",
      message: "Missing space after punctuation",
      text: msMatch[0],
      suggestion: msMatch[1] + " " + msMatch[2],
      offset: msMatch.index,
      length: msMatch[0].length,
    })
  }

  // 5. Common grammar patterns
  const grammarPatterns: Array<{
    pattern: RegExp
    replacement: string
    message: string
  }> = [
    { pattern: /\bmore better\b/gi, replacement: "better", message: "Double comparative" },
    { pattern: /\bthe reason is because\b/gi, replacement: "the reason is that", message: "Redundant phrasing" },
    { pattern: /\bvery unique\b/gi, replacement: "unique", message: "Absolute adjective modified" },
    { pattern: /\bin spite of the fact that\b/gi, replacement: "although", message: "Wordy phrase" },
    { pattern: /\bhas got\b/gi, replacement: "has", message: "Redundant verb" },
    { pattern: /\bis are\b/gi, replacement: "are", message: "Subject-verb disagreement" },
    { pattern: /\bwas were\b/gi, replacement: "was", message: "Subject-verb disagreement" },
    { pattern: /\bdon't has\b/gi, replacement: "doesn't have", message: "Incorrect negation" },
  ]

  for (const { pattern, replacement, message } of grammarPatterns) {
    const match = text.match(pattern)
    if (match) {
      issues.push({
        type: "grammar",
        message,
        text: match[0],
        suggestion: replacement,
        offset: match.index ?? 0,
        length: match[0].length,
      })
    }
  }

  // 6. Punctuation spacing (comma without space)
  const commaSpaceRegex = /,([^\s\d])/g
  let csMatch: RegExpExecArray | null
  while ((csMatch = commaSpaceRegex.exec(text)) !== null) {
    issues.push({
      type: "punctuation",
      message: "Missing space after comma",
      text: csMatch[0],
      suggestion: ", " + csMatch[1],
      offset: csMatch.index,
      length: csMatch[0].length,
    })
  }

  // 7. Consecutive punctuation
  const consecutivePunctRegex = /([.!?]){2,}/g
  let cpMatch: RegExpExecArray | null
  while ((cpMatch = consecutivePunctRegex.exec(text)) !== null) {
    if (cpMatch[1] !== ".") {
      issues.push({
        type: "punctuation",
        message: "Consecutive punctuation marks",
        text: cpMatch[0],
        suggestion: cpMatch[1],
        offset: cpMatch.index,
        length: cpMatch[0].length,
      })
    }
  }

  // Calculate score (deduct points per issue)
  let deductions = 0
  for (const issue of issues) {
    switch (issue.type) {
      case "grammar": deductions += 10; break
      case "spelling": deductions += 8; break
      case "capitalization": deductions += 5; break
      case "punctuation": deductions += 3; break
      case "repetition": deductions += 7; break
      case "style": deductions += 4; break
    }
  }
  const score = Math.max(0, Math.min(100, 100 - deductions))

  return {
    corrected,
    issues,
    score: Math.round(score),
    wordCount,
    characterCount,
  }
}
