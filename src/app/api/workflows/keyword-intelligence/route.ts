import { NextResponse } from "next/server"
import { runKeywordIntelligence } from "@/lib/workflows"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { seedKeyword, country = "us", language = "en", niche = "" } = body
    if (!seedKeyword) return NextResponse.json({ error: "Seed keyword is required" }, { status: 400 })

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    const result = await runKeywordIntelligence({ seedKeyword, country, language, niche })

    if (user) {
      try {
        const { supabaseAdmin } = await import("@/lib/supabase/admin")
        await supabaseAdmin.from("keyword_research").insert({
          user_id: user.id,
          seed_keyword: seedKeyword,
          country,
          language,
          niche,
          keywords: result.keywords,
          long_tail_keywords: result.longTailKeywords,
          questions: result.questions,
          related_keywords: result.relatedKeywords,
          lsi_keywords: result.lsiKeywords,
          nlp_terms: result.nlpTerms,
          topical_map: result.topicalMap,
          total_results: result.totalResults,
        })
      } catch { /* non-critical */ }
    }

    return NextResponse.json({ ...result, saved: !!user })
  } catch (err) {
    return NextResponse.json({ error: "Keyword research failed", details: (err as Error).message }, { status: 500 })
  }
}
