import { NextRequest, NextResponse } from "next/server"
import { providersService } from "@/lib/services/admin/providers.service"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await providersService.testConnection(id)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: "Failed to test connection", details: (err as Error).message }, { status: 500 })
  }
}
