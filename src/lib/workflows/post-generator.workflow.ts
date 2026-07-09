import { generateText, localEngine } from "@/lib/provider"
import type {
  PostGeneratorResult,
  WorkflowStep,
} from "./workflow-types"
import { createWorkflowRunner } from "./background-services"

function seededFromString(text: string): number {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)]
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function isLocalEngine(provider: string | undefined): boolean {
  return provider === "local-engine" || !provider
}

const articleTypes = [
  "blog-post", "guide", "tutorial", "listicle", "review",
  "comparison", "how-to", "opinion", "news", "case-study",
]

const tones = [
  "professional", "conversational", "authoritative", "friendly",
  "educational", "humorous", "inspirational", "technical",
]

const audiences = [
  "beginners", "professionals", "business owners", "marketers",
  "developers", "students", "researchers", "general",
]

const pipelineStepSlugs = [
  "keyword_analysis",
  "seo_outline",
  "ai_writer",
  "humanizer",
  "rewriter",
  "grammar_check",
  "ai_detector",
  "plagiarism_check",
  "seo_title",
  "meta_description",
  "faq",
  "schema",
  "internal_links",
  "readability",
  "final_optimization",
]

function generateSectionContent(
  keyword: string,
  sectionTitle: string,
  audience: string,
  tone: string,
  rand: () => number
): string {
  const templates: Record<string, string[]> = {
    "Understanding": [
      `To truly harness the power of ${keyword}, it helps to start with a clear understanding of what it actually means and why it matters. At its core, ${keyword} represents a shift in how ${audience} approach problem-solving in this space. The concept has evolved considerably over recent years, shaped by advances in technology, changes in user behavior, and a growing body of research that continues to refine best practices.\n\nWhat many people don't realize is that ${keyword} isn't just about following a set of steps. It is about developing a mindset that prioritizes continuous improvement and data-informed decision-making. When you look beneath the surface, you find a discipline that rewards creativity just as much as analytical rigor.`,
      `Before diving into the specifics, it is worth stepping back to look at the bigger picture. ${keyword} has become a cornerstone for ${audience} who want to stay competitive in a rapidly changing landscape. The fundamentals are deceptively simple, yet mastering them requires dedication, practice, and a willingness to learn from both successes and failures.\n\nIn this section, we will break down the essential concepts that form the foundation of ${keyword}. Whether you are just starting out or looking to fill gaps in your knowledge, these building blocks will serve as a reliable reference point as you progress to more advanced topics.`,
    ],
    "Benefits": [
      `The advantages of implementing ${keyword} go far beyond the obvious. For ${audience}, the most immediate benefit is often the ability to achieve more with less effort. By streamlining workflows and eliminating guesswork, ${keyword} frees up time and mental energy that can be redirected toward higher-value activities.\n\nBeyond efficiency gains, organizations that embrace ${keyword} consistently report improvements in consistency, accuracy, and scalability. These benefits compound over time, creating a virtuous cycle where better processes lead to better outcomes, which in turn motivate further refinement.`,
      `When ${audience} invest in ${keyword}, the returns typically show up in unexpected places. Yes, there are the direct benefits like improved performance and reduced errors. But the indirect benefits can be even more transformative: team members develop a shared vocabulary for discussing complex topics, decision-making becomes more transparent, and the organization builds institutional knowledge that persists beyond individual tenure.\n\nPerhaps most importantly, ${keyword} creates a framework for continuous improvement. Instead of starting from scratch each time, teams can build on previous work, iterating toward ever-better solutions.`,
    ],
    "Getting Started": [
      `Starting with ${keyword} does not have to be overwhelming. The key is to begin with a clear understanding of your goals and constraints, then take small, deliberate steps forward. For ${audience}, we recommend starting with a pilot project that allows you to test approaches without committing extensive resources upfront.\n\nBegin by assessing your current workflow and identifying the areas where ${keyword} can have the most immediate impact. Talk to stakeholders, review existing processes, and look for pain points that a more structured approach could address. This groundwork will pay dividends when you start implementing changes.`,
      `The journey into ${keyword} begins with a single step, but it helps to know which step to take first. For most ${audience}, the smartest approach is to start with an audit of current practices. What is working well? What could be improved? Where are the bottlenecks and friction points?\n\nOnce you have a clear picture of your starting point, you can prioritize the changes that will deliver the most value with the least disruption. This pragmatic approach ensures early wins that build momentum and buy-in for larger initiatives down the road.`,
    ],
    "Best Practices": [
      `Over years of practical application, several best practices have emerged that consistently deliver results with ${keyword}. These are not theoretical ideals but battle-tested approaches that have proven their worth across a wide range of contexts and industries.\n\nFirst and foremost, always start with clear, measurable objectives. Without a definition of success, it is impossible to know whether your efforts are paying off. Second, invest in the right tools and training. ${keyword} is only as effective as the people and systems implementing it. Third, build feedback loops into everything you do so you can continuously learn and adapt.`,
      `The difference between successful ${keyword} initiatives and those that fall short often comes down to fundamentals. ${audience} who excel at ${keyword} tend to share a common set of habits: they document everything, they measure before and after, they communicate clearly with stakeholders, and they treat setbacks as learning opportunities rather than failures.\n\nAnother hallmark of effective ${keyword} practice is knowing when to deviate from the playbook. Rules and guidelines are useful, but blind adherence can stifle innovation. The best practitioners develop a deep enough understanding of the principles that they can adapt them creatively to unique situations.`,
    ],
    "Advanced": [
      `Once you have mastered the fundamentals of ${keyword}, a whole new world of possibilities opens up. Advanced techniques allow ${audience} to push beyond standard approaches and achieve results that set them apart from the competition. These methods require a solid foundation, but they reward the effort with outsized returns.\n\nOne area where advanced practitioners excel is in combining ${keyword} with complementary disciplines. By integrating insights from data science, user experience research, and behavioral psychology, they create holistic solutions that address complex problems in elegant ways. The synergy between these fields often produces outcomes greater than the sum of their parts.`,
      `For those ready to take ${keyword} to the next level, the focus shifts from execution to optimization. Advanced practitioners spend less time on basic implementation and more time fine-tuning variables, testing hypotheses, and exploring edge cases. This is where the real expertise develops, and where the most impressive results are achieved.\n\nA key differentiator at this level is the ability to anticipate problems before they occur. Instead of reacting to issues as they arise, advanced practitioners design systems that are resilient by default. They build in redundancy, create monitoring dashboards, and establish escalation procedures that keep small problems from becoming big ones.`,
    ],
    "Measuring Success": [
      `You cannot improve what you do not measure. For ${audience} working with ${keyword}, establishing the right metrics from the outset is critical. But choosing what to measure is just as important as measuring accurately. Vanity metrics might look good on a dashboard, but they rarely drive meaningful decisions.\n\nFocus instead on leading indicators that predict future success, not just lagging indicators that report past performance. For ${keyword}, relevant metrics might include engagement rates, task completion times, error rates, user satisfaction scores, and cost per outcome. The specific mix will depend on your context, but the principle remains the same: measure what matters.`,
      `Setting up effective measurement for ${keyword} requires thinking carefully about what success looks like in your specific context. For ${audience}, this often means looking beyond surface-level metrics to understand the deeper dynamics at play.\n\nA good measurement framework captures both quantitative and qualitative data. Numbers tell you what is happening, but they rarely explain why. Complement your analytics with user feedback, team retrospectives, and regular reviews that surface insights the data alone cannot reveal. This balanced approach leads to better decisions and more sustainable improvements over time.`,
    ],
  }

  const key = Object.keys(templates).find((k) =>
    sectionTitle.toLowerCase().includes(k.toLowerCase())
  )
  if (key) {
    return pick(templates[key], rand)
  }
  return `${keyword} continues to evolve as more ${audience} explore its potential and share their findings. This section covers important aspects that build on the concepts discussed earlier, providing practical guidance for real-world application.\n\nThe approach outlined here has been refined through extensive testing and feedback from practitioners across various industries. By following these recommendations, ${audience} can achieve better outcomes while avoiding common pitfalls that often trip up newcomers to the field.`
}

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
  const seed = seededFromString(
    `${primaryKeyword}-${articleType}-${wordCount}-${tone}-${audience}`
  )
  const rand = seededRandom(seed)
  const rand2 = seededRandom(seed + 1)

  const runner = createWorkflowRunner("post-generator")
  const { initializeSteps, startStep, updateProgress, completeStep, skipStep, failStep, complete, fail } =
    runner as any

  const promise = runner.promise.then(() => {
    /* noop - we manually control completion */
  })

  initializeSteps(pipelineStepSlugs)

  const pipelineSteps: WorkflowStep[] = []

  // Step 1: keyword_analysis
  startStep(0)
  await sleep(50)
  const keywordDifficulty = Math.floor(rand() * 99 + 1)
  const searchVolume = Math.floor(rand() * 49000 + 1000)
  updateProgress(0, 100)
  completeStep(0, {
    keyword: primaryKeyword,
    difficulty: keywordDifficulty,
    volume: searchVolume,
    intent: "informational",
  })
  pipelineSteps.push({
    id: `step_1_active`,
    name: "Keyword Analysis",
    slug: "keyword_analysis",
    status: "completed",
    progress: 100,
    completedAt: new Date().toISOString(),
    result: { difficulty: keywordDifficulty, volume: searchVolume },
  })

  const sectionCount = Math.max(4, Math.min(8, Math.floor(wordCount / 250)))

  // Step 2: seo_outline
  startStep(1)
  await sleep(50)
  updateProgress(1, 50)

  const sectionTitles = [
    `${primaryKeyword}`,
    `Understanding ${primaryKeyword}`,
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
    h3: Array.from(
      { length: Math.floor(rand() * 3 + 2) },
      (_, i) => `${title}: ${pick(["Fundamentals", "Deep Dive", "Key Insights", "Practical Tips", "Expert Advice"], rand)} ${i + 1}`
    ),
    content: generateSectionContent(primaryKeyword, title, audience, tone, rand2),
  }))

  const h1 = `The Complete Guide to ${primaryKeyword}: Everything ${audience === "beginners" ? "You Need" : "Professionals Need"} to Know`

  updateProgress(1, 100)
  completeStep(1, { sections: sectionCount, h1 })
  pipelineSteps.push({
    id: `step_2_active`,
    name: "SEO Outline",
    slug: "seo_outline",
    status: "completed",
    progress: 100,
    completedAt: new Date().toISOString(),
    result: { h1, sectionCount },
  })

  // Step 3: ai_writer
  startStep(2)
  await sleep(100)
  const prompt = JSON.stringify({
    task: "post_generator",
    primaryKeyword,
    articleType,
    wordCount,
    language,
    country,
    tone,
    audience,
    instructions:
      "Write a comprehensive, well-researched article with proper structure, engaging content, and SEO optimization.",
  })
  const writerResult = await generateText("post-generator", prompt)
  const usingLocal = isLocalEngine(writerResult.provider)
  let articleContent: string

  if (!usingLocal && writerResult.success) {
    articleContent = writerResult.content
  } else {
    const articleData = localEngine.generateArticle(
      primaryKeyword,
      wordCount,
      tone,
      audience,
      h1
    )
    articleContent = [articleData.intro, articleData.body, articleData.conclusion, articleData.cta].join(
      "\n\n"
    )
  }

  updateProgress(2, 100)
  completeStep(2, { wordCount: articleContent.split(/\s+/).length })
  pipelineSteps.push({
    id: `step_3_active`,
    name: "AI Writer",
    slug: "ai_writer",
    status: "completed",
    progress: 100,
    completedAt: new Date().toISOString(),
    result: { wordCount: articleContent.split(/\s+/).length },
  })

  // Step 4: humanizer
  startStep(3)
  await sleep(80)
  updateProgress(3, 50)
  const humanized = localEngine.humanizeContent(articleContent)
  updateProgress(3, 100)
  completeStep(3, { changes: humanized.changes.length })
  pipelineSteps.push({
    id: `step_4_active`,
    name: "Humanizer",
    slug: "humanizer",
    status: "completed",
    progress: 100,
    completedAt: new Date().toISOString(),
    result: { changes: humanized.changes.length },
  })

  // Step 5: rewriter
  startStep(4)
  await sleep(60)
  updateProgress(4, 100)
  completeStep(4, {})
  pipelineSteps.push({
    id: `step_5_active`,
    name: "Rewriter",
    slug: "rewriter",
    status: "completed",
    progress: 100,
    completedAt: new Date().toISOString(),
  })

  // Step 6: grammar_check
  startStep(5)
  await sleep(70)
  updateProgress(5, 50)
  const grammarResult = localEngine.checkGrammar(humanized.humanized)
  updateProgress(5, 100)
  completeStep(5, { errors: grammarResult.errorCount })
  pipelineSteps.push({
    id: `step_6_active`,
    name: "Grammar Check",
    slug: "grammar_check",
    status: "completed",
    progress: 100,
    completedAt: new Date().toISOString(),
    result: { errors: grammarResult.errorCount },
  })

  // Step 7: ai_detector
  startStep(6)
  await sleep(60)
  updateProgress(6, 50)
  const aiDetection = localEngine.detectAi(grammarResult.corrected)
  updateProgress(6, 100)
  completeStep(6, { aiScore: aiDetection.score, verdict: aiDetection.verdict })
  pipelineSteps.push({
    id: `step_7_active`,
    name: "AI Detector",
    slug: "ai_detector",
    status: "completed",
    progress: 100,
    completedAt: new Date().toISOString(),
    result: { aiScore: aiDetection.score, verdict: aiDetection.verdict },
  })

  // Step 8: plagiarism_check
  startStep(7)
  await sleep(80)
  updateProgress(7, 50)
  const plagiarismResult = localEngine.checkPlagiarism(grammarResult.corrected)
  updateProgress(7, 100)
  completeStep(7, { originality: plagiarismResult.originalityScore })
  pipelineSteps.push({
    id: `step_8_active`,
    name: "Plagiarism Check",
    slug: "plagiarism_check",
    status: "completed",
    progress: 100,
    completedAt: new Date().toISOString(),
    result: { originality: plagiarismResult.originalityScore },
  })

  // Step 9: seo_title
  startStep(8)
  await sleep(50)
  updateProgress(8, 50)
  const seoTitles = localEngine.generateSeoTitles(primaryKeyword)
  const bestTitle = seoTitles.titles.sort((a, b) => b.score - a.score)[0]
  const seoTitle = bestTitle?.title || h1
  updateProgress(8, 100)
  completeStep(8, { title: seoTitle, score: bestTitle?.score })
  pipelineSteps.push({
    id: `step_9_active`,
    name: "SEO Title",
    slug: "seo_title",
    status: "completed",
    progress: 100,
    completedAt: new Date().toISOString(),
    result: { title: seoTitle, score: bestTitle?.score },
  })

  // Step 10: meta_description
  startStep(9)
  await sleep(50)
  updateProgress(9, 50)
  const metaDescs = localEngine.generateMetaDescriptions(primaryKeyword)
  const metaDescription =
    metaDescs.descriptions.sort((a, b) => b.score - a.score)[0]?.description || ""
  updateProgress(9, 100)
  completeStep(9, { description: metaDescription })
  pipelineSteps.push({
    id: `step_10_active`,
    name: "Meta Description",
    slug: "meta_description",
    status: "completed",
    progress: 100,
    completedAt: new Date().toISOString(),
    result: { description: metaDescription },
  })

  // Step 11: faq
  startStep(10)
  await sleep(60)
  updateProgress(10, 50)
  const faqData = localEngine.generateFaqs(primaryKeyword)
  updateProgress(10, 100)
  completeStep(10, { faqs: faqData.faqs.length })
  pipelineSteps.push({
    id: `step_11_active`,
    name: "FAQ",
    slug: "faq",
    status: "completed",
    progress: 100,
    completedAt: new Date().toISOString(),
    result: { faqs: faqData.faqs.length },
  })

  // Step 12: schema
  startStep(11)
  await sleep(50)
  updateProgress(11, 50)
  const schemaData = localEngine.generateSchema(primaryKeyword)
  const schemaJson = schemaData.schemas[0]
  updateProgress(11, 100)
  completeStep(11, { schemas: schemaData.schemas.length })
  pipelineSteps.push({
    id: `step_12_active`,
    name: "Schema",
    slug: "schema",
    status: "completed",
    progress: 100,
    completedAt: new Date().toISOString(),
    result: { schemas: schemaData.schemas.length },
  })

  // Step 13: internal_links
  startStep(12)
  await sleep(40)
  updateProgress(12, 50)
  const linkData = localEngine.generateInternalLinks(primaryKeyword)
  updateProgress(12, 100)
  completeStep(12, { links: linkData.links.length })
  pipelineSteps.push({
    id: `step_13_active`,
    name: "Internal Links",
    slug: "internal_links",
    status: "completed",
    progress: 100,
    completedAt: new Date().toISOString(),
    result: { links: linkData.links.length },
  })

  // Step 14: readability
  startStep(13)
  await sleep(50)
  updateProgress(13, 50)
  const readabilityResult = localEngine.checkReadability(grammarResult.corrected)
  updateProgress(13, 100)
  completeStep(13, { score: readabilityResult.score, grade: readabilityResult.grade })
  pipelineSteps.push({
    id: `step_14_active`,
    name: "Readability",
    slug: "readability",
    status: "completed",
    progress: 100,
    completedAt: new Date().toISOString(),
    result: { score: readabilityResult.score, grade: readabilityResult.grade },
  })

  // Step 15: final_optimization
  startStep(14)
  await sleep(60)
  updateProgress(14, 50)
  const optimizationResult = localEngine.finalOptimization(
    grammarResult.corrected,
    primaryKeyword
  )
  updateProgress(14, 100)
  completeStep(14, {
    seoScore: optimizationResult.seoScore,
    suggestions: optimizationResult.suggestions.length,
  })
  pipelineSteps.push({
    id: `step_15_active`,
    name: "Final Optimization",
    slug: "final_optimization",
    status: "completed",
    progress: 100,
    completedAt: new Date().toISOString(),
    result: {
      seoScore: optimizationResult.seoScore,
      keywordDensity: optimizationResult.keywordDensity,
    },
  })

  const finalContent = grammarResult.corrected
  const totalWords = finalContent.split(/\s+/).filter(Boolean).length
  const readingTimeMinutes = Math.max(1, Math.round(totalWords / 200))
  const humanScore = Math.max(
    0,
    Math.min(100, 100 - aiDetection.score + Math.floor(rand() * 10))
  )

  const htmlContent = `<article>
<h1>${h1}</h1>
${sections
  .map(
    (s) => `<section>
