import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from("ai_api_keys")
      .select("*")
      .eq("id", id)
      .single()
    if (error || !data) return NextResponse.json({ error: "API key not found" }, { status: 404 })
    const safe = {
      id: data.id,
      provider_slug: data.provider_slug,
      name: data.name,
      key_prefix: data.key_prefix,
      is_enabled: data.is_enabled,
      last_used_at: data.last_used_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
    return NextResponse.json(safe)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch API key" }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.name !== undefined) payload.name = body.name
    if (body.is_enabled !== undefined) payload.is_enabled = body.is_enabled
    const { data, error } = await supabaseAdmin
      .from("ai_api_keys")
      .update(payload)
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update API key" }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await supabaseAdmin.from("ai_api_keys").delete().eq("id", id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete API key" }, { status: 400 })
  }
}
