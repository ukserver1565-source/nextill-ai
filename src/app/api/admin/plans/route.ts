import { NextRequest, NextResponse } from "next/server"
import { planRepo } from "@/lib/repositories/plan-repo"
import { createPlanSchema } from "@/lib/validation/admin-schemas"

export async function GET() {
  try {
    const plans = await planRepo.list()
    return NextResponse.json(plans)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch plans", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createPlanSchema.parse(body)
    const plan = await planRepo.create(parsed)
    return NextResponse.json(plan, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to create plan", details: (err as Error).message }, { status: 400 })
  }
}
