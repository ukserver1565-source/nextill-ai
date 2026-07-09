import { NextRequest, NextResponse } from "next/server"
import { apiKeysService } from "@/lib/services/admin/api-keys.service"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { key } = await req.json()
    const data = await apiKeysService.rotate(id, key)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to rotate API key", details: (err as Error).message }, { status: 400 })
  }
}
