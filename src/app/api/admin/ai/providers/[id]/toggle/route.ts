import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data: current, error: fetchErr } = await supabaseAdmin
      .from("ai_providers")
      .select("enabled")
      .eq("id", id)
      .single()
    if (fetchErr) throw new Error(fetchErr.message)
    const { data, error } = await supabaseAdmin
      .from("ai_providers")
      .update({ enabled: !current.enabled })
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to toggle provider", details: (err as Error).message }, { status: 400 })
  }
}
