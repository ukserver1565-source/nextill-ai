import { NextRequest, NextResponse } from "next/server"
import { paymentRepo } from "@/lib/repositories/payment-repo"
import { paginationSchema } from "@/lib/validation/admin-schemas"

export async function GET(req: NextRequest) {
  try {
    const params = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams))
    const data = await paymentRepo.list(params)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch payments", details: (err as Error).message }, { status: 500 })
  }
}
