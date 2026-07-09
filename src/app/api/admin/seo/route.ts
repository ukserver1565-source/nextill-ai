import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_settings")
      .select("*")
      .eq("category", "seo")
      .order("key", { ascending: true })
    if (error) throw new Error(error.message)
    const map: Record<string, any> = {}
    for (const row of data || []) {
      try {
        map[row.key] = row.type === "json" ? JSON.parse(row.value) : row.type === "number" ? Number(row.value) : row.type === "boolean" ? row.value === "true" : row.value
      } catch { map[row.key] = row.value }
    }
    return NextResponse.json(map)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch SEO settings", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const results: any[] = []
    for (const [key, value] of Object.entries(body)) {
      const resolvedType = typeof value === "boolean" ? "boolean" : typeof value === "number" ? "number" : typeof value === "object" ? "json" : "string"
      const stringValue = resolvedType === "json" ? JSON.stringify(value) : String(value)
      const { data: existing } = await supabaseAdmin
        .from("admin_settings")
        .select("id")
        .eq("key", key)
        .maybeSingle()
      if (existing) {
        const { data, error } = await supabaseAdmin
          .from("admin_settings")
          .update({ value: stringValue, type: resolvedType, updated_at: new Date().toISOString() })
          .eq("key", key)
          .select()
          .single()
        if (error) throw new Error(error.message)
        results.push(data)
      } else {
        const { data, error } = await supabaseAdmin
          .from("admin_settings")
          .insert({ key, value: stringValue, type: resolvedType, category: "seo" })
          .select()
          .single()
        if (error) throw new Error(error.message)
        results.push(data)
      }
    }
    return NextResponse.json(results)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update SEO settings", details: (err as Error).message }, { status: 400 })
  }
}
