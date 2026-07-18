import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { plan_slug, billing_cycle, coupon_code } = await req.json()

    if (!plan_slug) {
      return NextResponse.json({ error: "Plan is required" }, { status: 400 })
    }

    // Look up the plan
    const { data: plan } = await supabase
      .from("plans")
      .select("*")
      .eq("slug", plan_slug)
      .eq("is_active", true)
      .single()

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Free plan — activate immediately
    if (plan.price_monthly === 0) {
      const now = new Date()
      const periodEnd = new Date(now)
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      // Update profile with new plan and credits
      const { error: profileError } = await supabase.from("profiles").update({ plan: plan.slug, credits: plan.credits || 0 }).eq("user_id", user.id)
      if (profileError) {
        console.error("Free plan profile update error:", profileError)
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
      }

      // Sync credits table (single source of truth) — REPLACE balance, never add
      const { error: creditsError } = await supabaseAdmin.from("credits").upsert(
        { user_id: user.id, balance: plan.credits || 0 },
        { onConflict: "user_id" }
      )
      if (creditsError) {
        console.error("Free plan credits update error:", creditsError)
        return NextResponse.json({ error: "Failed to update credits" }, { status: 500 })
      }

      // Cancel any existing active subscriptions before creating new one
      await supabaseAdmin.from("subscriptions")
        .update({ status: "cancelled", cancelled_at: now.toISOString() })
        .eq("user_id", user.id)
        .eq("status", "active")

      const { error: subError } = await supabaseAdmin.from("subscriptions").insert({
        user_id: user.id,
        plan_slug: plan.slug,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      if (subError) {
        console.error("Free plan subscription error:", subError)
        return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "Free plan activated" })
    }

    // Paid plan — process payment (simulated for now, integrate real provider here)
    const price = billing_cycle === "yearly" ? plan.price_yearly : plan.price_monthly

    // Calculate coupon discount
    let discountAmount = 0
    let couponId: string | null = null
    if (coupon_code) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("id, discount_type, discount_value, applicable_plan")
        .eq("code", coupon_code.toUpperCase())
        .single()

      if (coupon) {
        couponId = coupon.id
        // Verify coupon applies to this plan
        if (coupon.applicable_plan && coupon.applicable_plan !== plan_slug) {
          return NextResponse.json({ error: "This coupon is not valid for this plan" }, { status: 400 })
        }
        if (coupon.discount_type === "percentage") {
          discountAmount = Math.round(price * (coupon.discount_value / 100) * 100) / 100
        } else if (coupon.discount_type === "fixed") {
          discountAmount = Math.min(coupon.discount_value, price)
        }
      }
    }

    const finalAmount = Math.max(0, price - discountAmount)

    const now = new Date()
    const periodEnd = new Date(now)
    if (billing_cycle === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }

    // Create payment record with actual discount
    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: user.id,
      plan_slug: plan.slug,
      amount: price,
      currency: "USD",
      status: "completed",
      provider: "manual",
      discount_amount: discountAmount,
      coupon_id: couponId,
      final_amount: finalAmount,
      billing_cycle: billing_cycle || "monthly",
    })

    if (paymentError) {
      console.error("Payment record error:", paymentError)
    }

    // Update profile with new plan and credits
    const { error: profileError } = await supabase.from("profiles").update({
      plan: plan.slug,
      credits: plan.credits || 0,
    }).eq("user_id", user.id)
    if (profileError) {
      console.error("Profile update error:", profileError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    // Sync credits table (single source of truth) — REPLACE balance, never add
    const { error: creditsError } = await supabaseAdmin.from("credits").upsert(
      { user_id: user.id, balance: plan.credits || 0 },
      { onConflict: "user_id" }
    )
    if (creditsError) {
      console.error("Credits update error:", creditsError)
      return NextResponse.json({ error: "Failed to update credits" }, { status: 500 })
    }

    // Cancel any existing active subscriptions before creating new one
    await supabaseAdmin.from("subscriptions")
      .update({ status: "cancelled", cancelled_at: now.toISOString() })
      .eq("user_id", user.id)
      .eq("status", "active")

    // Create new subscription
    const { error: subError } = await supabaseAdmin.from("subscriptions").insert({
      user_id: user.id,
      plan_slug: plan.slug,
      status: "active",
      billing_cycle: billing_cycle || "monthly",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    })
    if (subError) {
      console.error("Subscription insert error:", subError)
      return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
    }

    // Record coupon usage if applicable — with real discount and increment used_count
    if (couponId && coupon_code) {
      // Insert redemption record with actual discount
      await supabase.from("coupon_redemptions").insert({
        coupon_id: couponId,
        user_id: user.id,
        discount_applied: discountAmount,
        billing_cycle: billing_cycle || "monthly",
        plan_slug: plan_slug,
      })

      // Increment used_count (not reset to 0)
      const { data: currentCoupon } = await supabaseAdmin
        .from("coupons")
        .select("used_count")
        .eq("id", couponId)
        .single()

      if (currentCoupon) {
        await supabaseAdmin
          .from("coupons")
          .update({ used_count: (currentCoupon.used_count || 0) + 1 })
          .eq("id", couponId)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${plan.name} plan activated successfully`,
      plan: plan.slug,
      discountApplied: discountAmount,
      finalAmount,
    })
  } catch (err) {
    return NextResponse.json({ error: "Checkout failed", details: (err as Error).message }, { status: 500 })
  }
}
