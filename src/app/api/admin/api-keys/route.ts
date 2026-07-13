import { NextRequest, NextResponse } from "next/server"
import { apiKeysService } from "@/lib/services/admin/api-keys.service"

export async function GET(req: NextRequest) {
  try {
    const providerSlug = req.nextUrl.searchParams.get("provider_slug") || req.nextUrl.searchParams.get("provider_id") || undefined
    const data = await apiKeysService.list(providerSlug)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch API keys", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = await apiKeysService.create(body)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to create API key", details: (err as Error).message }, { status: 400 })
  }
}
