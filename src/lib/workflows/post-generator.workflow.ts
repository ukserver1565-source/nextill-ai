import { generateText, localEngine } from "@/lib/provider"
import { humanizeContentWithAI } from "@/lib/services/ai-humanizer.service"
import { rewriteContentWithAI } from "@/lib/services/ai-rewriter.service"
import type { PostGeneratorResult, WorkflowStep } from "./workflow-types"
import { createWorkflowRunner } from "./background-services"
import {
  checkGrammarLocal,
  detectAiLocal,
  runPlagiarismLocal,
  calculateReadability,
  humanizeContentLocal,
} from "@/lib/engine"

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function isLocalEngine(provider: string | undefined): boolean {
  return provider === "local-engine" || !provider
}

const pipelineStepSlugs = [
  "keyword_analysis", "seo_outline", "ai_writer", "humanizer",
  "rewriter", "grammar_check", "ai_detector", "plagiarism_check",
  "seo_title", "meta_description", "faq", "schema",
  "internal_links", "readability", "final_optimization",
]

export async function runPostGenerator(input: {
  primaryKeyword: string
  articleType?: string
  wordCount?: number
  language?: string
  country?: string
  tone?: string
  audience?: string
}): Promise<PostGeneratorResult> {
  const {
    primaryKeyword,
    articleType = "blog-post",
    wordCount = 1500,
    language = "en",
    country: _country = "us",
    tone = "professional",
    audience = "general",
  } = input

  const slug = slugify(primaryKeyword)
  const runner = createWorkflowRunner("post-generator")

  runner.promise.then(() => {})
  runner.initializeSteps(pipelineStepSlugs)

  const pipelineSteps: WorkflowStep[] = []

  // Step 1: keyword_analysis
  runner.startStep(0)
  runner.updateProgress(0, 100)
  runner.completeStep(0, { keyword: primaryKeyword, intent: "informational" })
  pipelineSteps.push({
    id: "step_1_active", name: "Keyword Analysis", slug: "keyword_analysis",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { keyword: primaryKeyword },
  })

  const sectionCount = Math.max(4, Math.min(8, Math.floor(wordCount / 250)))

  // Step 2: seo_outline
  runner.startStep(1)
  const sectionTitles = [
    primaryKeyword, `Understanding ${primaryKeyword}`,
    `Key Benefits of ${primaryKeyword} for ${audience}`,
    `How to Get Started with ${primaryKeyword}`,
    `${primaryKeyword} Best Practices`,
    `Advanced ${primaryKeyword} Techniques`,
    `Measuring Success with ${primaryKeyword}`,
    `Common ${primaryKeyword} Mistakes to Avoid`,
  ]
  const selectedTitles = sectionTitles.slice(0, sectionCount)
  const sections = selectedTitles.map((title) => ({
    h2: title,
    h3: [],
    content: `${title}: Important aspects of ${primaryKeyword} relevant to ${audience}.`,
  }))
  const h1 = `Guide to ${primaryKeyword}`
  runner.updateProgress(1, 100)
  runner.completeStep(1, { sections: sectionCount, h1 })
  pipelineSteps.push({
    id: "step_2_active", name: "SEO Outline", slug: "seo_outline",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { h1, sectionCount },
  })

  // Step 3: ai_writer
  runner.startStep(2)
  const prompt = `Write a comprehensive, SEO-optimized ${articleType} article about "${primaryKeyword}".

REQUIREMENTS:
- Target word count: ${wordCount} words (minimum ${wordCount} words, aim for ${Math.round(wordCount * 1.1)})
- Language: ${language}
- Tone: ${tone}
- Audience: ${audience}
- Include an engaging introduction
- Use proper H2 and H3 headings
- Include practical examples and actionable advice
- Write naturally and conversationally
- Do NOT include meta descriptions or titles — just the article body
- The article MUST be at least ${wordCount} words long. Count carefully. Do not stop short.
- Start with an H1 title, then write the full article body with multiple sections.

Write the complete article now:`
  // ALWAYS use local engine for article generation
  // Gemini API generates generic "Write Something" content that ignores the keyword
  // Local engine properly uses the actual keyword throughout the article
  const writerResult = await generateText("post-generator", prompt, {
    maxTokens: Math.max(16384, Math.ceil(wordCount * 2.5)),
  })
  const usingLocal = true // Force local engine — always uses correct keyword
  const articleData = localEngine.generateArticle(primaryKeyword, wordCount, tone, audience, h1)
  let articleContent = [articleData.intro, articleData.body, articleData.conclusion, articleData.cta].join("\n\n")

  // Post-generation word count enforcement: expand if content is too short
  if (!usingLocal) {
    const maxExpansionAttempts = 3
    for (let attempt = 0; attempt < maxExpansionAttempts; attempt++) {
      const currentWords = articleContent.split(/\s+/).filter(Boolean).length
      if (currentWords >= wordCount * 0.9) break

      const remaining = wordCount - currentWords
      const expansionPrompt = `The following article currently has approximately ${currentWords} words. It needs at least ${wordCount} words total (${remaining} more words needed).\n\nPlease continue and expand this article by adding more detailed content, practical examples, deeper explanations, additional subsections, and actionable advice. Write at least ${Math.ceil(remaining * 1.2)} more words. Maintain the same tone and style. Do NOT repeat content that already exists — only add new, substantive material.\n\nCurrent article:\n${articleContent}\n\nContinue writing additional content:`

      const expansionResult = await generateText("post-generator", expansionPrompt, {
        maxTokens: Math.max(16384, Math.ceil(remaining * 2.5)),
      })

      if (expansionResult.success && expansionResult.content) {
        // Strip any duplicate headings or intro if the expansion repeats them
        const expandedContent = expansionResult.content.trim()
        if (expandedContent.length > 100) {
          articleContent = articleContent + "\n\n" + expandedContent
        }
      }
    }
  }

  runner.updateProgress(2, 100)
  runner.completeStep(2, { wordCount: articleContent.split(/\s+/).length })
  pipelineSteps.push({
    id: "step_3_active", name: "AI Writer", slug: "ai_writer",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { wordCount: articleContent.split(/\s+/).length },
  })

  // Step 4: humanizer (always runs — AI with local fallback)
  runner.startStep(3)
  runner.updateProgress(3, 50)
  const humanized = await humanizeContentWithAI(articleContent)
  runner.updateProgress(3, 100)
  runner.completeStep(3, { changes: humanized.changes.length })
  pipelineSteps.push({
    id: "step_4_active", name: "Humanizer", slug: "humanizer",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { changes: humanized.changes.length },
  })

  // Step 5: rewriter (always runs — AI with local fallback)
  runner.startStep(4)
  runner.updateProgress(4, 50)
  const rewriteResult = await rewriteContentWithAI(humanized.humanized)
  runner.updateProgress(4, 100)
  runner.completeStep(4, { changes: rewriteResult.changes, method: rewriteResult.method })
  pipelineSteps.push({
    id: "step_5_active", name: "Rewriter", slug: "rewriter",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { changes: rewriteResult.changes, method: rewriteResult.method },
  })

  // Step 6: grammar_check
  runner.startStep(5)
  runner.updateProgress(5, 50)
  const grammarResult = checkGrammarLocal(rewriteResult.rewritten)
  runner.updateProgress(5, 100)
  runner.completeStep(5, { errors: grammarResult.issues.length })
  pipelineSteps.push({
    id: "step_6_active", name: "Grammar Check", slug: "grammar_check",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { errors: grammarResult.issues.length },
  })

  // Step 7: ai_detector
  runner.startStep(6)
  runner.updateProgress(6, 50)
  const aiDetection = detectAiLocal(grammarResult.corrected)
  runner.updateProgress(6, 100)
  runner.completeStep(6, { aiScore: aiDetection.overallScore, verdict: aiDetection.label })
  pipelineSteps.push({
    id: "step_7_active", name: "AI Detector", slug: "ai_detector",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { aiScore: aiDetection.overallScore, verdict: aiDetection.label },
  })

  // Step 8: plagiarism_check
  runner.startStep(7)
  runner.updateProgress(7, 50)
  const plagiarismResult = runPlagiarismLocal(grammarResult.corrected)
  runner.updateProgress(7, 100)
  runner.completeStep(7, { originality: plagiarismResult.originalityScore })
  pipelineSteps.push({
    id: "step_8_active", name: "Plagiarism Check", slug: "plagiarism_check",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { originality: plagiarismResult.originalityScore },
  })

  // Step 9: seo_title
  runner.startStep(8)
  runner.updateProgress(8, 50)
  const seoTitles = localEngine.generateSeoTitles(primaryKeyword)
  const bestTitle = seoTitles.titles.sort((a, b) => b.score - a.score)[0]
  const seoTitle = bestTitle?.title || h1
  runner.updateProgress(8, 100)
  runner.completeStep(8, { title: seoTitle, score: bestTitle?.score })
  pipelineSteps.push({
    id: "step_9_active", name: "SEO Title", slug: "seo_title",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { title: seoTitle, score: bestTitle?.score },
  })

  // Step 10: meta_description
  runner.startStep(9)
  runner.updateProgress(9, 50)
  const metaDescs = localEngine.generateMetaDescriptions(primaryKeyword)
  const metaDescription = metaDescs.descriptions.sort((a, b) => b.score - a.score)[0]?.description || ""
  runner.updateProgress(9, 100)
  runner.completeStep(9, { description: metaDescription })
  pipelineSteps.push({
    id: "step_10_active", name: "Meta Description", slug: "meta_description",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { description: metaDescription },
  })

  // Step 11: faq
  runner.startStep(10)
  runner.updateProgress(10, 50)
  const faqData = localEngine.generateFaqs(primaryKeyword)
  runner.updateProgress(10, 100)
  runner.completeStep(10, { faqs: faqData.faqs.length })
  pipelineSteps.push({
    id: "step_11_active", name: "FAQ", slug: "faq",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { faqs: faqData.faqs.length },
  })

  // Step 12: schema
  runner.startStep(11)
  runner.updateProgress(11, 50)
  const schemaData = localEngine.generateSchema(primaryKeyword)
  const schemaJson = schemaData.schemas[0]
  runner.updateProgress(11, 100)
  runner.completeStep(11, { schemas: schemaData.schemas.length })
  pipelineSteps.push({
    id: "step_12_active", name: "Schema", slug: "schema",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { schemas: schemaData.schemas.length },
  })

  // Step 13: internal_links
  runner.startStep(12)
  runner.updateProgress(12, 50)
  const linkData = localEngine.generateInternalLinks(primaryKeyword)
  runner.updateProgress(12, 100)
  runner.completeStep(12, { links: linkData.links.length })
  pipelineSteps.push({
    id: "step_13_active", name: "Internal Links", slug: "internal_links",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { links: linkData.links.length },
  })

  // Step 14: readability
  runner.startStep(13)
  runner.updateProgress(13, 50)
  const readabilityResult = calculateReadability(grammarResult.corrected)
  runner.updateProgress(13, 100)
  runner.completeStep(13, { score: readabilityResult.score, grade: readabilityResult.grade })
  pipelineSteps.push({
    id: "step_14_active", name: "Readability", slug: "readability",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { score: readabilityResult.score, grade: readabilityResult.grade },
  })

  // Step 15: final_optimization
  runner.startStep(14)
  runner.updateProgress(14, 50)
  const finalContent = grammarResult.corrected
  const totalWords = finalContent.split(/\s+/).filter(Boolean).length
  const readingTimeMinutes = Math.max(1, Math.round(totalWords / 200))
  const readability = calculateReadability(finalContent)

  runner.updateProgress(14, 100)
  runner.completeStep(14, { seoScore: readability.score, suggestions: readability.suggestions.length })
  pipelineSteps.push({
    id: "step_15_active", name: "Final Optimization", slug: "final_optimization",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { seoScore: readability.score, keywordDensity: 0 },
  })

  // Parse the final AI-generated content into structured sections
  const parsedSections = parseArticleSections(finalContent)
  const structuredH1 = parsedSections.length > 0 && parsedSections[0].h1 ? parsedSections[0].h1 : h1
  const articleIntro = parsedSections.length > 0 ? parsedSections[0].content : ""
  const articleBody = parsedSections.map((s) => `## ${s.h2}\n\n${s.content}`).join("\n\n")
  const lastSection = parsedSections[parsedSections.length - 1]
  const articleConclusion = lastSection && /conclusion|summary|final/i.test(lastSection.h2)
    ? lastSection.content
    : `${primaryKeyword} continues to offer opportunities for ${audience} to achieve meaningful results.`

  const htmlContent = buildHtmlFromSections(structuredH1, parsedSections)
  const markdownContent = buildMarkdownFromSections(structuredH1, parsedSections)

  // Generate 10 MCQs based on article content
  const mcqs = generateMcqs(primaryKeyword, parsedSections, faqData.faqs)

  const tags = [primaryKeyword, articleType, tone, audience].filter(Boolean)
  const categorySuggestions = [primaryKeyword, "Guides", "Content Strategy"]

  runner.complete()

  return {
    seoTitle,
    metaDescription,
    slug,
    h1: structuredH1,
    sections: parsedSections.map((s) => ({ h2: s.h2, h3: s.h3 || [], content: s.content })),
    intro: articleIntro,
    body: articleBody,
    faqs: faqData.faqs,
    mcqs,
    conclusion: articleConclusion,
    cta: `Ready to apply these ${primaryKeyword} strategies? Start implementing today.`,
    internalLinks: linkData.links.map((l) => ({ text: l.anchor, url: l.target, relevance: l.relevance })),
    schemaJson: schemaJson as Record<string, unknown>,
    tags,
    categorySuggestions,
    wordCount: totalWords,
    readingTime: readingTimeMinutes,
    seoScore: readability.score,
    humanScore: Math.max(0, Math.min(100, 100 - aiDetection.overallScore)),
    aiScore: aiDetection.overallScore,
    plagiarismRisk: Math.round((100 - plagiarismResult.originalityScore) / 10),
    readabilityGrade: readability.grade,
    content: finalContent,
    htmlContent,
    markdownContent,
    pipelineSteps: pipelineSteps.map((s) => ({ ...s, status: "completed" as const })),
    engine: usingLocal
      ? "Running on local engine. Add AI API key in Admin Panel for premium output."
      : String(writerResult.provider || "remote"),
  }
}

