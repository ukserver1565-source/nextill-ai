import {
  runPlagiarismLocal,
  detectAiLocal,
  checkGrammarLocal,
  analyzeKeywordsLocal,
  generateSeoTitlesLocal,
  generateMetaDescriptionsLocal,
  generateFaqsLocal,
  generateSchemaLocal,
  generateInternalLinksLocal,
  calculateReadability,
  humanizeContentLocal,
} from "@/lib/engine"
import type {
  LocalKeywordData,
  LocalOutline,
  LocalArticle,
  LocalSeoTitles,
  LocalMetaDescriptions,
  LocalFaqs,
  LocalSchema,
  LocalInternalLinks,
  LocalReadability,
  LocalHumanized,
  LocalGrammarResult,
  LocalAiDetection,
  LocalPlagiarism,
  LocalOptimization,
} from "./provider-types"

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function extractKeyword(prompt: string): string {
  const m = prompt.match(/"([^"]+)"/)
  return m ? m[1] : "topic"
}

function generateKeywordData(keyword: string, _country: string, _language: string): LocalKeywordData {
  const _seed = slugify(keyword)
  const result = analyzeKeywordsLocal(keyword)

  return {
    keywords: result.keywords.map(k => ({
      keyword: k.keyword,
      volume: k.volume ?? 0,
      difficulty: k.difficulty,
      cpc: k.cpc ?? 0,
      trend: k.trend as "rising" | "stable" | "seasonal" | "declining",
      intent: k.intent as "informational" | "commercial" | "transactional" | "navigational",
    })),
    longTail: result.longTail.map(l => l.keyword),
    questions: result.questions.map(q => q.question),
    related: result.related.map(r => r.keyword),
    lsi: result.lsiNlp.map(l => l.term),
    nlpTerms: result.lsiNlp.map(l => `${l.term}_analysis`),
    topicalMap: {
      core: keyword,
      clusters: result.topicalMap.map(c => ({
        topic: c.topic,
        subtopics: c.subtopics,
        relevance: 80,
      })),
    },
    totalResults: result.keywords.length * 100,
  }
}

function generateOutline(keyword: string, _wordCount: number, _audience: string, _tone: string): LocalOutline {
  const sections = [
    { heading: `Understanding ${keyword}`, level: 2 as const, points: 4 },
    { heading: `Why ${keyword} Matters`, level: 2 as const, points: 3 },
    { heading: `Key Benefits of ${keyword}`, level: 2 as const, points: 4 },
    { heading: `Best Practices for ${keyword}`, level: 2 as const, points: 5 },
    { heading: `Conclusion`, level: 2 as const, points: 2 },
  ]

  return {
    h1: `Guide to ${keyword}`,
    sections: sections.map(s => ({
      heading: s.heading,
      level: s.level,
      points: Array.from({ length: s.points }, (_, i) => `Point ${i + 1} about ${keyword}`),
    })),
    introPoints: [`Overview of ${keyword}`, "Key concepts explained"],
    faqIdeas: [`What is ${keyword}?`, `How does ${keyword} work?`],
    cta: `Learn more about ${keyword}.`,
    estimatedWordCount: _wordCount,
  }
}

