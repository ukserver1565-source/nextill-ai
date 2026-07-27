import { NextResponse } from "next/server"
import { toolRepo } from "@/lib/repositories/tool-repo"

export async function GET() {
  try {
    const tools = await toolRepo.list()
    return NextResponse.json(tools)
  } catch (err) {
    console.error("[Tools]", err)
    return NextResponse.json([])
  }
}
