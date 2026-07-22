import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await req.json()
    const { reason } = body as { reason?: string }

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
    }

    // Fetch the payment
    const { data: payment, error: fetchErr } = await supabaseAdmin
      .from("payments")
      .select("id, verification_status")
      .eq("id", id)
      .single()

    if (fetchErr || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.verification_status !== "pending_manual_review") {
      return NextResponse.json({ error: "Payment is not pending review" }, { status: 400 })
    }

    const now = new Date().toISOString()

    // Update payment: reject and mark failed
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("payments")
      .update({
        verification_status: "rejected",
        reviewed_by: user.id,
        reviewed_at: now,
        rejection_reason: reason.trim(),
        status: "failed",
      })
      .eq("id", id)
      .select()
      .single()

    if (updateErr) {
      console.error("Payment reject error:", updateErr)
      return NextResponse.json({ error: "Failed to reject payment", details: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, payment: updated })
  } catch (err) {
    console.error("Reject payment API error:", err)
    return NextResponse.json({ error: "Failed to reject payment", details: (err as Error).message }, { status: 500 })
  }
}
