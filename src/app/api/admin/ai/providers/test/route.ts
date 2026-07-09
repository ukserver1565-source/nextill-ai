import { NextRequest, NextResponse } from "next/server"
import { providersService } from "@/lib/services/admin/providers.service"

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json()
    const result = await providersService.testConnection(id)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message, success: false, latency: 0 }, { status: 400 })
  }
}
