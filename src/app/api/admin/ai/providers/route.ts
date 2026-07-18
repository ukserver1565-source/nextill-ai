import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("ai_providers")
      .select("*")
      .order("priority", { ascending: true })
      .order("name")
    if (error) throw new Error(error.message)
    return NextResponse.json(data || [])
  } catch (err) {
    const msg = (err as Error)?.message || ""
    if (msg.includes("does not exist") || msg.includes("Could not find the table")) {
      return NextResponse.json([])
    }
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 })
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
        base_url: body.base_url || null,
        enabled: body.enabled ?? body.is_enabled ?? true,
        priority: body.priority ?? 0,
        config: body.config || {},
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (err) {
    const msg = (err as Error)?.message || ""
    if (msg.includes("does not exist") || msg.includes("Could not find the table")) {
      return NextResponse.json({ error: "Providers table not found. Run migration 006." }, { status: 503 })
    }
    return NextResponse.json({ error: "Failed to create provider" }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const { data: provider } = await supabaseAdmin.from("ai_providers").select("slug").eq("id", id).single()
    if (provider) {
      await supabaseAdmin.from("ai_models").delete().eq("provider_slug", provider.slug)
    }
    const { error } = await supabaseAdmin.from("ai_providers").delete().eq("id", id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (_err) {
    return NextResponse.json({ error: "Failed to delete provider" }, { status: 400 })
  }
}
