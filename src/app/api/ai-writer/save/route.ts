import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { z } from "zod"

const saveSchema = z.object({
  projectId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(500),
  content: z.string(),
  articleType: z.string().optional(),
  wordCount: z.number().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  outline: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  schemaJson: z.string().optional(),
  seoScore: z.number().optional(),
  readabilityScore: z.number().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = saveSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.issues }, { status: 400 })
    }

    const data = parsed.data
    const wordCount = data.wordCount || data.content.split(/\s+/).filter(Boolean).length

    let projectId = data.projectId

    if (!projectId) {
      const { data: project, error: projectError } = await supabaseAdmin
        .from("projects")
        .insert({
          user_id: user.id,
          name: data.title.substring(0, 200),
          description: data.excerpt?.substring(0, 500) || "",
        })
        .select("id")
        .single()

      if (projectError) {
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
      }
      projectId = project.id
    }

    const { data: document, error: docError } = await supabaseAdmin
      .from("documents")
      .insert({
        user_id: user.id,
        project_id: projectId,
        title: data.title.substring(0, 500),
        content: JSON.stringify({
          html: data.content,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          slug: data.slug,
          excerpt: data.excerpt,
          outline: data.outline,
          tags: data.tags,
          categories: data.categories,
          schemaJson: data.schemaJson,
          articleType: data.articleType,
          seoScore: data.seoScore,
          readabilityScore: data.readabilityScore,
          settings: data.settings,
        }),
        tool_slug: "ai-writer",
        word_count: wordCount,
      })
      .select("id, title, word_count, created_at")
      .single()

    if (docError) {
      return NextResponse.json({ error: "Failed to save document" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      projectId,
      document: document,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
