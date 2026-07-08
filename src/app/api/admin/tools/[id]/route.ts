import { NextRequest, NextResponse } from "next/server"
import { toolRepo } from "@/lib/repositories/tool-repo"
import { updateToolSchema } from "@/lib/validation/admin-schemas"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = updateToolSchema.parse(body)
    const tool = await toolRepo.update(id, parsed)
    return NextResponse.json(tool)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update tool", details: (err as Error).message }, { status: 400 })
  }
}
