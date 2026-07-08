import { NextResponse } from "next/server"
import { adminService } from "@/lib/services/admin-service"

export async function GET() {
  try {
    const data = await adminService.getOverview()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch admin overview", details: (err as Error).message }, { status: 500 })
  }
}
