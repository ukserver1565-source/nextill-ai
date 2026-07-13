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
    const id = searchParams.get("id")
    const projectId = searchParams.get("projectId")

    if (id) {
      const { data: doc, error } = await supabaseAdmin
        .from("documents")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

      if (error || !doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 })
      }

      return NextResponse.json({ success: true, document: parseDocument(doc) })
    }

    if (projectId) {
      const { data: docs, error } = await supabaseAdmin
        .from("documents")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        return NextResponse.json({ error: "Failed to load documents" }, { status: 500 })
      }

      return NextResponse.json({ success: true, documents: docs.map(parseDocument) })
    }

    const { data: docs, error } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .eq("tool_slug", "ai-writer")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: "Failed to load documents" }, { status: 500 })
    }

    return NextResponse.json({ success: true, documents: docs.map(parseDocument) })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function parseDocument(doc: Record<string, unknown>) {
  const content = doc.content as string
  let parsed = { html: "", metaTitle: "", metaDescription: "", slug: "", excerpt: "", outline: [], tags: [], categories: [], schemaJson: "", articleType: "", seoScore: 0, readabilityScore: 0, settings: {} }

  if (content) {
    try {
      const parsedContent = JSON.parse(content)
      if (parsedContent.html !== undefined || parsedContent.metaTitle !== undefined) {
        parsed = parsedContent
      }
    } catch {
      parsed = { ...parsed, html: content }
    }
  }

  return { id: doc.id, projectId: doc.project_id, title: doc.title, wordCount: doc.word_count, createdAt: doc.created_at, updatedAt: doc.updated_at, ...parsed }
}
