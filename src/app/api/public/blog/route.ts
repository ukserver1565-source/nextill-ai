import { NextRequest, NextResponse } from "next/server"
import { blogRepo } from "@/lib/repositories/blog-repo"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const category_id = searchParams.get("category_id") || undefined

    const data = await blogRepo.listPublished({ page, limit, category_id })
    return NextResponse.json(data)
  } catch (_err) {
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
  }
}
