import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get("category") || undefined
    let query = supabaseAdmin
      .from("prompt_templates")
      .select("*")
      .order("category", { ascending: true })
      .order("version", { ascending: false })
    if (category) query = query.eq("category", category)
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch prompts", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body.id) {
      // Update existing
      const { data: existing } = await supabaseAdmin
        .from("prompt_templates")
        .select("*")
        .eq("id", body.id)
        .single()
      if (!existing) throw new Error("Prompt not found")
      const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (body.name !== undefined) payload.name = body.name
      if (body.content !== undefined || body.prompt_text !== undefined) {
        payload.prompt_text = body.content || body.prompt_text
        payload.version = (existing.version || 0) + 1
      }
      if (body.category !== undefined) payload.category = body.category
      if (body.is_active !== undefined) payload.is_active = body.is_active
      const { data, error } = await supabaseAdmin
        .from("prompt_templates")
        .update(payload)
        .eq("id", body.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return NextResponse.json(data)
    }
    // Create new
    const { data: latest } = await supabaseAdmin
      .from("prompt_templates")
      .select("version")
      .eq("category", body.category || "general")
      .order("version", { ascending: false })
      .limit(1)
    const nextVersion = (latest && latest.length > 0 ? latest[0].version : 0) + 1
    const { data, error } = await supabaseAdmin
      .from("prompt_templates")
      .insert({
        slug: (body.name || "prompt").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50),
        name: body.name,
        category: body.category || "general",
        prompt_text: body.content || body.prompt_text || "",
        version: nextVersion,
        is_active: body.is_active ?? true,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to save prompt", details: (err as Error).message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const { error } = await supabaseAdmin.from("prompt_templates").delete().eq("id", id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete prompt", details: (err as Error).message }, { status: 400 })
  }
}