function generateArticle(keyword: string, _wordCount: number, _tone: string, _audience: string, _outline: string): LocalArticle {
  const kw = keyword.trim()
  const kwLower = kw.toLowerCase()
  const kwTitle = kw.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")

  // Generate Table of Contents
  const tocItems = [
    "Quick Overview",
    `What is ${kwTitle}?`,
    `Key Features of ${kwTitle}`,
    `History and Evolution`,
    `Benefits and Advantages`,
    `How to Use ${kwTitle}`,
    `Best Practices`,
    `Common Mistakes to Avoid`,
    `Frequently Asked Questions`,
    `Conclusion`,
  ]
  const toc = tocItems.map((item, i) => `${i + 1}. ${item}`).join("\n")

  // Generate Quick Overview table — honest, generic info (never fabricate facts)
  const overviewTable = `\n| Section | What you will learn |\n|---------|---------------------|\n| ${kwTitle} | A clear, practical explanation of the topic\n| Key points | The most important things to know\n| Best practices | Proven ways to get good results\n| Common mistakes | Pitfalls to avoid\n| Frequently asked questions | Answers to the questions people ask most\n`

  const sections: { heading: string; content: string }[] = []

  // Section 1: Quick Overview
  sections.push({
    heading: "Quick Overview",
    content: `This guide covers everything you need to know about ${kwLower} — what it is, why it matters, how to get the best results, and the mistakes to avoid. It is written to be practical and easy to follow, whether you are completely new to ${kwLower} or already have some experience.\n\n${overviewTable}The sections below break ${kwLower} down step by step, with clear explanations, real-world examples, and actionable advice you can use right away.`,
  })

  // Section 2: What is kw?
  sections.push({
    heading: `What is ${kwTitle}?`,
    content: `Put simply, ${kwLower} is about getting the fundamentals right and applying them consistently. It is a broad topic with many details, but the core ideas are straightforward once you break them down.\n\n**What you should understand first:**\n- **The basics:** The key concepts and terms used throughout this guide\n- **Why it matters:** The difference it makes when done well\n- **What good looks like:** How to recognise solid results\n- **Common pitfalls:** Where people usually go wrong\n\nRather than being a single technique, ${kwLower} is best understood as a set of principles and practices that work together. This guide breaks them down one at a time, so each piece is manageable before you put them together.`,
  })

  // Section 3: Key Features
  sections.push({
    heading: `Key Features of ${kwTitle}`,
    content: `Understanding what makes ${kwLower} work well comes down to a few key ideas:\n\n| Aspect | What it covers | Why it matters |\n|--------|---------------|----------------|\n| Fundamentals | The core concepts and terms | Everything else builds on this |\n| Technique | How to apply the concepts | Turns knowledge into results |\n| Context | When and where to apply them | Avoids using the wrong approach |\n| Judgement | Knowing what good looks like | Helps you evaluate your own work |\n| Improvement | Refining your approach over time | Keeps results getting better |\n\n### The role of fundamentals\nGetting the basics right matters more than any single trick. A solid understanding of the core concepts means you can adapt to new situations instead of following fixed steps.\n\n### The role of technique\nTechnique is where theory becomes practice. The methods covered in this guide are the practical application of the concepts above.\n\n### The role of judgement\nGood results come from more than following steps mechanically. Being able to assess your own work and spot problems is a skill worth developing.\n\n### The role of continuous improvement\nApproaches to ${kwLower} evolve. Reviewing what you do and refining it over time is how experience turns into expertise.`,
  })

  // Section 4: History
  sections.push({
    heading: `History and Evolution of ${kwTitle}`,
    content: `${kwTitle} has a longer history than most people realise. It did not appear overnight — the ideas and practices behind it developed over time as people worked out what actually worked and what did not.\n\nBelow is a broad outline of how thinking on ${kwLower} has changed:\n\n| Phase | What changed | Why it mattered |\n|-------|--------------|-----------------|\n| Early days | Foundational ideas were established and refined | Created the basis everything else builds on |\n| Growth period | New techniques and approaches became mainstream | Made ${kwLower} more practical and widely used |\n| Modern era | Best practices were codified and tools automated | Reliable results at scale |\n\nThe important thing is not memorising a timeline but understanding the core principles that have stayed relevant throughout. The rest of this guide focuses on those principles and how to apply them today.`,
  })

  // Section 5: Benefits
  sections.push({
    heading: `Benefits and Advantages`,
    content: `Getting ${kwLower} right brings real, practical benefits, but they depend on how you approach it.\n\n### Better Results, Consistently\nWhen you understand the fundamentals and follow proven methods, the quality of your results improves and becomes repeatable. You are not relying on luck or guesswork.\n\n### Less Wasted Effort\nA clear approach saves you from going down dead ends. Time spent learning the right way up front pays for itself quickly.\n\n### Confidence in Your Decisions\nKnowing why something works — rather than just copying what others do — lets you make better decisions and adapt when circumstances change.\n\n### A Foundation to Build On\nThe techniques covered in this guide are not one-off tricks. They give you a foundation you can keep building on as you gain more experience.\n\n| Benefit | What it looks like in practice |\n|---------|-------------------------------|\n| Consistent results | You can repeat what works and avoid what does not |\n| Less wasted effort | Fewer dead ends and failed attempts |\n| Better decisions | You understand trade-offs instead of guessing |\n| Long-term growth | Skills that compound over time |`,
  })

  // Section 6: How to Use
  sections.push({
    heading: `How to Use ${kwTitle}`,
    content: `There is no single right way to approach ${kwLower}, but a sensible process looks like this:\n\n### Step 1: Define what you want to achieve\nBe clear about your goal before you start. Knowing what success looks like makes every later step easier.\n\n### Step 2: Learn the essentials\nSpend a little time on the fundamentals covered earlier in this guide. They will save you from costly mistakes later.\n\n### Step 3: Start small and practise\nPut what you have learned into practice on a manageable task. Experience teaches more than theory alone.\n\n### Step 4: Evaluate and adjust\nLook at what worked and what did not, then adjust your approach. This feedback loop is where most of the learning happens.\n\n### Step 5: Build on your experience\nAs your understanding grows, take on bigger challenges and refine your methods further.\n\n**Practical tips:**\n- Keep your goal in mind at each step\n- Learn by doing, not just by reading\n- Review your results and adjust regularly`,
  })

  // Section 7: Best Practices
  sections.push({
    heading: "Best Practices",
    content: `To get the most out of ${kwLower}, these practices are worth following:\n\n1. **Understand the fundamentals first.** Everything in this guide builds on the basics, so make sure you have those down before moving on.\n\n2. **Adapt advice to your situation.** Good advice is a starting point, not a one-size-fits-all answer. Adjust what you learn to fit your own circumstances.\n\n3. **Verify important information.** If a claim matters to you, check it against reliable sources rather than accepting it on trust.\n\n4. **Be consistent.** Small, regular efforts consistently applied outperform occasional bursts of activity.\n\n5. **Keep learning.** Approaches and best practices evolve. Staying open to new information keeps your skills current.\n\n| Practice | Why It Matters | What It Looks Like |\n|----------|----------------|--------------------|\n| Learn the basics | Everything builds on them | Master fundamentals first |\n| Adapt advice | Context matters | Tailor guidance to your situation |\n| Verify claims | Avoid acting on bad info | Cross-check important facts |\n| Stay consistent | Steady progress compounds | Regular focused effort |\n| Keep learning | Practices evolve | Review and update your approach |`,
  })

  // Section 8: Common Mistakes
  sections.push({
    heading: "Common Mistakes to Avoid",
    content: `People often make the same mistakes when they first work on ${kwLower}. Knowing what these are will help you avoid them:\n\n**Mistake 1: Skipping the Basics**\nJumping straight to advanced techniques before understanding the fundamentals almost always leads to confusion. Start simple and build up.\n\n**Mistake 2: Following Advice Blindly**\nNot every tip or trend applies to your situation. Understand why a recommendation works before applying it, and adapt it to your own context.\n\n**Mistake 3: Ignoring Quality Over Quantity**\nMore is not always better. A few things done properly beat many things done poorly.\n\n**Mistake 4: Not Checking Sources**\nIf information matters, verify it. Relying on a single source — or on unverified claims — is a common trap.\n\n**Mistake 5: Giving Up Too Early**\nResults rarely come instantly. Consistency and patience matter more than one perfect attempt.\n\n**Quick Checklist:**\n- [ ] Start with the fundamentals\n- [ ] Adapt advice to your situation\n- [ ] Prioritise quality over quantity\n- [ ] Verify important information\n- [ ] Stay consistent and keep improving`,
  })

  // Section 9: FAQ
  sections.push({
    heading: "Frequently Asked Questions",
    content: `**Q: Is ${kwLower} difficult to learn?**\nA: Not if you start with the fundamentals. Like most things, it feels complex at first, but the basics are simple and everything else builds on them.\n\n**Q: How long does it take to see results?**\nA: That depends on your situation and how much you practise. What matters is consistent effort — small regular improvements add up over time.\n\n**Q: Is there one best method, or several?**\nA: There is no single best method that fits everyone. Different approaches suit different situations, which is why understanding the trade-offs matters more than memorising one technique.\n\n**Q: What is the most common beginner mistake?**\nA: Skipping the fundamentals and copying advanced advice without understanding it. A little time on the basics saves a lot of frustration later.\n\n**Q: How do I know if I am doing it right?**\nA: Focus on your outcomes and compare them against what good looks like. Get feedback where you can, and keep refining based on what you learn.\n\n**Q: Where can I learn more?**\nA: Start with the resources mentioned in this guide, then explore more advanced material once you are comfortable with the basics.`,
  })

  // Section 10: Conclusion
  sections.push({
    heading: "Conclusion",
    content: `This guide has covered the fundamentals of ${kwLower}, the techniques that work, and the mistakes to avoid. The key takeaways are:\n\n**Key Takeaways:**\n- Master the basics first — everything else builds on them\n- Apply techniques in a way that fits your situation\n- Evaluate your results and learn from them\n- Be consistent — steady effort beats occasional bursts\n- Keep improving as you gain experience\n\nThe best time to start is now. Begin with the fundamentals, put them into practice, and build from there. ${kwTitle} is not complicated once you break it down — and you now have a clear map to follow.`,
  })

  // Build intro
  const intro = `Everything you need to know about ${kwLower} — what it actually is, why it matters, and how to get real results. This guide covers the essentials first, then moves into practical how-to advice, common mistakes to avoid, and the questions people ask most.\n\nIt is written to be useful whether you are completely new to ${kwLower} or already experienced and looking for a refresher. Where specifics depend on your situation, the guide says so rather than pretending there is one universal answer.`

  // Build body with TOC at top
  const body = `## Table of Contents\n\n${toc}\n\n${sections.map(s => `## ${s.heading}\n\n${s.content}`).join("\n\n")}`

  // Build conclusion
  const conclusion = `That wraps up this guide to ${kwLower}. The key takeaways are simple: understand the fundamentals before you worry about advanced techniques, follow the proven best practices, and avoid the common mistakes outlined above.\n\n${kwLower} works best when you treat it as a starting point rather than a finished answer — test things for yourself, adapt what you learn to your own situation, and keep refining your approach over time.`

  const totalWords = [intro, body, conclusion].join(" ").split(/\s+/).length

  return {
    title: `The Complete Guide to ${kwTitle}: Everything You Need to Know`,
    intro,
    body,
    sections,
    conclusion,
    cta: `If you found this guide useful, start applying what you learned today — the fastest way to improve at ${kwLower} is to put the advice into practice.`,
    wordCount: totalWords,
  }
}

