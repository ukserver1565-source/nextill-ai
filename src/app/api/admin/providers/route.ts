import { NextRequest, NextResponse } from "next/server"
import { providersService } from "@/lib/services/admin/providers.service"

function isTableMissing(err: unknown): boolean {
  const msg = (err as Error)?.message || ""
  return msg.includes("does not exist") || msg.includes("Could not find the table") || msg.includes("schema cache")
}

export async function GET() {
  try {
    const data = await providersService.list()
    return NextResponse.json(data)
  } catch (err) {
    if (isTableMissing(err)) return NextResponse.json([])
    return NextResponse.json({ error: "Failed to fetch providers", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = await providersService.create(body)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to create provider", details: (err as Error).message }, { status: 400 })
  }
}
