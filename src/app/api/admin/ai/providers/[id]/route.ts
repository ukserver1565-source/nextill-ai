import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data } = await supabaseAdmin
      .from("ai_providers")
      .select("*")
      .eq("id", id)
      .single()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch provider", details: (err as Error).message }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const payload: Record<string, unknown> = {}
    if (body.name !== undefined) payload.name = body.name
    if (body.slug !== undefined) payload.slug = body.slug
    if (body.base_url !== undefined) payload.base_url = body.base_url
    if (body.default_model !== undefined) payload.default_model = body.default_model
    if (body.enabled !== undefined) payload.enabled = body.enabled
    if (body.config !== undefined) payload.config = body.config
    const { data } = await supabaseAdmin
      .from("ai_providers")
      .update(payload)
      .eq("id", id)
      .select()
      .single()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update provider", details: (err as Error).message }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await supabaseAdmin.from("ai_models").delete().eq("provider_id", id)
    const { error } = await supabaseAdmin.from("ai_providers").delete().eq("id", id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete provider", details: (err as Error).message }, { status: 500 })
  }
}
