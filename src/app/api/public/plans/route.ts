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
      console.error("[Plans API] Query error:", error.message, error.code)
      // Table might not exist yet — return empty but log it
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        console.warn("[Plans API] Plans table does not exist yet")
        return NextResponse.json([])
      }
      // Return error details so frontend can display them
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
    }

    console.log(`[Plans API] Returning ${data?.length || 0} active plans`)
    return NextResponse.json(data || [])
  } catch (err) {
    console.error("[Plans API] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
