import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  try {
    const { id, provider_id } = await req.json()
    if (!id || !provider_id) throw new Error("Model ID and Provider ID are required")
    await supabaseAdmin.from("ai_models").update({ is_default: false }).eq("provider_id", provider_id)
    const { data, error } = await supabaseAdmin
      .from("ai_models")
      .update({ is_default: true })
      .eq("id", id)
      .eq("provider_id", provider_id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to set default model", details: (err as Error).message }, { status: 400 })
  }
}
