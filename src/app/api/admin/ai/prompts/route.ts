import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: NextRequest) {
  try {
    const toolSlug = req.nextUrl.searchParams.get("tool_slug") || undefined
    let query = supabaseAdmin
      .from("prompts")
      .select("*")
      .order("tool_slug", { ascending: true })
      .order("version", { ascending: false })
    if (toolSlug) query = query.eq("tool_slug", toolSlug)
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
      const { data: existing } = await supabaseAdmin
        .from("prompts")
        .select("*")
        .eq("id", body.id)
        .single()
      if (!existing) throw new Error("Prompt not found")
      const payload: any = {}
      if (body.name !== undefined) payload.name = body.name
      if (body.content !== undefined) {
        payload.content = body.content
        payload.version = (existing.version || 0) + 1
      }
      if (body.is_active !== undefined) payload.is_active = body.is_active
      const { data, error } = await supabaseAdmin
        .from("prompts")
        .update(payload)
        .eq("id", body.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return NextResponse.json(data)
    }
    const { data: latest } = await supabaseAdmin
      .from("prompts")
      .select("version")
      .eq("tool_slug", body.tool_slug)
      .order("version", { ascending: false })
      .limit(1)
    const nextVersion = (latest && latest.length > 0 ? latest[0].version : 0) + 1
    const { data, error } = await supabaseAdmin
      .from("prompts")
      .insert({
        tool_slug: body.tool_slug,
        name: body.name,
        content: body.content || "",
        version: nextVersion,
        variables: body.variables || [],
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
    const { error } = await supabaseAdmin.from("prompts").delete().eq("id", id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete prompt", details: (err as Error).message }, { status: 400 })
  }
}
