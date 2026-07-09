import { NextRequest, NextResponse } from "next/server"
import { providersService } from "@/lib/services/admin/providers.service"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await providersService.toggle(id)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to toggle provider", details: (err as Error).message }, { status: 500 })
  }
}
