import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(
  _req: Request,
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

    // Fetch the payment
    const { data: payment, error: fetchErr } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchErr || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.verification_status !== "pending_manual_review") {
      return NextResponse.json({ error: "Payment is not pending review" }, { status: 400 })
    }

    const now = new Date().toISOString()

    // Update payment: approve and mark completed
    const { error: updateErr } = await supabaseAdmin
      .from("payments")
      .update({
        verification_status: "manually_approved",
        reviewed_by: user.id,
        reviewed_at: now,
        status: "completed",
      })
      .eq("id", id)

    if (updateErr) {
      console.error("Payment approve error:", updateErr)
      return NextResponse.json({ error: "Failed to approve payment", details: updateErr.message }, { status: 500 })
    }

    // --- Plan upgrade logic (mirrors checkout) ---
    const userId = payment.user_id
    const planSlug = payment.plan_slug
    const billingCycle = payment.billing_cycle || "monthly"

    // Look up the plan
    const { data: plan } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("slug", planSlug)
      .eq("is_active", true)
      .single()

    if (!plan) {
      console.error("Plan not found for slug:", planSlug)
      return NextResponse.json({
        success: true,
        message: "Payment approved but plan not found — manual plan assignment may be needed",
      })
    }

    const periodStart = now
    const periodEnd = new Date()
    if (billingCycle === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }

    // Upsert profile with plan and credits
    const { error: profileErr } = await supabaseAdmin.from("profiles").upsert(
      { user_id: userId, plan: plan.slug, credits: plan.credits || 0 },
      { onConflict: "user_id" }
    )
    if (profileErr) {
      console.error("Approve: profile update error:", profileErr)
    }

    // Sync credits table
    const { error: creditsErr } = await supabaseAdmin.from("credits").upsert(
      { user_id: userId, balance: plan.credits || 0 },
      { onConflict: "user_id" }
    )
    if (creditsErr) {
      console.error("Approve: credits update error:", creditsErr)
    }

    // Cancel existing active subscriptions
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "cancelled", cancelled_at: now })
      .eq("user_id", userId)
      .eq("status", "active")

    // Create new subscription
    const { error: subErr } = await supabaseAdmin.from("subscriptions").insert({
      user_id: userId,
      plan_slug: plan.slug,
      status: "active",
      billing_cycle: billingCycle,
      current_period_start: periodStart,
      current_period_end: periodEnd.toISOString(),
    })
    if (subErr) {
      console.error("Approve: subscription insert error:", subErr)
    }

    // Re-fetch updated payment
    const { data: updatedPayment } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("id", id)
      .single()

    return NextResponse.json({ success: true, payment: updatedPayment })
  } catch (err) {
    console.error("Approve payment API error:", err)
    return NextResponse.json({ error: "Failed to approve payment", details: (err as Error).message }, { status: 500 })
  }
}
