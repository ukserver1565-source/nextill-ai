import { NextRequest, NextResponse } from "next/server"
import { modelsService } from "@/lib/services/admin/models.service"

export async function GET(req: NextRequest) {
  try {
    const providerId = req.nextUrl.searchParams.get("provider_id") || undefined
    const data = await modelsService.list(providerId)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch models", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = await modelsService.create(body)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to create model", details: (err as Error).message }, { status: 400 })
  }
}
