import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_settings")
      .select("*")
      .eq("category", "workflow")
      .order("key", { ascending: true })
    if (error) throw new Error(error.message)
    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch workflows", details: (err as Error).message }, { status: 500 })
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
          .insert({ key, value: stringValue, type: resolvedType, category: "workflow" })
          .select()
          .single()
        if (error) throw new Error(error.message)
        results.push(data)
      }
    }
    return NextResponse.json(results)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update workflow", details: (err as Error).message }, { status: 400 })
  }
}
