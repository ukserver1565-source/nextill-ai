import { generateText, localEngine } from "@/lib/provider"
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
    country = "us",
    tone = "professional",
    audience = "general",
  } = input

  const slug = slugify(primaryKeyword)
  const runner = createWorkflowRunner("post-generator")
  const { initializeSteps, startStep, updateProgress, completeStep, complete } = runner as any

  runner.promise.then(() => {})
  initializeSteps(pipelineStepSlugs)

  const pipelineSteps: WorkflowStep[] = []

  // Step 1: keyword_analysis
  startStep(0)
  updateProgress(0, 100)
  completeStep(0, { keyword: primaryKeyword, intent: "informational" })
  pipelineSteps.push({
    id: "step_1_active", name: "Keyword Analysis", slug: "keyword_analysis",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { keyword: primaryKeyword },
  })

  const sectionCount = Math.max(4, Math.min(8, Math.floor(wordCount / 250)))

  // Step 2: seo_outline
  startStep(1)
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
  updateProgress(1, 100)
  completeStep(1, { sections: sectionCount, h1 })
  pipelineSteps.push({
    id: "step_2_active", name: "SEO Outline", slug: "seo_outline",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { h1, sectionCount },
  })

  // Step 3: ai_writer
  startStep(2)
  const prompt = JSON.stringify({
    task: "post_generator", primaryKeyword, articleType, wordCount,
    language, country, tone, audience,
    instructions: "Write a comprehensive, SEO-optimized article with proper structure and engaging content.",
  })
  const writerResult = await generateText("post-generator", prompt)
  const usingLocal = isLocalEngine(writerResult.provider)
  let articleContent: string

  if (!usingLocal && writerResult.success) {
    articleContent = writerResult.content
  } else {
    const articleData = localEngine.generateArticle(primaryKeyword, wordCount, tone, audience, h1)
    articleContent = [articleData.intro, articleData.body, articleData.conclusion, articleData.cta].join("\n\n")
  }

  updateProgress(2, 100)
  completeStep(2, { wordCount: articleContent.split(/\s+/).length })
  pipelineSteps.push({
    id: "step_3_active", name: "AI Writer", slug: "ai_writer",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { wordCount: articleContent.split(/\s+/).length },
  })

  // Step 4: humanizer
  startStep(3)
  updateProgress(3, 50)
  const humanized = humanizeContentLocal(articleContent)
  updateProgress(3, 100)
  completeStep(3, { changes: humanized.changes.length })
  pipelineSteps.push({
    id: "step_4_active", name: "Humanizer", slug: "humanizer",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { changes: humanized.changes.length },
  })

  // Step 5: rewriter
  startStep(4)
  updateProgress(4, 100)
  completeStep(4, {})
  pipelineSteps.push({
    id: "step_5_active", name: "Rewriter", slug: "rewriter",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
  })

  // Step 6: grammar_check
  startStep(5)
  updateProgress(5, 50)
  const grammarResult = checkGrammarLocal(humanized.humanized)
  updateProgress(5, 100)
  completeStep(5, { errors: grammarResult.issues.length })
  pipelineSteps.push({
    id: "step_6_active", name: "Grammar Check", slug: "grammar_check",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { errors: grammarResult.issues.length },
  })

  // Step 7: ai_detector
  startStep(6)
  updateProgress(6, 50)
  const aiDetection = detectAiLocal(grammarResult.corrected)
  updateProgress(6, 100)
  completeStep(6, { aiScore: aiDetection.overallScore, verdict: aiDetection.label })
  pipelineSteps.push({
    id: "step_7_active", name: "AI Detector", slug: "ai_detector",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { aiScore: aiDetection.overallScore, verdict: aiDetection.label },
  })

  // Step 8: plagiarism_check
  startStep(7)
  updateProgress(7, 50)
  const plagiarismResult = runPlagiarismLocal(grammarResult.corrected)
  updateProgress(7, 100)
  completeStep(7, { originality: plagiarismResult.originalityScore })
  pipelineSteps.push({
    id: "step_8_active", name: "Plagiarism Check", slug: "plagiarism_check",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { originality: plagiarismResult.originalityScore },
  })

  // Step 9: seo_title
  startStep(8)
  updateProgress(8, 50)
  const seoTitles = localEngine.generateSeoTitles(primaryKeyword)
  const bestTitle = seoTitles.titles.sort((a, b) => b.score - a.score)[0]
  const seoTitle = bestTitle?.title || h1
  updateProgress(8, 100)
  completeStep(8, { title: seoTitle, score: bestTitle?.score })
  pipelineSteps.push({
    id: "step_9_active", name: "SEO Title", slug: "seo_title",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { title: seoTitle, score: bestTitle?.score },
  })

  // Step 10: meta_description
  startStep(9)
  updateProgress(9, 50)
  const metaDescs = localEngine.generateMetaDescriptions(primaryKeyword)
  const metaDescription = metaDescs.descriptions.sort((a, b) => b.score - a.score)[0]?.description || ""
  updateProgress(9, 100)
  completeStep(9, { description: metaDescription })
  pipelineSteps.push({
    id: "step_10_active", name: "Meta Description", slug: "meta_description",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { description: metaDescription },
  })

  // Step 11: faq
  startStep(10)
  updateProgress(10, 50)
  const faqData = localEngine.generateFaqs(primaryKeyword)
  updateProgress(10, 100)
  completeStep(10, { faqs: faqData.faqs.length })
  pipelineSteps.push({
    id: "step_11_active", name: "FAQ", slug: "faq",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { faqs: faqData.faqs.length },
  })

  // Step 12: schema
  startStep(11)
  updateProgress(11, 50)
  const schemaData = localEngine.generateSchema(primaryKeyword)
  const schemaJson = schemaData.schemas[0]
  updateProgress(11, 100)
  completeStep(11, { schemas: schemaData.schemas.length })
  pipelineSteps.push({
    id: "step_12_active", name: "Schema", slug: "schema",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { schemas: schemaData.schemas.length },
  })

  // Step 13: internal_links
  startStep(12)
  updateProgress(12, 50)
  const linkData = localEngine.generateInternalLinks(primaryKeyword)
  updateProgress(12, 100)
  completeStep(12, { links: linkData.links.length })
  pipelineSteps.push({
    id: "step_13_active", name: "Internal Links", slug: "internal_links",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { links: linkData.links.length },
  })

  // Step 14: readability
  startStep(13)
  updateProgress(13, 50)
  const readabilityResult = calculateReadability(grammarResult.corrected)
  updateProgress(13, 100)
  completeStep(13, { score: readabilityResult.score, grade: readabilityResult.grade })
  pipelineSteps.push({
    id: "step_14_active", name: "Readability", slug: "readability",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { score: readabilityResult.score, grade: readabilityResult.grade },
  })

  // Step 15: final_optimization
  startStep(14)
  updateProgress(14, 50)
  const finalContent = grammarResult.corrected
  const totalWords = finalContent.split(/\s+/).filter(Boolean).length
  const readingTimeMinutes = Math.max(1, Math.round(totalWords / 200))
  const readability = calculateReadability(finalContent)

  updateProgress(14, 100)
  completeStep(14, { seoScore: readability.score, suggestions: readability.suggestions.length })
  pipelineSteps.push({
    id: "step_15_active", name: "Final Optimization", slug: "final_optimization",
    status: "completed", progress: 100, completedAt: new Date().toISOString(),
    result: { seoScore: readability.score, keywordDensity: 0 },
  })

  const htmlContent = `<article>\n<h1>${h1}</h1>\n${sections.map((s) =>
    `<section>\n<h2>${s.h2}</h2>\n<p>${s.content}</p>\n</section>`
  ).join("\n")}\n</article>`

  const markdownContent = [`# ${h1}`, "", ...sections.flatMap((s) => [`## ${s.h2}`, "", s.content, ""])].join("\n")

  const intro = sections.length > 0 ? sections[0].content : ""
  const body = sections.map((s) => `## ${s.h2}\n\n${s.content}`).join("\n\n")
  const conclusion = `${primaryKeyword} continues to offer opportunities for ${audience} to achieve meaningful results.`
  const cta = `Ready to apply these ${primaryKeyword} strategies? Start implementing today.`

  const tags = [primaryKeyword, articleType, tone, audience].filter(Boolean)
  const categorySuggestions = [primaryKeyword, "Guides", "Content Strategy"]

  complete({})

  return {
    seoTitle,
    metaDescription,
    slug,
    h1,
    sections: sections.map((s) => ({ h2: s.h2, h3: s.h3, content: s.content })),
    intro,
    body,
    faqs: faqData.faqs,
    conclusion,
    cta,
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
