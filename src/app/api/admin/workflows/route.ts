import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("workflow_settings")
      .select("*")
      .order("workflow_name", { ascending: true })
    if (error) throw new Error(error.message)
    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch workflows" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: "Missing workflow id" }, { status: 400 })
    const { data, error } = await supabaseAdmin
      .from("workflow_settings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 400 })
  }
}
