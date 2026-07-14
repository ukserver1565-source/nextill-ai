import { NextResponse } from "next/server"
import { runPlagiarismCheck } from "@/lib/workflows"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { text } = body
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 })
    }
    const result = await runPlagiarismCheck({ text, runAiDetection: true })
    return NextResponse.json(result)
  } catch (err) {
    console.error("[plagiarism] API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
