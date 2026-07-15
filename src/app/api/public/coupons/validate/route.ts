import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  try {
    const { code, billing_cycle } = await req.json()
    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, message: "Coupon code is required" })
    }

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .single()

    if (error || !coupon) {
      return NextResponse.json({ valid: false, message: "Invalid coupon code" })
    }

    if (!coupon.is_active) {
      return NextResponse.json({ valid: false, message: "This coupon is no longer active" })
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, message: "This coupon has expired" })
    }

    if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ valid: false, message: "This coupon has reached its usage limit" })
    }

    // Check billing cycle
    if (coupon.billing_cycle && coupon.billing_cycle !== "both" && billing_cycle && coupon.billing_cycle !== billing_cycle) {
      return NextResponse.json({ valid: false, message: `This coupon is only valid for ${coupon.billing_cycle} billing` })
    }

    // Calculate discount
    let discount = 0
    if (coupon.coupon_type === "percentage" || coupon.discount_type === "percentage") {
      discount = coupon.discount_value || coupon.discount_amount || 0
      return NextResponse.json({
        valid: true,
        type: "percentage",
        discount,
        message: `${discount}% discount applied`,
      })
    } else if (coupon.coupon_type === "fixed" || coupon.discount_type === "fixed") {
      discount = coupon.discount_value || coupon.discount_amount || 0
      return NextResponse.json({
        valid: true,
        type: "fixed",
        discount,
        message: `$${discount} discount applied`,
      })
    } else if (coupon.coupon_type === "bonus_credits") {
      return NextResponse.json({
        valid: true,
        type: "bonus_credits",
        discount: 0,
        bonusCredits: coupon.bonus_credits || 0,
        message: `+${coupon.bonus_credits} bonus credits`,
      })
    } else if (coupon.coupon_type === "first_payment") {
      discount = coupon.discount_value || coupon.discount_amount || 0
      return NextResponse.json({
        valid: true,
        type: "percentage",
        discount,
        message: `${discount}% off first payment`,
      })
    }

    return NextResponse.json({ valid: false, message: "Unknown coupon type" })
  } catch {
    return NextResponse.json({ valid: false, message: "Failed to validate coupon" })
  }
}
