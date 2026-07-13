import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .order("key", { ascending: true })
    if (error) throw new Error(error.message)
    const map: Record<string, unknown> = {}
    for (const row of data || []) {
      map[row.key] = row.value
    }
    return NextResponse.json(map)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch SEO settings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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
    return NextResponse.json({ error: "Failed to update SEO settings" }, { status: 400 })
  }
}
