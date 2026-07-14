import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: NextRequest) {
  try {
    const providerSlug = req.nextUrl.searchParams.get("provider_slug") || req.nextUrl.searchParams.get("provider_id") || undefined
    let query = supabaseAdmin.from("ai_models").select("*")
    if (providerSlug) query = query.eq("provider_slug", providerSlug)
    query = query.order("model_name", { ascending: true })
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return NextResponse.json(data || [])
  } catch (err) {
    const msg = (err as Error)?.message || ""
    if (msg.includes("does not exist") || msg.includes("Could not find the table")) {
      return NextResponse.json([])
    }
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body.id) {
      const allowed = ["model_name", "is_enabled", "is_default", "is_fallback", "cost_input", "cost_output", "max_tokens", "temperature", "provider_slug"]
      const payload: Record<string, unknown> = {}
      for (const key of allowed) {
        if (body[key] !== undefined) payload[key] = body[key]
      }
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
        provider: body.provider || body.provider_slug || "unknown",
        provider_slug: body.provider_slug || body.provider_id || null,
        model_name: body.model_name || "New Model",
        is_enabled: body.is_enabled ?? true,
        is_default: body.is_default ?? false,
        cost_input: body.cost_input ?? 0,
        cost_output: body.cost_output ?? 0,
        max_tokens: body.max_tokens ?? 4096,
        temperature: body.temperature ?? 0.7,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (err) {
    const msg = (err as Error)?.message || ""
    if (msg.includes("does not exist") || msg.includes("Could not find the table")) {
      return NextResponse.json({ error: "Models table not found. Run migration 006." }, { status: 503 })
    }
    return NextResponse.json({ error: "Failed to save model" }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const { error } = await supabaseAdmin.from("ai_models").delete().eq("id", id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete model" }, { status: 400 })
  }
}
