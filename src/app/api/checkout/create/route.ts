import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getAdapter } from "@/lib/payments/providers"

// Shared plan upgrade logic — used by checkout AND admin approval
export async function upgradeUserPlan(
  userId: string,
  planSlug: string,
  billingCycle: string = "monthly"
) {
  const { data: plan } = await supabaseAdmin
    .from("plans")
    .select("*")
    .eq("slug", planSlug)
    .eq("is_active", true)
    .single()

  if (!plan) throw new Error("Plan not found")

  const now = new Date()
  const periodEnd = new Date(now)
  if (billingCycle === "yearly") {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  }

  // Update profile
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    { user_id: userId, plan: plan.slug, credits: plan.credits || 0 },
    { onConflict: "user_id" }
  )
  if (profileError) throw new Error("Failed to update profile: " + profileError.message)

  // Sync credits table
  const { error: creditsError } = await supabaseAdmin.from("credits").upsert(
    { user_id: userId, balance: plan.credits || 0 },
    { onConflict: "user_id" }
  )
  if (creditsError) throw new Error("Failed to update credits: " + creditsError.message)

  // Cancel existing active subscriptions
  await supabaseAdmin.from("subscriptions")
    .update({ status: "cancelled", cancelled_at: now.toISOString() })
    .eq("user_id", userId)
    .eq("status", "active")

  // Create new subscription
  const { error: subError } = await supabaseAdmin.from("subscriptions").insert({
    user_id: userId,
    plan_slug: plan.slug,
    status: "active",
    billing_cycle: billingCycle,
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
  })
  if (subError) throw new Error("Failed to create subscription: " + subError.message)

  return { planName: plan.name, credits: plan.credits }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { plan_slug, billing_cycle, coupon_code, payment_method_id, provider_transaction_id } = await req.json()

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

    // Free plan — activate immediately (no payment needed)
    if (plan.price_monthly === 0) {
      await upgradeUserPlan(user.id, plan.slug, billing_cycle || "monthly")
      return NextResponse.json({ success: true, message: "Free plan activated" })
    }

    // Paid plan — calculate price + coupon
    const price = billing_cycle === "yearly" ? plan.price_yearly : plan.price_monthly

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
    const provider = payment_method_id || "manual"

    // Determine verification mode: check if provider has verified credentials
    let isAutoVerified = false
    let verificationStatus: string = "pending_manual_review"

    // bank_transfer and crypto ALWAYS stay manual regardless of credentials
    if (provider !== "bank_transfer" && provider !== "crypto") {
      const { data: credentials } = await supabaseAdmin
        .from("payment_provider_credentials")
        .select("is_verified")
        .eq("provider", provider)
        .single()

      if (credentials?.is_verified) {
        isAutoVerified = true
      }
    }

    // If auto mode: call the adapter to verify the payment
    if (isAutoVerified && provider_transaction_id) {
      const adapter = getAdapter(provider)
      if (adapter) {
        try {
          const result = await adapter.verifyPayment({
            transactionId: provider_transaction_id,
            amount: finalAmount,
            currency: "USD",
          })

          if (result.success) {
            verificationStatus = "auto_verified"
          } else {
            // Payment failed verification — record it but don't upgrade
            const { error: _paymentError } = await supabaseAdmin.from("payments").insert({
              user_id: user.id,
              plan_slug: plan.slug,
              amount: price,
              currency: "USD",
              status: "failed",
              provider,
              provider_transaction_id,
              discount_amount: discountAmount,
              coupon_id: couponId,
              final_amount: finalAmount,
              billing_cycle: billing_cycle || "monthly",
              verification_status: "rejected",
              auto_verification_response: result.rawResponse || { message: result.message },
              rejection_reason: result.message,
            })

            return NextResponse.json({
              error: "Payment could not be verified",
              details: result.message,
            }, { status: 400 })
          }
        } catch (err) {
          console.error("Auto-verification error:", err)
          // On adapter error, fall through to manual mode
          verificationStatus = "pending_manual_review"
          isAutoVerified = false
        }
      }
    }

    // Create payment record
    const { data: payment, error: _paymentError } = await supabaseAdmin.from("payments").insert({
      user_id: user.id,
      plan_slug: plan.slug,
      amount: price,
      currency: "USD",
      status: verificationStatus === "auto_verified" ? "completed" : "pending",
      provider,
      provider_transaction_id: provider_transaction_id || null,
      discount_amount: discountAmount,
      coupon_id: couponId,
      final_amount: finalAmount,
      billing_cycle: billing_cycle || "monthly",
      verification_status: verificationStatus,
      auto_verification_response: isAutoVerified ? { verified_at: new Date().toISOString() } : null,
    }).select("id").single()

    if (_paymentError) {
      console.error("Payment record error:", _paymentError)
      return NextResponse.json({ error: "Failed to record payment" }, { status: 500 })
    }

    // Record coupon usage
    if (couponId && coupon_code) {
      await supabaseAdmin.from("coupon_redemptions").insert({
        coupon_id: couponId,
        user_id: user.id,
        discount_applied: discountAmount,
        billing_cycle: billing_cycle || "monthly",
        plan_slug: plan_slug,
        payment_id: payment?.id,
      })

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

    // AUTO mode: payment verified — upgrade immediately
    if (verificationStatus === "auto_verified") {
      await upgradeUserPlan(user.id, plan.slug, billing_cycle || "monthly")

      return NextResponse.json({
        success: true,
        verified: true,
        message: "Payment verified! Your plan is now active.",
        plan: plan.slug,
        payment_id: payment?.id,
      })
    }

    // MANUAL mode: payment pending — do NOT upgrade yet
    return NextResponse.json({
      success: true,
      verified: false,
      message: "Your payment is being reviewed. This usually takes a few minutes — you'll receive confirmation once approved.",
      payment_id: payment?.id,
      verification_status: "pending_manual_review",
    })

  } catch (err) {
    return NextResponse.json({ error: "Checkout failed", details: (err as Error).message }, { status: 500 })
  }
}
