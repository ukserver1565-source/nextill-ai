import { NextRequest, NextResponse } from "next/server"
import { projectRepo } from "@/lib/repositories/project-repo"
import { paginationSchema, createProjectSchema } from "@/lib/validation/admin-schemas"

export async function GET(req: NextRequest) {
  try {
    const params = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams))
    const data = await projectRepo.list(params)
    return NextResponse.json(data)
  } catch (err) {
    console.error("[admin/projects]", err)
    return NextResponse.json({ data: [], total: 0 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createProjectSchema.parse(body)
    const project = await projectRepo.create(parsed as { name: string; domain?: string; user_id: string })
    return NextResponse.json(project, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to create project", details: (err as Error).message }, { status: 400 })
  }
}