function humanizeContent(content: string): LocalHumanized {
  const result = humanizeContentLocal(content)
  return {
    original: result.original,
    humanized: result.humanized,
    changes: result.changes.slice(0, 20).map(c => ({
      original: c.original,
      replacement: c.replacement,
      reason: c.reason,
    })),
  }
}

function checkGrammar(text: string): LocalGrammarResult {
  const result = checkGrammarLocal(text)
  return {
    corrected: result.corrected,
    errors: result.issues.map(i => ({
      type: i.type,
      message: i.message,
      offset: i.offset,
      length: i.length,
      suggestion: i.suggestion,
    })),
    errorCount: result.issues.length,
  }
}

function detectAi(text: string): LocalAiDetection {
  const result = detectAiLocal(text)
  return {
    score: result.overallScore,
    verdict: result.label,
    patterns: result.patterns.map(p => ({
      type: p.type,
      frequency: p.frequency,
      examples: p.examples,
    })),
  }
}

function checkPlagiarism(text: string): LocalPlagiarism {
  const result = runPlagiarismLocal(text)
  return {
    score: 100 - result.originalityScore,
    matches: result.matches.map(m => ({
      text: m.text,
      similarity: m.similarity,
      source: m.source,
    })),
    originalityScore: result.originalityScore,
    safeToPublish: result.safeToPublish,
  }
}

