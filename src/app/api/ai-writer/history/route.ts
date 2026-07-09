import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 })
    }

    const { data: docs, error } = await supabaseAdmin
      .from("documents")
      .select("id, title, word_count, tool_slug, created_at, updated_at")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: "Failed to load history" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      projectId,
      versions: docs.map(d => ({
        id: d.id,
        title: d.title,
        wordCount: d.word_count,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
