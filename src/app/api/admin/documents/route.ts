import { NextResponse } from "next/server"
import { documentsRepo } from "@/lib/repositories/documents.repository"
import { paginationSchema } from "@/lib/validations/pagination.schema"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const params = paginationSchema.parse(Object.fromEntries(searchParams))
    const result = await documentsRepo.listAll(params)
    return NextResponse.json(result)
  } catch (err) {
    console.error("[admin/documents]", err)
    return NextResponse.json({ data: [], total: 0 })
  }
}
