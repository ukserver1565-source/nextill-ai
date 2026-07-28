import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Blog post data for auto-seeding
const BLOG_POSTS = [
  {
    title: "How to Humanize AI Content: Complete Guide to Pass AI Detection in 2026",
    slug: "how-to-humanize-ai-content-pass-detection",
    excerpt: "Learn proven techniques to humanize AI-generated content so it reads naturally and passes AI detection tools like GPTZero and Originality.ai.",
    seo_title: "How to Humanize AI Content & Pass AI Detection | Nextill AI Guide 2026",
    meta_description: "Step-by-step guide to humanize AI content and pass detection tools. Learn natural writing techniques, sentence variation, and burstiness strategies that work.",
  },
  {
    title: "AI vs Human Writing: Which Is Better for SEO Rankings in 2026?",
    slug: "ai-vs-human-writing-seo-rankings",
    excerpt: "We compare AI-generated and human-written content across real SEO metrics. Find out which approach ranks higher and how to combine both for maximum results.",
    seo_title: "AI vs Human Writing for SEO: Which Ranks Higher in 2026? | Nextill AI",
    meta_description: "Compare AI vs human writing for SEO rankings. Data-driven analysis of traffic, engagement, and Google ranking factors for AI and human content.",
  },
  {
    title: "Top 10 AI SEO Tools Every Content Creator Needs in 2026",
    slug: "top-10-ai-seo-tools-content-creators",
    excerpt: "Discover the best AI-powered SEO tools for keyword research, content optimization, plagiarism checking, and domain analysis that save hours of manual work.",
    seo_title: "Top 10 AI SEO Tools for Content Creators in 2026 | Nextill AI",
    meta_description: "Best AI SEO tools for 2026. Compare keyword research, content generation, plagiarism checking, and domain intelligence tools for content creators.",
  },
  {
    title: "Mastering Keyword Research: A Step-by-Step Guide Using AI Intelligence",
    slug: "mastering-keyword-research-ai-intelligence",
    excerpt: "Learn how to use AI-powered keyword intelligence to find low-competition, high-volume keywords that drive organic traffic to your website.",
    seo_title: "Keyword Research Guide: Use AI to Find Low Competition Keywords | Nextill AI",
    meta_description: "Complete keyword research tutorial using AI intelligence. Find low-competition, high-volume keywords with volume data, difficulty scores, and SERP analysis.",
  },
  {
    title: "Plagiarism Detection Explained: How to Ensure Your Content Is 100% Original",
    slug: "plagiarism-detection-ensure-original-content",
    excerpt: "Understanding plagiarism detection technology and how to use AI-powered tools to verify your content originality before publishing.",
    seo_title: "Plagiarism Detection Guide: Ensure 100% Original Content | Nextill AI",
    meta_description: "How plagiarism detection works and how to ensure original content. Compare tools, techniques, and best practices for content authenticity.",
  },
]

