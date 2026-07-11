import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("site_settings").select("*").order("key")
    if (error) throw new Error(error.message)
    const settings: Record<string, any> = {}
    for (const row of (data || [])) {
      settings[row.key] = row.value
    }
    return NextResponse.json(settings)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const updates = Object.entries(body).map(([key, value]) => ({
      key,
      value: typeof value === "string" ? value : JSON.stringify(value),
      updated_at: new Date().toISOString(),
    }))
    const { error } = await supabaseAdmin.from("site_settings").upsert(updates, { onConflict: "key" })
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to save settings", details: (err as Error).message }, { status: 500 })
  }
}
