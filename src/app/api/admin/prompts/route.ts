import { NextRequest, NextResponse } from "next/server"
import { promptsService } from "@/lib/services/admin/prompts.service"

export async function GET(req: NextRequest) {
  try {
    const toolSlug = req.nextUrl.searchParams.get("tool_slug") || undefined
    const data = await promptsService.list(toolSlug)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch prompts", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = await promptsService.create(body)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to create prompt", details: (err as Error).message }, { status: 400 })
  }
}
