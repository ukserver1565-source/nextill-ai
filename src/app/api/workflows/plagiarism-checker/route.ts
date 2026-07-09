import { NextResponse } from "next/server"
import { runPlagiarismCheck } from "@/lib/workflows"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { text } = body
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    const result = await runPlagiarismCheck({ text })

    if (user) {
      try {
        const { supabaseAdmin } = await import("@/lib/supabase/admin")
        await supabaseAdmin.from("plagiarism_reports").insert({
          user_id: user.id,
          text,
          word_count: result.wordCount,
          originality_score: result.originalityScore,
          duplicate_risk: result.duplicateRisk,
          matched_phrases: result.matchedPhrases,
          sources: result.sources,
          recommendation: result.recommendation,
          safe_to_publish: result.safeToPublish,
        })
      } catch { /* non-critical */ }
    }

    return NextResponse.json({ ...result, saved: !!user })
  } catch (err) {
    return NextResponse.json({ error: "Plagiarism check failed", details: (err as Error).message }, { status: 500 })
  }
}
