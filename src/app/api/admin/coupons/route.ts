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
    const coupon = await couponRepo.create(parsed)
    return NextResponse.json(coupon, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to create coupon", details: (err as Error).message }, { status: 400 })
  }
}
