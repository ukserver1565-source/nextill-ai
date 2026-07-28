import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("site_settings").select("*").order("key")
    if (error) {
      console.error("[Settings GET]", error)
      return NextResponse.json({})
    }
    const settings: Record<string, unknown> = {}
    for (const row of (data || [])) {
      if (row && row.key) {
        settings[row.key] = unwrapValue(row.value)
      }
    }
    return NextResponse.json(settings)
  } catch (err) {
    console.error("[Settings GET]", err)
    return NextResponse.json({})
  }
}

/** Unwrap { v: ... } objects and strip corrupted quotes */
function unwrapValue(val: unknown): unknown {
  if (val === null || val === undefined) return ""
  if (typeof val === "object" && !Array.isArray(val) && "v" in val) {
    return (val as Record<string, unknown>).v
  }
  if (typeof val === "string") {
    // Strip accumulated escaped quotes from old bug
    let s = val
    while (s.length > 1 && s.startsWith('"') && s.endsWith('"')) {
      s = s.slice(1, -1)
    }
    return s
  }
  return val
}

/** Clean corrupted quote layers from old DB values, then wrap as { v: cleanValue } */
function cleanAndWrap(rawValue: unknown): Record<string, unknown> {
  let clean: unknown = rawValue
  if (typeof rawValue === "string") {
    let s = rawValue
    while (s.length > 1 && s.startsWith('"') && s.endsWith('"')) {
      s = s.slice(1, -1)
    }
    clean = s
  }
  return { v: clean }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const now = new Date().toISOString()

    for (const [key, rawValue] of Object.entries(body)) {
      const wrapped = cleanAndWrap(rawValue)

      // Check if key exists
      const { data: existing } = await supabaseAdmin
        .from("site_settings")
        .select("key")
        .eq("key", key)
        .maybeSingle()

      if (existing) {
        await supabaseAdmin
          .from("site_settings")
          .update({ value: wrapped, updated_at: now })
          .eq("key", key)
      } else {
        await supabaseAdmin
          .from("site_settings")
          .insert({ key, value: wrapped, updated_at: now })
      }
    }

    clearEmailCache()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[Settings PATCH]", err)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}

function clearEmailCache() {
  try {
    import("@/lib/email").then(emailLib => {
      if (typeof (emailLib as any).clearCache === "function") (emailLib as any).clearCache()
    }).catch(() => {})
  } catch {
    // not critical
  }
}
