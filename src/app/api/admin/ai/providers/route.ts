import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("ai_providers")
      .select("*, ai_models:ai_models(count)")
      .order("priority", { ascending: true })
      .order("name")
    if (error) throw new Error(error.message)
    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch providers", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { data, error } = await supabaseAdmin
      .from("ai_providers")
      .insert({
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "_"),
        provider: body.provider || body.name,
        base_url: body.base_url || null,
        is_enabled: body.is_enabled ?? true,
        priority: body.priority ?? 0,
        config: body.config || {},
        api_key_encrypted: body.api_key_encrypted || null,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to create provider", details: (err as Error).message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    await supabaseAdmin.from("ai_models").delete().eq("provider_id", id)
    const { error } = await supabaseAdmin.from("ai_providers").delete().eq("id", id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete provider", details: (err as Error).message }, { status: 400 })
  }
}
