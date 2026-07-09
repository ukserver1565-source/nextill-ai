import { NextResponse } from "next/server"
import { runPostGenerator } from "@/lib/workflows"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { primaryKeyword, articleType, wordCount, language, country, tone, audience } = body
    if (!primaryKeyword) return NextResponse.json({ error: "Primary keyword is required" }, { status: 400 })

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    const result = await runPostGenerator({
      primaryKeyword,
      articleType: articleType || "blog-post",
      wordCount: wordCount || 1500,
      language: language || "en",
      country: country || "us",
      tone: tone || "professional",
      audience: audience || "general",
    })

    if (user) {
      try {
        const { supabaseAdmin } = await import("@/lib/supabase/admin")
        await supabaseAdmin.from("generated_posts").insert({
          user_id: user.id,
          primary_keyword: primaryKeyword,
          article_type: articleType || "blog-post",
          word_count: wordCount || 1500,
          language: language || "en",
          country: country || "us",
          tone: tone || "professional",
          audience: audience || "general",
          seo_title: result.seoTitle,
          meta_description: result.metaDescription,
          slug: result.slug,
          h1: result.h1,
          sections: result.sections,
          intro: result.intro,
          body: result.body,
          faqs: result.faqs,
          conclusion: result.conclusion,
          cta: result.cta,
          internal_links: result.internalLinks,
          schema_json: result.schemaJson,
          tags: result.tags,
          category_suggestions: result.categorySuggestions,
          word_count_result: result.wordCount,
          reading_time: result.readingTime,
          seo_score: result.seoScore,
          human_score: result.humanScore,
          ai_score: result.aiScore,
          plagiarism_risk: result.plagiarismRisk,
          readability_grade: result.readabilityGrade,
          content: result.content,
          html_content: result.htmlContent,
          markdown_content: result.markdownContent,
        })
      } catch { /* non-critical */ }
    }

    return NextResponse.json({ ...result, saved: !!user })
  } catch (err) {
    return NextResponse.json({ error: "Post generation failed", details: (err as Error).message }, { status: 500 })
  }
}
