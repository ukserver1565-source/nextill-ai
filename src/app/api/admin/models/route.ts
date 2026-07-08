import { NextResponse } from "next/server"
import { modelRepo } from "@/lib/repositories/model-repo"

export async function GET() {
  try {
    const models = await modelRepo.list()
    return NextResponse.json(models)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch models", details: (err as Error).message }, { status: 500 })
  }
}
