import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      cache: { status: "ok", hitRate: 0.85, entries: 128 },
      queue: { size: 0, processing: false },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch performance metrics", details: (err as Error).message }, { status: 500 })
  }
}
