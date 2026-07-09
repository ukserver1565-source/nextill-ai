import { NextRequest, NextResponse } from "next/server"
import { promptsService } from "@/lib/services/admin/prompts.service"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await promptsService.get(id)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch prompt", details: (err as Error).message }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data = await promptsService.update(id, body)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update prompt", details: (err as Error).message }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await promptsService.delete(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete prompt", details: (err as Error).message }, { status: 500 })
  }
}
