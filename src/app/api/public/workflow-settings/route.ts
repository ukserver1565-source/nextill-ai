import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("workflow_settings")
      .select("workflow_slug, workflow_name, credits_cost, guest_daily_limit, free_daily_limit, premium_daily_limit, max_words, is_enabled")
      .eq("is_enabled", true)
      .order("workflow_slug")
    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return NextResponse.json([])
      }
      throw error
    }
    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json([])
  }
}
