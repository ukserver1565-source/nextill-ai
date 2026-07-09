import { NextRequest, NextResponse } from "next/server"
import { modelsService } from "@/lib/services/admin/models.service"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { provider_id } = await req.json()
    const data = await modelsService.setDefault(provider_id, id)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to set default model", details: (err as Error).message }, { status: 500 })
  }
}
