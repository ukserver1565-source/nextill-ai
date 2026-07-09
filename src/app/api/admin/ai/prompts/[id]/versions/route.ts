import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data: prompt, error: fetchError } = await supabaseAdmin
      .from("prompt_templates")
      .select("category")
      .eq("id", id)
      .single()
    if (fetchError || !prompt) throw new Error("Prompt not found")
    const { data, error } = await supabaseAdmin
      .from("prompt_templates")
      .select("*")
      .eq("category", prompt.category)
      .order("version", { ascending: false })
    if (error) throw new Error(error.message)
    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch versions", details: (err as Error).message }, { status: 500 })
  }
}