const ARTICLES: Record<string, string> = {
  "how-to-humanize-ai-content-pass-detection": `# How to Humanize AI Content: Complete Guide to Pass AI Detection in 2026

The rise of AI writing tools has transformed content creation, but it has also created a new challenge: AI detection. Search engines, academic institutions, and content platforms are increasingly using AI detection tools to identify machine-generated text. If you rely on AI for content creation, learning how to humanize that content is essential.

## Why AI Detection Matters for Content Creators

Google has made it clear that AI-generated content created solely to manipulate search rankings violates their spam policies. However, AI-assisted content that provides genuine value to readers is perfectly acceptable. The key difference lies in quality, originality, and human-like presentation.

AI detection tools like GPTZero, Originality.ai, and Copyleaks analyze text for patterns that distinguish machine-generated content from human writing. These patterns include predictable sentence structures, uniform word choice, and consistent paragraph lengths that feel robotic rather than natural.

## Understanding How AI Detection Works

AI detection tools typically analyze three key metrics:

**Perplexity** measures how predictable the text is. AI-generated content tends to have lower perplexity because language models optimize for the most probable next word. Human writing naturally includes more unexpected word choices and creative phrasing.

**Burstiness** refers to the variation in sentence length and complexity. Humans naturally write with high burstiness, mixing short punchy sentences with longer, more complex ones. AI tends to produce more uniform sentence patterns.

**Vocabulary diversity** tracks the range of unique words used. While AI models have massive vocabularies, they tend to use common words more frequently and avoid unusual but natural word choices that humans make instinctively.

## Proven Techniques to Humanize AI Content

### 1. Vary Your Sentence Structure

The most effective way to humanize AI content is to break up uniform sentence patterns. Start some sentences with conjunctions, use fragments occasionally, and mix declarative sentences with questions and exclamations.

### 2. Add Personal Experience and Examples

AI-generated content lacks personal experience. Inject real-world examples, case studies, and specific anecdotes that demonstrate genuine knowledge of the topic.

### 3. Use Transitional Phrases Naturally

AI content often uses formal transitions like "Furthermore" and "Moreover" at the start of every paragraph. Mix in more casual transitions like "Here is the thing" or "What most people miss."

### 4. Intentional Imperfection

Perfect grammar and flawless structure can actually trigger AI detection. Consider using sentence fragments, starting sentences with "And" or "But," and employing colloquialisms where appropriate.

### 5. Restructure AI-Generated Outlines

AI tends to follow predictable outline structures with symmetrical sections. Rearrange sections, combine related points, and add unexpected subtopics that break the expected pattern.

## Using AI Humanizer Tools Effectively

Tools like AdultPulse AI's Humanizer are designed specifically to transform AI-generated text into natural, human-sounding content. These tools apply multiple humanization techniques simultaneously.

When using AI humanizer tools, always review the output carefully. The best results come from combining automated humanization with manual editing and personal touches.

## Best Practices for AI-Assisted Content

Begin your content creation process with genuine research. Read existing articles, gather data, and form your own perspective before using AI to help draft content.

Never publish AI-generated content without thorough editing. Use a multi-pass approach: first for accuracy and facts, then for tone and readability, and finally for humanization and flow.

## Conclusion

Humanizing AI content is not about deception. It is about ensuring that AI-assisted content meets the quality standards that readers and search engines expect. Start implementing these strategies today, and you will find that AI becomes a powerful ally in your content creation process.`,

  "ai-vs-human-writing-seo-rankings": `# AI vs Human Writing: Which Is Better for SEO Rankings in 2026?

The debate between AI-generated and human-written content has intensified as search engines refine their algorithms. Understanding how each approach impacts SEO rankings is crucial for content strategy in 2026.

## The Current State of AI Content and SEO

Google has stated that the search engine does not differentiate between AI-generated and human-written content when evaluating quality. What matters is whether the content provides value to users and satisfies search intent.

## How Google Evaluates Content Quality

Google's ranking systems focus on E-E-A-T: Experience, Expertise, Authoritativeness, and Trustworthiness.

### Experience

Human writers naturally draw from personal experience, which creates content that feels authentic and relatable. They can share specific examples and insights that cannot be easily replicated by AI.

### Expertise

Both AI and human content can demonstrate expertise, but in different ways. AI excels at presenting comprehensive information on technical topics. Human experts bring nuanced understanding and practical shortcuts.

## The Optimal Strategy: AI-Human Collaboration

The most successful content strategies in 2026 combine AI efficiency with human expertise. Use AI for research and outlining, human writing for core analysis, AI for draft generation, and human editing for polish and voice.

## Conclusion

Neither AI nor human writing alone represents the optimal approach for SEO in 2026. The winning strategy combines AI efficiency with human expertise, experience, and editorial judgment.`,

  "top-10-ai-seo-tools-content-creators": `# Top 10 AI SEO Tools Every Content Creator Needs in 2026

Discover the best AI-powered SEO tools for keyword research, content optimization, plagiarism checking, and domain analysis that save hours of manual work.

## 1. AI Keyword Intelligence

Keyword research is the foundation of any SEO strategy. AI-powered keyword intelligence tools analyze search volumes, competition levels, and user intent to identify the best opportunities.

## 2. AI Content Writer

An AI content writer helps you create drafts, outlines, and full articles in minutes. The best tools combine natural language generation with SEO optimization.

## 3. AI Humanizer

After generating content with AI, a humanizer tool helps make it sound more natural and pass AI detection tools. This is essential for maintaining content quality.

## 4. Plagiarism Checker

Original content is critical for SEO. AI-powered plagiarism checkers scan your content against millions of web pages to ensure it is 100% original.

## 5. Website Audit Tool

A comprehensive website audit identifies technical SEO issues, broken links, missing meta tags, and performance problems.

## 6. Rank Tracker

Tracking your search engine rankings helps you understand what is working. AI-powered rank trackers provide daily updates and competitor analysis.

## 7. Backlink Checker

Backlinks remain one of the most important ranking factors. AI backlink analyzers help you discover link-building opportunities.

## 8. Domain Intelligence

Understanding your domain's authority, traffic patterns, and competitive landscape is essential for effective SEO strategy.

## 9. SEO Title Generator

Creating compelling, keyword-optimized titles drives clicks. AI title generators analyze top-ranking pages for suggestions.

## 10. Meta Description Generator

Meta descriptions directly impact click-through rates. AI tools generate optimized descriptions with relevant keywords.

## Conclusion

The right combination of AI SEO tools can dramatically improve your content creation workflow and search engine rankings.`,

  "mastering-keyword-research-ai-intelligence": `# Mastering Keyword Research: A Step-by-Step Guide Using AI Intelligence

Keyword research remains the cornerstone of successful SEO. With AI-powered intelligence, you can discover opportunities that traditional tools miss.

## Why AI Changes Keyword Research

Traditional keyword research tools provide basic metrics like search volume and competition. AI-powered tools go further by analyzing search intent, predicting trends, and identifying content gaps.

## Step 1: Define Your Goals

Before diving into keyword data, clarify your objectives. Are you trying to increase organic traffic, generate leads, or establish authority?

## Step 2: Generate Seed Keywords

Start with broad topics related to your business. AI tools can expand these into hundreds of related keywords and long-tail variations.

## Step 3: Analyze Search Intent

Understanding why people search for specific terms is crucial. AI classifies keywords by intent: informational, navigational, commercial, or transactional.

## Step 4: Evaluate Competition

AI-powered competitive analysis goes beyond simple difficulty scores. It examines content quality, backlink profiles, and domain authority of top-ranking pages.

## Step 5: Prioritize Opportunities

AI scoring models help you prioritize based on potential traffic, conversion likelihood, and competitive feasibility.

## Conclusion

AI-powered keyword research transforms a tedious manual process into a strategic advantage. By following these steps, you can discover opportunities that drive real business results.`,

  "plagiarism-detection-ensure-original-content": `# Plagiarism Detection Explained: How to Ensure Your Content Is 100% Original

Original content is the foundation of successful SEO and credible publishing. Understanding how plagiarism detection works helps you maintain content quality.

## Why Originality Matters for SEO

Search engines penalize duplicate content, and readers lose trust in websites that publish copied material. Original content ranks better and earns more backlinks.

## How Plagiarism Detection Works

Modern plagiarism detection tools use advanced algorithms to compare your content against billions of web pages and published works.

### Text Matching

The most basic form of detection compares your text directly against known sources. Even small changes are increasingly detected by modern tools.

### AI Detection

Newer tools can identify content generated by AI, even when paraphrased. This technology analyzes statistical patterns in language use.

## Best Practices for Original Content

### Write from Experience

The most effective way to create original content is to draw from personal experience, original research, and unique perspectives.

### Use Plagiarism Checkers

Before publishing, run your content through a reliable plagiarism checker. This catches accidental similarities and ensures your content is truly original.

### AI Content Verification

If you use AI writing tools, always verify the output with a plagiarism checker. AI models can sometimes generate text that closely resembles existing content.

## Conclusion

Maintaining content originality requires awareness, good practices, and the right tools. By understanding how plagiarism detection works, you can ensure your content stands out as genuinely original.`,
}

async function ensureSeeded() {
  try {
    const { count } = await supabaseAdmin
      .from("blog_posts")
      .select("id", { count: "exact", head: true })

    if (count && count > 0) return

    // No posts — seed them
    for (const post of BLOG_POSTS) {
      const content = ARTICLES[post.slug] || ""
      await supabaseAdmin
        .from("blog_posts")
        .upsert({
          title: post.title,
          slug: post.slug,
          content,
          excerpt: post.excerpt,
          seo_title: post.seo_title,
          meta_description: post.meta_description,
          status: "published",
          published_at: new Date().toISOString(),
          view_count: 0,
        }, { onConflict: "slug" })
    }
  } catch {
    // Seed failed silently — will show empty blog
  }
}

export async function GET(req: NextRequest) {
  try {
    // Auto-seed if no posts exist
    await ensureSeeded()

    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const category_id = searchParams.get("category_id") || undefined

    let query = supabaseAdmin
      .from("blog_posts")
      .select("id, title, slug, excerpt, featured_image_url, published_at, category_id", { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false })

    if (category_id) query = query.eq("category_id", category_id)

    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({ data: data || [], total: count || 0 })
  } catch (_err) {
    return NextResponse.json({ data: [], total: 0 })
  }
}
