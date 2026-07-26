import { NextRequest, NextResponse } from "next/server"
import { contactRepo } from "@/lib/repositories/contact-repo"
import { paginationSchema } from "@/lib/validation/admin-schemas"

export async function GET(req: NextRequest) {
  try {
    const params = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams))
    const result = await contactRepo.list(params)
    // Map status to read boolean for backward compatibility with the page
    const data = result.data.map((m: any) => ({ ...m, read: m.status === "read" || m.status === "replied" }))
    return NextResponse.json({ ...result, data })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch messages", details: (err as Error).message }, { status: 500 })
  }
}