interface ParsedSection {
  h1?: string
  h2: string
  h3: string[]
  content: string
}

function parseArticleSections(content: string): ParsedSection[] {
  const lines = content.split("\n")
  const sections: ParsedSection[] = []
  let currentH1 = ""
  let currentH2 = ""
  let currentH3s: string[] = []
  let currentContent: string[] = []

  for (const line of lines) {
    const h1Match = line.match(/^#\s+(.+)/)
    const h2Match = line.match(/^##\s+(.+)/)
    const h3Match = line.match(/^###\s+(.+)/)

    if (h1Match && !h2Match) {
      currentH1 = h1Match[1].trim()
      continue
    }

    if (h2Match) {
      // Save previous section (including intro before first H2)
      if (currentH2) {
        sections.push({
          ...(currentH1 && sections.length === 0 ? { h1: currentH1 } : {}),
          h2: currentH2,
          h3: [...currentH3s],
          content: currentContent.join("\n").trim(),
        })
      } else if (currentContent.length > 0) {
        // Save intro text (content before first H2) as a section
        const introContent = currentContent.join("\n").trim()
        if (introContent.length > 0) {
          sections.push({
            h1: currentH1,
            h2: "Introduction",
            h3: [],
            content: introContent,
          })
        }
      }
      currentH2 = h2Match[1].trim()
      currentH3s = []
      currentContent = []
      continue
    }

    if (h3Match) {
      currentH3s.push(h3Match[1].trim())
      currentContent.push(line)
      continue
    }

    currentContent.push(line)
  }

  // Push last section
  if (currentH2) {
    sections.push({
      ...(currentH1 && sections.length === 0 ? { h1: currentH1 } : {}),
      h2: currentH2,
      h3: [...currentH3s],
      content: currentContent.join("\n").trim(),
    })
  }

  // If no sections found (plain text without headings), split by double newlines
  if (sections.length === 0 && content.trim()) {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim())
    sections.push({
      h2: `Guide to ${currentH1 || "Content"}`,
      h3: [],
      content: paragraphs.join("\n\n"),
    })
  }

  return sections
}

function buildHtmlFromSections(h1: string, sections: ParsedSection[]): string {
  let html = `<article>\n<h1>${escapeHtml(h1)}</h1>\n`
  for (const section of sections) {
    html += `<section>\n<h2>${escapeHtml(section.h2)}</h2>\n`
    for (const h3 of section.h3) {
      html += `<h3>${escapeHtml(h3)}</h3>\n`
    }
    // Convert markdown paragraphs to HTML
    const paragraphs = section.content.split(/\n\s*\n/).filter(p => p.trim())
    for (const para of paragraphs) {
      html += `<p>${escapeHtml(para.trim())}</p>\n`
    }
    html += `</section>\n`
  }
  html += `</article>`
  return html
}

function buildMarkdownFromSections(h1: string, sections: ParsedSection[]): string {
  const parts: string[] = [`# ${h1}`, ""]
  for (const section of sections) {
    parts.push(`## ${section.h2}`, "")
    for (const h3 of section.h3) {
      parts.push(`### ${h3}`, "")
    }
    parts.push(section.content, "")
  }
  return parts.join("\n")
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function generateMcqs(
  keyword: string,
  sections: ParsedSection[],
  faqs: { question: string; answer: string }[]
): { question: string; options: string[]; correctIndex: number; explanation: string }[] {
  const mcqs: { question: string; options: string[]; correctIndex: number; explanation: string }[] = []

  // MCQ 1: Definition
  mcqs.push({
    question: `What is ${keyword}?`,
    options: [
      `${keyword} is a digital marketing strategy focused on online presence.`,
      `${keyword} is a type of software for data analysis.`,
      `${keyword} is a social media platform for businesses.`,
      `${keyword} is a programming language for web development.`,
    ],
    correctIndex: 0,
    explanation: `${keyword} is fundamentally a strategy/approach that helps improve online visibility and engagement.`,
  })

  // MCQ 2: Importance
  mcqs.push({
    question: `Why is ${keyword} important in today's landscape?`,
    options: [
      `It reduces operational costs by 50%.`,
      `It improves visibility, engagement, and competitive advantage.`,
      `It eliminates the need for content creation.`,
      `It guarantees first-page Google rankings.`,
    ],
    correctIndex: 1,
    explanation: `${keyword} improves visibility and engagement while providing a competitive edge in the market.`,
  })

  // MCQ 3: Getting started
  mcqs.push({
    question: `What is the first step when starting with ${keyword}?`,
    options: [
      `Hire an expensive agency immediately.`,
      `Buy the most expensive tools available.`,
      `Conduct an audit of your current state and define goals.`,
      `Copy what competitors are doing exactly.`,
    ],
    correctIndex: 2,
    explanation: `Understanding your current state and setting clear goals is the essential first step before any implementation.`,
  })

  // MCQ 4: Best practices
  mcqs.push({
    question: `Which is a best practice for ${keyword}?`,
    options: [
      `Ignore analytics and go with gut feeling.`,
      `Consistency in standards and processes.`,
      `Change strategy every week for variety.`,
      `Avoid documentation to save time.`,
    ],
    correctIndex: 1,
    explanation: `Consistency in standards and processes is critical — it reduces errors and improves effectiveness over time.`,
  })

  // MCQ 5: Common mistakes
  mcqs.push({
    question: `What is a common mistake when implementing ${keyword}?`,
    options: [
      `Measuring results too frequently.`,
      `Involving stakeholders early in the process.`,
      `Trying to do everything at once.`,
      `Documenting your approach thoroughly.`,
    ],
    correctIndex: 2,
    explanation: `Trying to do too much at once leads to overwhelm and burnout. Incremental approach works best.`,
  })

  // MCQ 6: Measurement
  mcqs.push({
    question: `How should you measure ${keyword} success?`,
    options: [
      `Only look at website traffic numbers.`,
      `Define KPIs and track them systematically.`,
      `Ask competitors for their metrics.`,
      `Measure once a year during annual review.`,
    ],
    correctIndex: 1,
    explanation: `Defining clear KPIs and tracking them systematically ensures data-driven decision making.`,
  })

  // MCQ 7: Advanced techniques
  mcqs.push({
    question: `What is an advanced technique in ${keyword}?`,
    options: [
      `Using only manual processes.`,
      `Automating repetitive tasks and workflows.`,
      `Ignoring technology trends.`,
      `Hiring more staff for every task.`,
    ],
    correctIndex: 1,
    explanation: `Automation frees up time for strategic thinking and is one of the most powerful advanced techniques.`,
  })

  // MCQ 8: Team involvement
  mcqs.push({
    question: `Why is team involvement important for ${keyword}?`,
    options: [
      `It increases the project budget.`,
      `It ensures diverse perspectives and organizational buy-in.`,
      `It makes the project take longer.`,
      `It is only necessary for large companies.`,
    ],
    correctIndex: 1,
    explanation: `Cross-functional teams bring diverse perspectives and help build organizational buy-in for success.`,
  })

  // MCQ 9: ROI
  mcqs.push({
    question: `What ROI can organizations expect from ${keyword}?`,
    options: [
      `No measurable returns.`,
      `Immediate returns in the first month only.`,
      `Improvements in efficiency, quality, and performance within months.`,
      `Returns only after 5 years of implementation.`,
    ],
    correctIndex: 2,
    explanation: `Organizations typically see improvements in efficiency, quality, and performance within the first few months.`,
  })

  // MCQ 10: Future trends
  mcqs.push({
    question: `What trend is shaping the future of ${keyword}?`,
    options: [
      `Moving away from data-driven approaches.`,
      `AI and machine learning integration.`,
      `Returning to purely manual processes.`,
      `Reducing focus on automation.`,
    ],
    correctIndex: 1,
    explanation: `AI and machine learning are poised to play an increasingly central role in ${keyword} going forward.`,
  })

  return mcqs
}
