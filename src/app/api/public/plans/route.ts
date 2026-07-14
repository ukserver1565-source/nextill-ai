import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("is_active", true)
      .order("price_monthly", { ascending: true })
    if (error) {
      // Table might not exist
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
