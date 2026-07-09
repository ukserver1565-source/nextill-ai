import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { providerEngine } from "@/lib/provider"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from("ai_api_keys")
      .select("provider_slug, key_encrypted")
      .eq("id", id)
      .single()
    if (error || !data) throw new Error(`API key not found: ${error?.message}`)

    const result = await providerEngine.testConnection(data.provider_slug)

    await supabaseAdmin.from("ai_api_keys").update({
      last_used_at: new Date().toISOString(),
    }).eq("id", id)

    return NextResponse.json({ success: result.success, latency: result.latencyMs, error: result.error })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message, success: false }, { status: 400 })
  }
}
