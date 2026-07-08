import { NextRequest, NextResponse } from "next/server"
import { securityLogRepo } from "@/lib/repositories/security-log-repo"
import { paginationSchema } from "@/lib/validation/admin-schemas"

export async function GET(req: NextRequest) {
  try {
    const params = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams))
    const data = await securityLogRepo.list(params)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch security logs", details: (err as Error).message }, { status: 500 })
  }
}
