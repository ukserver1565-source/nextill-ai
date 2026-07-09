import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from("ai_api_keys")
      .select("*")
      .eq("id", id)
      .single()
    if (error) throw new Error(error.message)
    const masked = { ...data, key_encrypted: data.key_prefix + "****" + data.key_encrypted.slice(-4) }
    return NextResponse.json(masked)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch API key", details: (err as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const payload: Record<string, unknown> = {}
    if (body.name !== undefined) payload.name = body.name
    if (body.is_enabled !== undefined) payload.is_enabled = body.is_enabled
    if (body.key_encrypted !== undefined) payload.key_encrypted = body.key_encrypted
    const { data, error } = await supabaseAdmin
      .from("ai_api_keys")
      .update(payload)
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update API key", details: (err as Error).message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await supabaseAdmin.from("ai_api_keys").delete().eq("id", id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete API key", details: (err as Error).message }, { status: 400 })
  }
}
