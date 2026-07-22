import { NextRequest, NextResponse } from "next/server"
import { couponRepo } from "@/lib/repositories/coupon-repo"
import { createCouponSchema } from "@/lib/validation/admin-schemas"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = createCouponSchema.partial().parse(body)
    if (parsed.code) parsed.code = parsed.code.toUpperCase()
    // Fix empty string dates to null
    if (parsed.expires_at === "") parsed.expires_at = null
    const coupon = await couponRepo.update(id, parsed)
    return NextResponse.json(coupon)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update coupon", details: (err as Error).message }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await couponRepo.delete(id)
    return NextResponse.json({ success: true })
  } catch (_err) {
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
  }
}
