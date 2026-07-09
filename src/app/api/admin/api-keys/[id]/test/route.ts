import { NextRequest, NextResponse } from "next/server"
import { apiKeysService } from "@/lib/services/admin/api-keys.service"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await apiKeysService.test(id)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: "Failed to test API key", details: (err as Error).message }, { status: 500 })
  }
}
