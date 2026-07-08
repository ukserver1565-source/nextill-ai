import { NextResponse } from "next/server"
import { apiKeyRepo } from "@/lib/repositories/api-key-repo"

export async function GET() {
  try {
    const keys = await apiKeyRepo.listAll()
    return NextResponse.json(keys)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch API keys", details: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    await apiKeyRepo.delete(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete API key", details: (err as Error).message }, { status: 500 })
  }
}
