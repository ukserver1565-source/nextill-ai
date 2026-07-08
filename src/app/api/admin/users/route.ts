import { NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/services/user-service"
import { paginationSchema } from "@/lib/validation/admin-schemas"

export async function GET(req: NextRequest) {
  try {
    const params = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams))
    const data = await userService.list(params)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch users", details: (err as Error).message }, { status: 500 })
  }
}
