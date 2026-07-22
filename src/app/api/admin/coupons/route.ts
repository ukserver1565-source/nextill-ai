import { NextRequest, NextResponse } from "next/server"
import { couponRepo } from "@/lib/repositories/coupon-repo"
import { createCouponSchema } from "@/lib/validation/admin-schemas"

export async function GET() {
  try {
    const coupons = await couponRepo.list()
    return NextResponse.json(coupons)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch coupons", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createCouponSchema.parse(body)
    // Fix empty string dates to null
    if (parsed.expires_at === "") parsed.expires_at = null
    const coupon = await couponRepo.create({
      code: parsed.code.toUpperCase(),
      discount_type: parsed.discount_type,
      discount_value: parsed.discount_value,
      usage_limit: parsed.usage_limit,
      is_active: parsed.is_active,
      ...(parsed.expires_at ? { expires_at: parsed.expires_at } : {}),
    })
    return NextResponse.json(coupon, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to create coupon", details: (err as Error).message }, { status: 400 })
  }
}
