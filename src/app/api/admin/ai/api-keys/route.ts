import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: NextRequest) {
  try {
    const providerId = req.nextUrl.searchParams.get("provider_id") || undefined
    let query = supabaseAdmin
      .from("api_keys")
      .select("id, provider_id, name, key_preview, is_enabled, last_tested_at, last_test_success, created_at, updated_at, providers:provider_id(name)")
    if (providerId) query = query.eq("provider_id", providerId)
    query = query.order("created_at", { ascending: false })
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch API keys", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .insert({
        provider_id: body.provider_id,
        name: body.name,
        key_encrypted: body.key_encrypted || "",
        key_preview: body.key_preview || "",
        is_enabled: body.is_enabled ?? true,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to create API key", details: (err as Error).message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const { error } = await supabaseAdmin.from("api_keys").delete().eq("id", id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete API key", details: (err as Error).message }, { status: 400 })
  }
}
