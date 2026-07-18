import { NextRequest, NextResponse } from "next/server"
import { planRepo } from "@/lib/repositories/plan-repo"
import { updatePlanSchema } from "@/lib/validation/admin-schemas"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const plan = await planRepo.getById(id)
    return NextResponse.json(plan)
  } catch (_err) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = updatePlanSchema.parse(body)
    const plan = await planRepo.update(id, parsed)
    return NextResponse.json(plan)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update plan", details: (err as Error).message }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await planRepo.delete(id)
    return NextResponse.json({ success: true })
  } catch (_err) {
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 })
  }
}
