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
    return NextResponse.json({ error: "Failed to fetch documents", details: (err as Error).message }, { status: 500 })
  }
}
