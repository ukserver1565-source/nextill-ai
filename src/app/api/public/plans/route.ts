import { NextResponse } from "next/server"
import { getAdminOrNull } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = getAdminOrNull()
  if (!supabase) {
    console.error("[Plans API] Supabase admin client unavailable — check SUPABASE_SERVICE_ROLE_KEY")
    return NextResponse.json([])
  }

  try {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("price_monthly", { ascending: true })

    if (error) {
      console.error("[Plans API] Query error:", error.message, error.code)
      return NextResponse.json([])
    }

    console.log(`[Plans API] Returning ${data?.length || 0} active plans`)
    return NextResponse.json(data || [])
  } catch (err) {
    console.error("[Plans API] Unexpected error:", err)
    return NextResponse.json([])
  }
}
