import { NextRequest, NextResponse } from "next/server"
import { apiKeysService } from "@/lib/services/admin/api-keys.service"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await apiKeysService.get(id)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch API key", details: (err as Error).message }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data = await apiKeysService.update(id, body)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update API key", details: (err as Error).message }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await apiKeysService.delete(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete API key", details: (err as Error).message }, { status: 500 })
  }
}
