import { NextRequest, NextResponse } from "next/server"
import { modelRepo } from "@/lib/repositories/model-repo"
import { updateModelSchema } from "@/lib/validation/admin-schemas"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = updateModelSchema.parse(body)
    const model = await modelRepo.update(id, parsed)
    return NextResponse.json(model)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update model", details: (err as Error).message }, { status: 400 })
  }
}
