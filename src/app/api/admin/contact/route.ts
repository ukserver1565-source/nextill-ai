import { NextRequest, NextResponse } from "next/server"
import { contactRepo } from "@/lib/repositories/contact-repo"
import { paginationSchema } from "@/lib/validation/admin-schemas"

export async function GET(req: NextRequest) {
  try {
    const params = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams))
    const data = await contactRepo.list(params)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch messages", details: (err as Error).message }, { status: 500 })
  }
}
