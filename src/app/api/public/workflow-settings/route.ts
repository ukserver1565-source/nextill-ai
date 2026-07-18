import { NextResponse } from "next/server"
import { getAdminOrNull } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = getAdminOrNull()
  if (!supabase) return NextResponse.json([])

  try {
    const { data, error } = await supabase
      .from("workflow_settings")
      .select("workflow_slug, workflow_name, credits_cost, guest_daily_limit, free_daily_limit, premium_daily_limit, max_words, is_enabled")
      .eq("is_enabled", true)
      .order("workflow_slug")
    if (error) {
      return NextResponse.json([])
    }
    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json([])
  }
}
