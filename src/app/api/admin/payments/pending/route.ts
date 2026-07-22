import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
    const role = ((profile as { role?: string } | null)?.role || "").toLowerCase()
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch pending payments — simple query without join
    const { data: payments, error } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("verification_status", "pending_manual_review")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Fetch pending payments error:", error)
      return NextResponse.json({ error: "Failed to fetch pending payments", details: error.message }, { status: 500 })
    }

    // Fetch user profiles for each payment
    const userIds = [...new Set((payments || []).map((p: any) => p.user_id).filter(Boolean))]
    let profileMap: Record<string, { email: string; full_name: string }> = {}

    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("user_id, email, full_name")
        .in("user_id", userIds)

      if (profiles) {
        for (const p of profiles) {
          profileMap[p.user_id] = { email: p.email || "", full_name: p.full_name || "" }
        }
      }
    }

    // Flatten data for easier consumption
    const result = (payments || []).map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      user_email: profileMap[p.user_id]?.email || null,
      user_name: profileMap[p.user_id]?.full_name || null,
      plan_slug: p.plan_slug,
      amount: p.amount,
      final_amount: p.final_amount,
      discount_amount: p.discount_amount,
      provider: p.provider,
      provider_transaction_id: p.provider_transaction_id,
      verification_status: p.verification_status,
      billing_cycle: p.billing_cycle,
      created_at: p.created_at,
    }))

    return NextResponse.json(result)
  } catch (err) {
    console.error("Pending payments API error:", err)
    return NextResponse.json({ error: "Failed to fetch pending payments", details: (err as Error).message }, { status: 500 })
  }
}