function generateSeoTitles(keyword: string): LocalSeoTitles {
  const titles = generateSeoTitlesLocal(keyword, keyword)
  return {
    titles: titles.map(t => ({
      title: t.title,
      score: t.score,
      chars: t.chars,
    })),
  }
}

function generateMetaDescriptions(keyword: string): LocalMetaDescriptions {
  const descriptions = generateMetaDescriptionsLocal(keyword, keyword)
  return {
    descriptions: descriptions.map(d => ({
      description: d.text,
      score: d.score,
      chars: d.chars,
    })),
  }
}

function generateFaqs(keyword: string): LocalFaqs {
  const { faqs, schema: schemaStr } = generateFaqsLocal("", keyword, 8)
  let schema = {}
  try { schema = JSON.parse(schemaStr) } catch { schema = {} }
  return {
    faqs: faqs.map(f => ({ question: f.question, answer: f.answer })),
    schema,
  }
}

function generateSchema(keyword: string): LocalSchema {
  const schemas = generateSchemaLocal("Article", `Guide to ${keyword}`, `Comprehensive guide about ${keyword}.`, keyword)
  return {
    schemas: schemas as LocalSchema["schemas"],
  }
}

function generateInternalLinks(keyword: string): LocalInternalLinks {
  const links = generateInternalLinksLocal("", keyword)
  return {
    links: links.map(l => ({
      target: l.to,
      anchor: l.anchor,
      relevance: l.relevance,
    })),
  }
}

