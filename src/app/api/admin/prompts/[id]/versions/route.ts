import { NextRequest, NextResponse } from "next/server"
import { promptsService } from "@/lib/services/admin/prompts.service"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await promptsService.getVersions(id)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch versions", details: (err as Error).message }, { status: 500 })
  }
}
