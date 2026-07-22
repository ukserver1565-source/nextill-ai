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

    // Fetch pending payments with profile data
    const { data: payments, error } = await supabaseAdmin
      .from("payments")
      .select(`
        id,
        user_id,
        plan_slug,
        amount,
        final_amount,
        discount_amount,
        provider,
        provider_transaction_id,
        verification_status,
        billing_cycle,
        created_at,
        profiles!payments_user_id_fkey (
          email,
          full_name
        )
      `)
      .eq("verification_status", "pending_manual_review")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Fetch pending payments error:", error)
      return NextResponse.json({ error: "Failed to fetch pending payments", details: error.message }, { status: 500 })
    }

    // Flatten profile data for easier consumption
    const result = (payments || []).map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      user_email: p.profiles?.email || null,
      user_name: p.profiles?.full_name || null,
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
