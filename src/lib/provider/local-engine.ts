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

function generateArticle(keyword: string, wordCount: number, _tone: string, _audience: string, _outline: string): LocalArticle {
  const sectionCount = Math.max(3, Math.min(8, Math.floor(wordCount / 200)))
  const wordsPerSection = Math.floor(wordCount / (sectionCount + 2)) // +2 for intro and conclusion

  // Each section has multiple paragraphs for richer content
  const sectionTemplates = [
    { heading: `Understanding ${keyword}`, paragraphs: [
      `What is ${keyword} and why does it matter in today's digital landscape? At its core, ${keyword} represents a fundamental approach that has gained tremendous traction across industries. Organizations and professionals alike have recognized its potential to transform how they operate, communicate, and deliver value to their audiences.`,
      `The significance of ${keyword} extends far beyond surface-level applications. When implemented thoughtfully, it can streamline complex processes, enhance decision-making capabilities, and create measurable improvements in outcomes. Studies consistently show that early adopters of ${keyword} strategies outperform their competitors by a significant margin.`,
      `To truly understand ${keyword}, it helps to examine its origins and evolution. The concept has roots in established methodologies that have been refined over decades, but modern implementations leverage technology and data-driven insights to achieve results that were previously impossible. This combination of proven principles and innovative tools makes ${keyword} particularly powerful.`,
      `Key terminology and foundational concepts form the building blocks of effective ${keyword} implementation. Before diving into advanced strategies, it is essential to grasp these fundamentals thoroughly. A solid understanding of the basic principles will serve as the foundation for every technique discussed throughout this guide.`,
    ]},
    { heading: `Benefits of ${keyword}`, paragraphs: [
      `The benefits of implementing ${keyword} are both immediate and long-lasting. Organizations that adopt ${keyword} strategies typically see improvements in efficiency, quality, and overall performance within the first few months. These gains compound over time, creating sustainable competitive advantages that are difficult for others to replicate.`,
      `One of the most significant advantages of ${keyword} is its ability to improve decision-making. By providing structured frameworks and data-driven insights, ${keyword} enables teams to make better choices faster. This reduction in decision fatigue and uncertainty leads to more consistent outcomes and fewer costly mistakes.`,
      `Cost optimization is another major benefit that organizations frequently cite. ${keyword} helps identify inefficiencies, eliminate waste, and redirect resources toward high-impact activities. Companies that have implemented comprehensive ${keyword} strategies report cost reductions of 15-30% in their operational budgets within the first year.`,
      `Beyond the tangible metrics, ${keyword} also contributes to improved team morale and collaboration. When teams have clear processes and shared goals, they work more effectively together. The clarity that ${keyword} provides reduces confusion and frustration, creating a more positive and productive work environment.`,
    ]},
    { heading: `How to Get Started with ${keyword}`, paragraphs: [
      `Getting started with ${keyword} does not have to be overwhelming. The key is to begin with a clear assessment of your current state and define specific, measurable goals for what you want to achieve. This initial planning phase is crucial and will determine the success of your entire implementation.`,
      `Start by conducting a thorough audit of your existing processes and identifying areas where ${keyword} can have the greatest impact. Look for bottlenecks, repetitive tasks, and opportunities for automation or optimization. These high-impact areas should be your first priority, as they will deliver the quickest returns and build momentum for broader adoption.`,
      `Next, develop a phased implementation plan that breaks the transition into manageable steps. Begin with a small pilot project that allows you to test your approach, learn from any mistakes, and refine your strategy before scaling up. This incremental approach minimizes risk while maximizing learning opportunities.`,
      `Consider assembling a cross-functional team to champion the ${keyword} initiative. Having representatives from different departments ensures diverse perspectives and helps build organizational buy-in. Designate a project lead who will coordinate efforts, track progress, and serve as the primary point of contact for questions and concerns.`,
    ]},
    { heading: `Best Practices for ${keyword}`, paragraphs: [
      `To maximize the value of ${keyword}, organizations should follow a set of proven best practices that have emerged from years of real-world implementation. These practices represent the collective wisdom of practitioners who have successfully adopted ${keyword} across diverse contexts and industries.`,
      `Consistency is perhaps the most critical factor in ${keyword} success. Establish clear standards and processes, then ensure everyone on your team follows them consistently. Inconsistency leads to confusion, errors, and reduced effectiveness. Document your approach thoroughly and make it easily accessible to all team members.`,
      `Regular measurement and analysis are essential for continuous improvement. Define key performance indicators (KPIs) at the outset and track them systematically. Use these metrics to identify what is working, what needs adjustment, and where to focus your optimization efforts. Data-driven decision-making is at the heart of effective ${keyword} implementation.`,
      `Knowledge sharing and documentation should be prioritized from day one. Create a centralized repository of best practices, lessons learned, and reference materials. Conduct regular team meetings to discuss progress, share insights, and address challenges. The more your team learns together, the more effectively they will implement ${keyword}.`,
    ]},
    { heading: `Advanced Techniques in ${keyword}`, paragraphs: [
      `Once you have mastered the fundamentals of ${keyword}, it is time to explore advanced techniques that can take your implementation to the next level. These strategies require a deeper understanding of the underlying principles but can deliver significantly greater results when applied correctly.`,
      `Automation is one of the most powerful advanced techniques in ${keyword}. By automating repetitive tasks and workflows, you can free up valuable time for strategic thinking and creative problem-solving. Modern tools and platforms make automation more accessible than ever, even for organizations with limited technical resources.`,
      `Integration with complementary tools and platforms is another key advanced strategy. ${keyword} does not exist in isolation — it works best when combined with other approaches that share similar goals. Identify the tools and platforms that complement your ${keyword} strategy and invest in seamless integration between them.`,
      `Custom solutions tailored to your specific needs can provide a significant competitive advantage. While standard implementations work well for many organizations, those that invest in customization often discover unique efficiencies and capabilities that set them apart. Work with experienced practitioners to identify opportunities for custom development.`,
    ]},
    { heading: `Common Mistakes to Avoid`, paragraphs: [
      `Even with the best intentions, organizations often make mistakes when implementing ${keyword}. Understanding these common pitfalls can help you avoid them and accelerate your path to success. Learning from others' mistakes is far less costly than making them yourself.`,
      `One of the most frequent mistakes is trying to do too much at once. ${keyword} implementation works best when approached incrementally. Trying to overhaul everything simultaneously leads to overwhelm, mistakes, and burnout. Instead, prioritize the most impactful changes and expand gradually as your team builds competence and confidence.`,
      `Ignoring measurement and analytics is another critical error. Without data, you cannot know whether your ${keyword} efforts are actually working. Establish clear metrics from the start and review them regularly. If something is not delivering results, be willing to adjust your approach rather than continuing down an unproductive path.`,
      `Failing to involve stakeholders early in the process is a mistake that can derail even the best-laid plans. Communication and buy-in are essential for successful ${keyword} implementation. Keep stakeholders informed about progress, solicit their feedback, and address concerns proactively. The more invested people feel in the outcome, the more likely they are to support the initiative.`,
    ]},
    { heading: `Measuring Success with ${keyword}`, paragraphs: [
      `Measuring the success of your ${keyword} efforts is not optional — it is essential for demonstrating value and guiding future decisions. A robust measurement framework helps you understand what is working, identify areas for improvement, and make data-driven decisions about where to invest your resources.`,
      `Start by defining clear, measurable key performance indicators (KPIs) that align with your business objectives. These might include metrics related to efficiency gains, cost reductions, quality improvements, or revenue growth. Whatever KPIs you choose, ensure they are specific, measurable, achievable, relevant, and time-bound.`,
      `Implement regular reporting cycles to track your KPIs and share results with stakeholders. Weekly or monthly reports keep everyone informed about progress and help identify trends early. Use visualization tools to make the data accessible and actionable for stakeholders who may not be familiar with the underlying metrics.`,
      `Based on your measurement results, continuously refine your ${keyword} strategy. The most successful implementations are those that evolve over time in response to changing circumstances and new insights. Be prepared to pivot when the data tells you that a different approach would be more effective.`,
    ]},
    { heading: `The Future of ${keyword}`, paragraphs: [
      `The landscape of ${keyword} continues to evolve rapidly, driven by technological advancements, changing market dynamics, and shifting consumer expectations. Staying ahead of these changes requires continuous learning, adaptation, and a willingness to embrace new approaches and technologies.`,
      `Artificial intelligence and machine learning are poised to play an increasingly central role in ${keyword}. These technologies can automate complex analysis, identify patterns that humans might miss, and provide recommendations that improve over time. Organizations that invest in AI-powered ${keyword} tools today will have a significant advantage in the years ahead.`,
      `The integration of ${keyword} with other emerging technologies, such as blockchain, IoT, and edge computing, opens up new possibilities for innovation. These combinations can create entirely new capabilities and use cases that were previously impossible. Keeping abreast of these technological convergences is essential for long-term success.`,
      `Sustainability and ethical considerations are becoming increasingly important in ${keyword} implementation. Organizations are recognizing that effective ${keyword} strategies must balance performance with responsibility. This trend toward ethical ${keyword} practices will continue to grow, driven by both regulatory requirements and consumer expectations.`,
    ]},
  ]

  const selectedSections = sectionTemplates.slice(0, sectionCount)

  // Generate content for each section, expanding to meet word count
  const sections = selectedSections.map(s => {
    let content = s.paragraphs.join("\n\n")
    // If still short, add more paragraphs
    while (content.split(/\s+/).length < wordsPerSection) {
      const _lastParagraph = s.paragraphs[s.paragraphs.length - 1]
      // Generate an additional paragraph based on the heading
      const additionalParagraphs = [
        `Furthermore, when considering ${s.heading.toLowerCase()}, it is important to recognize that the specific approach will vary depending on your unique circumstances and objectives. What works for one organization may not work for another, which is why flexibility and adaptability are key virtues in this area.`,
        `Additionally, the long-term success of efforts in this area depends heavily on consistent execution and ongoing commitment. Quick wins are valuable, but sustainable results require a sustained effort over months and years. Organizations that treat this as a one-time project rather than an ongoing process typically see diminishing returns.`,
        `To complement these strategies, consider seeking feedback from peers, mentors, and industry experts who have experience with similar initiatives. Their perspectives can help you avoid common pitfalls and identify opportunities you might have missed. Professional communities and industry groups are excellent resources for this kind of guidance.`,
        `Finally, it is worth noting that the landscape in this area is constantly evolving. What represents best practice today may be superseded by a better approach tomorrow. Stay curious, keep learning, and remain open to new ideas and methodologies as they emerge.`,
      ]
      let added = false
      for (const p of additionalParagraphs) {
        if (content.split(/\s+/).length < wordsPerSection) {
          content += "\n\n" + p
          added = true
        }
      }
      if (!added) break
    }
    return { heading: s.heading, content }
  })

  const intro = `Welcome to this comprehensive guide on ${keyword}. In today's rapidly evolving landscape, ${keyword} has emerged as a critical topic that demands attention from professionals, businesses, and enthusiasts alike. Whether you are a beginner just starting to explore this field or an experienced practitioner looking to refine your approach, this guide will provide you with the knowledge, strategies, and actionable insights you need to succeed. Throughout this article, we will cover the fundamentals, best practices, advanced techniques, and common pitfalls associated with ${keyword}, giving you a complete roadmap for mastery. Let us begin by exploring what ${keyword} actually means and why it has become so important in today's world.`

  const conclusion = `In conclusion, ${keyword} represents a significant opportunity for those willing to invest the time and effort to understand it thoroughly. By following the strategies and best practices outlined in this guide, you will be well-equipped to leverage ${keyword} effectively in your own context. Remember that success with ${keyword} is not achieved overnight — it requires consistent effort, continuous learning, and a willingness to adapt as new information and tools become available. The key is to start now, stay consistent with your approach, measure your progress along the way, and don't be afraid to experiment with different strategies to find what works best for your specific situation. As you continue on your ${keyword} journey, keep in mind that the most successful practitioners are those who remain curious, stay humble, and always look for ways to improve.`

  const body = sections.map(s => `## ${s.heading}\n\n${s.content}`).join("\n\n")

  const totalWords = [intro, body, conclusion].join(" ").split(/\s+/).length

  return {
    title: `The Complete Guide to ${keyword}`,
    intro,
    body,
    sections,
    conclusion,
    cta: `Ready to get started with ${keyword}? Begin implementing these strategies today and see the difference they make in your results. Start with the basics, build your foundation, and gradually work your way up to more advanced techniques. The journey of a thousand miles begins with a single step, and your ${keyword} journey starts now.`,
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
