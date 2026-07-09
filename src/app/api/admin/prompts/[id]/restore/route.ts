import { NextRequest, NextResponse } from "next/server"
import { promptsService } from "@/lib/services/admin/prompts.service"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { version } = await req.json()
    const data = await promptsService.restoreVersion(id, version)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to restore version", details: (err as Error).message }, { status: 400 })
  }
}
