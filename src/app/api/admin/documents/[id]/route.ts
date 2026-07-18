import { NextRequest, NextResponse } from "next/server"
import { documentsRepo } from "@/lib/repositories/documents.repository"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const doc = await documentsRepo.getById(id)
    return NextResponse.json(doc)
  } catch (_err) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await documentsRepo.delete(id)
    return NextResponse.json({ success: true })
  } catch (_err) {
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const doc = await documentsRepo.update(id, body)
    return NextResponse.json(doc)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update document", details: (err as Error).message }, { status: 400 })
  }
}
