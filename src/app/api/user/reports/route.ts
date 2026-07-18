import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("domain_reports")
      .select("id, domain, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      // Table might not exist yet, schema not synced, or RLS not configured — treat as empty
      const msg = error.message?.toLowerCase() ?? ""
      const isTableMissing =
        error.code === "42P01" ||
        error.code === "PGRST204" ||
        error.code === "PGRST106" ||
        msg.includes("does not exist") ||
        msg.includes("could not find") ||
        msg.includes("relation")
      if (isTableMissing) {
        return NextResponse.json([])
      }
      console.error("[Reports] Supabase query error:", error.code, error.message)
      return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (e) {
    console.error("[Reports] Unexpected error:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
