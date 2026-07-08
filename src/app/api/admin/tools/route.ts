import { NextResponse } from "next/server"
import { toolRepo } from "@/lib/repositories/tool-repo"

export async function GET() {
  try {
    const tools = await toolRepo.list()
    return NextResponse.json(tools)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch tools", details: (err as Error).message }, { status: 500 })
  }
}