function checkReadability(text: string): LocalReadability {
  const result = calculateReadability(text)
  return {
    score: result.score,
    grade: result.grade,
    fleschKincaid: result.fleschKincaid,
    sentenceCount: result.sentenceCount,
    wordCount: result.wordCount,
    syllableCount: result.syllableCount,
    averageSentenceLength: result.averageSentenceLength,
    averageSyllablesPerWord: result.averageSyllablesPerWord,
    suggestions: result.suggestions,
  }
}

function finalOptimization(content: string, keyword: string): LocalOptimization {
  const result = calculateReadability(content)
  const words = content.split(/\s+/).filter(w => w.length > 0)
  const wordCount = words.length
  const readingTime = Math.max(1, Math.round(wordCount / 200))
  const lowerContent = content.toLowerCase()
  const kwRegex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
  const keywordCount = (lowerContent.match(kwRegex) || []).length
  const keywordDensity = wordCount > 0 ? Math.round((keywordCount / wordCount) * 1000) / 10 : 0

  const suggestions: LocalOptimization["suggestions"] = []

  if (keywordDensity < 0.5) {
    suggestions.push({ type: "warning", message: `Keyword appears ${keywordCount} times.` })
  } else if (keywordDensity > 3) {
    suggestions.push({ type: "error", message: `Keyword density ${keywordDensity}% too high.` })
  }

  let seoScore = 70
  if (keywordDensity >= 0.5 && keywordDensity <= 3) seoScore += 10
  if (result.score >= 60) seoScore += 10
  if (wordCount >= 300) seoScore += 5
  seoScore = Math.max(0, Math.min(100, seoScore))

  return {
    seoScore,
    keywordDensity,
    headingStructure: [],
    wordCount,
    readingTime,
    suggestions,
  }
}

function generateFallback(prompt: string, workflowSlug: string): string {
  const keyword = extractKeyword(prompt)
  switch (workflowSlug) {
    case "keyword-intelligence": {
      const data = generateKeywordData(keyword, "us", "en")
      return JSON.stringify(data, null, 2)
    }
    case "post-generator": {
      const article = generateArticle(keyword, 1500, "professional", "general", "")
      return [article.intro, article.body, article.conclusion, article.cta].join("\n\n")
    }
    default:
      return `Content for "${keyword}" via ${workflowSlug}.`
  }
}

export const localEngine = {
  generateKeywordData,
  generateOutline,
  generateArticle,
  humanizeContent,
  checkGrammar,
  detectAi,
  checkPlagiarism,
  generateSeoTitles,
  generateMetaDescriptions,
  generateFaqs,
  generateSchema,
  generateInternalLinks,
  checkReadability,
  finalOptimization,
  generateFallback,
}
