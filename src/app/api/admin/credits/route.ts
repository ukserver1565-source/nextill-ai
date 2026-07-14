import { NextRequest, NextResponse } from "next/server"
import { creditRepo } from "@/lib/repositories/credit-repo"
import { paginationSchema, addCreditsSchema } from "@/lib/validation/admin-schemas"

function isTableMissing(err: unknown): boolean {
  const msg = (err as Error)?.message || ""
  return msg.includes("does not exist") || msg.includes("Could not find the table") || msg.includes("schema cache")
}

export async function GET(req: NextRequest) {
  try {
    const params = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams))
    const data = await creditRepo.list(params)
    return NextResponse.json(data)
  } catch (err) {
    if (isTableMissing(err)) return NextResponse.json([])
    return NextResponse.json({ error: "Failed to fetch credits", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, amount, description } = addCreditsSchema.parse(body)
    await creditRepo.add(userId, amount, description || "Admin adjustment")
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to add credits", details: (err as Error).message }, { status: 400 })
  }
}
