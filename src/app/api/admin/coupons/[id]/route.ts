import { NextRequest, NextResponse } from "next/server"
import { couponRepo } from "@/lib/repositories/coupon-repo"

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await couponRepo.delete(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete coupon", details: (err as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const coupon = await couponRepo.update(id, body)
    return NextResponse.json(coupon)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update coupon", details: (err as Error).message }, { status: 400 })
  }
}
