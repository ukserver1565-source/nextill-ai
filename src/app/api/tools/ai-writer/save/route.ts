import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const saveSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  toolSlug: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, content, toolSlug } = saveSchema.parse(body)

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const wordCount = content.split(/\s+/).filter(Boolean).length

    const { data: doc, error } = await supabaseAdmin
      .from("documents")
      .insert({
        user_id: user.id,
        title,
        content,
        tool_slug: toolSlug,
        word_count: wordCount,
      })
      .select("id, title, word_count")
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to save document", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, document: doc })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.issues }, { status: 400 })
    }
    console.error("Save error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
