import { NextRequest, NextResponse } from "next/server"
import { auditService } from "@/lib/services/admin/audit.service"

export async function GET(req: NextRequest) {
  try {
    const page = Number(req.nextUrl.searchParams.get("page")) || 1
    const perPage = Number(req.nextUrl.searchParams.get("perPage")) || 20
    const data = await auditService.list(page, perPage)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch audit logs", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, section, details, user_id } = await req.json()
    await auditService.log(action, section || "general", details, user_id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to create audit log", details: (err as Error).message }, { status: 400 })
  }
}
