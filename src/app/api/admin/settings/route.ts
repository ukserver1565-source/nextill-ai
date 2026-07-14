import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { safeQuery } from "@/lib/supabase/safe-query"

function isTableMissing(err: unknown): boolean {
  const msg = (err as Error)?.message || ""
  return msg.includes("does not exist") || msg.includes("Could not find the table") || msg.includes("schema cache")
}

interface SettingRow {
  key: string
  value: unknown
}

export async function GET() {
  try {
    const { data } = await safeQuery<SettingRow>(() => supabaseAdmin.from("site_settings").select("*").order("key"))
    const settings: Record<string, unknown> = {}
    for (const row of (data || [])) {
      if (row && row.key) settings[row.key] = row.value
    }
    return NextResponse.json(settings)
  } catch (err) {
    if (isTableMissing(err)) return NextResponse.json({})
    return NextResponse.json({ error: "Failed to fetch settings", details: (err as Error).message }, { status: 500 })
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
