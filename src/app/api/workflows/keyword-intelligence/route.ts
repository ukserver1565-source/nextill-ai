import { NextResponse } from "next/server"
import { runKeywordIntelligence } from "@/lib/workflows"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { seedKeyword, keyword, seed, country = "us", language = "en" } = body
    const searchTerm = seedKeyword || keyword || seed
    if (!searchTerm) return NextResponse.json({ error: "Seed keyword is required" }, { status: 400 })

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    const output = await runKeywordIntelligence({ keyword: searchTerm, country, language })

    if (!output.success) {
      return NextResponse.json({ error: output.error || "Keyword analysis failed" }, { status: 500 })
    }

    const result = output.result!

    if (user) {
      try {
        const { supabaseAdmin } = await import("@/lib/supabase/admin")
        await supabaseAdmin.from("keyword_research").insert({
          user_id: user.id,
          seed_keyword: searchTerm,
          country,
          language,
          keywords: result.keywords,
          long_tail_keywords: result.longTail,
          questions: result.questions,
          related_keywords: result.related,
          lsi_keywords: result.lsiNlp,
          nlp_terms: result.lsiNlp.map((l: { term: string }) => l.term),
          topical_map: result.topicalMap,
          total_results: result.stats.totalKeywords,
        })
      } catch { /* non-critical */ }
    }

    return NextResponse.json({
      keywords: result.keywords,
      longTailKeywords: result.longTail,
      longTail: result.longTail,
      questions: result.questions,
      relatedKeywords: result.related,
      related: result.related,
      lsiKeywords: result.lsiNlp,
      lsiNlp: result.lsiNlp,
      nlpTerms: result.lsiNlp.map((l: { term: string }) => l.term),
      topicalMap: result.topicalMap,
      stats: result.stats,
      totalResults: result.stats.totalKeywords,
      engine: result.engine,
      saved: !!user,
    })
  } catch (err) {
    return NextResponse.json({ error: "Keyword research failed", details: (err as Error).message }, { status: 500 })
  }
}
