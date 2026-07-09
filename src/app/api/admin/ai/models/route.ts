import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: NextRequest) {
  try {
    const providerId = req.nextUrl.searchParams.get("provider_id") || undefined
    let query = supabaseAdmin
      .from("ai_models")
      .select("*, providers:provider_id(name, slug)")
    if (providerId) query = query.eq("provider_id", providerId)
    query = query.order("display_name", { ascending: true })
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch models", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body.id) {
      const payload: any = {}
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
        .eq("id", body.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return NextResponse.json(data)
    }
    const { data, error } = await supabaseAdmin
      .from("ai_models")
      .insert({
        provider_id: body.provider_id,
        display_name: body.display_name,
        model_name: body.model_name || body.display_name,
        provider_model_id: body.provider_model_id || body.display_name,
        is_enabled: body.is_enabled ?? true,
        is_default: body.is_default ?? false,
        cost_input: body.cost_input ?? 0,
        cost_output: body.cost_output ?? 0,
        max_tokens: body.max_tokens ?? 4096,
        config: body.config || {},
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to save model", details: (err as Error).message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const { error } = await supabaseAdmin.from("ai_models").delete().eq("id", id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete model", details: (err as Error).message }, { status: 400 })
  }
}
