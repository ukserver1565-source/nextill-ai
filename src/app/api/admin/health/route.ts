import { NextResponse } from "next/server"
import { systemHealthRepo } from "@/lib/repositories/system-health-repo"

export async function GET() {
  try {
    const health = await systemHealthRepo.check()
    const allOperational = health.every((h) => h.status === "operational")
    return NextResponse.json({ services: health, overall: allOperational ? "operational" : "degraded" })
  } catch (err) {
    return NextResponse.json({ error: "Health check failed", details: (err as Error).message }, { status: 500 })
  }
}