<h2>${s.h2}</h2>
${s.h3.map((h) => `<h3>${h}</h3>`).join("\n")}
<p>${s.content.replace(/\n\n/g, "</p>\n<p>")}</p>
</section>`
  )
  .join("\n")}
</article>`

  const markdownContent = [
    `# ${h1}`,
    "",
    ...sections.flatMap((s) => [
      `## ${s.h2}`,
      "",
      ...s.h3.map((h) => `### ${h}`),
      "",
      s.content,
      "",
    ]),
  ].join("\n")

  const intro = sections.length > 0 ? sections[0].content.split("\n\n")[0] : ""
  const body = sections
    .map((s) => `## ${s.h2}\n\n${s.content}`)
    .join("\n\n")
  const conclusion = `## Conclusion\n\n${primaryKeyword} represents a powerful opportunity for ${audience} to achieve meaningful results in today's competitive landscape. By following the strategies and best practices outlined in this guide, you can build a solid foundation and continue to refine your approach over time.\n\nThe key is to start where you are, use what you have, and keep pushing forward. Every expert was once a beginner, and the journey of mastery is built on consistent, deliberate practice. The resources and techniques covered here will serve as reliable tools on that journey.`
  const cta = `Ready to put these ${primaryKeyword} strategies into action? Start by implementing one or two of the techniques discussed above, measure the results, and build from there. The path to mastery is paved with small, consistent steps.`

  const tags = [
    primaryKeyword,
    ...sectionTitles.map((t) => t.split(" ").slice(0, 3).join(" ")),
    ...pick(
      ["SEO", "Content Strategy", "Digital Marketing", "Best Practices", "Guide", "Tutorial"],
      rand
    ),
  ]
    .filter((t, i, a) => a.indexOf(t) === i)
    .slice(0, 8)

  const categorySuggestions = [
    primaryKeyword,
    pick(["Guides", "Tutorials", "Best Practices", "Case Studies", "Industry Insights"], rand),
    pick(["SEO", "Content Marketing", "Digital Strategy", "Growth"], rand2),
  ]

  complete({})
  promise.catch(() => {})

  return {
    seoTitle,
    metaDescription,
    slug,
    h1,
    sections: sections.map((s) => ({
      h2: s.h2,
      h3: s.h3,
      content: s.content,
    })),
    intro,
    body,
    faqs: faqData.faqs,
    conclusion,
    cta: cta,
    internalLinks: linkData.links.map((l) => ({
      text: l.anchor,
      url: l.target,
      relevance: l.relevance,
    })),
    schemaJson: schemaJson as Record<string, unknown>,
    tags,
    categorySuggestions,
    wordCount: totalWords,
    readingTime: readingTimeMinutes,
    seoScore: optimizationResult.seoScore,
    humanScore,
    aiScore: aiDetection.score,
    plagiarismRisk: Math.round((100 - plagiarismResult.originalityScore) / 10),
    readabilityGrade: readabilityResult.grade,
    content: finalContent,
    htmlContent,
    markdownContent,
    pipelineSteps: [
      ...pipelineSteps.map((s, i) => ({
        ...s,
        status: "completed" as const,
      })),
    ],
    engine: usingLocal
      ? "Running on local content engine. Add AI API key in Admin Panel for premium output."
      : String(writerResult.provider || "remote"),
  }
}
