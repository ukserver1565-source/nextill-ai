import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const payload: Record<string, unknown> = {}
    if (body.provider_id !== undefined) payload.provider_id = body.provider_id
    if (body.display_name !== undefined) payload.display_name = body.display_name
    if (body.model_name !== undefined) payload.model_name = body.model_name
    if (body.provider_model_id !== undefined) payload.provider_model_id = body.provider_model_id
    if (body.is_enabled !== undefined) payload.is_enabled = body.is_enabled
    if (body.is_default !== undefined) payload.is_default = body.is_default
    if (body.cost_input !== undefined) payload.cost_input = body.cost_input
    if (body.cost_output !== undefined) payload.cost_output = body.cost_output
    if (body.max_tokens !== undefined) payload.max_tokens = body.max_tokens
    if (body.config !== undefined) payload.config = body.config
    if (body.temperature !== undefined) payload.temperature = body.temperature
    const { data, error } = await supabaseAdmin
      .from("ai_models")
      .update(payload)
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update model", details: (err as Error).message }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await supabaseAdmin.from("ai_models").delete().eq("id", id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete model", details: (err as Error).message }, { status: 400 })
  }
}
