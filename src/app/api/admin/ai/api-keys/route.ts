import { NextRequest, NextResponse } from "next/server"
import { apiKeysService } from "@/lib/services/admin/api-keys.service"

export async function GET(req: NextRequest) {
  try {
    const providerSlug = req.nextUrl.searchParams.get("provider_slug") || req.nextUrl.searchParams.get("provider_id") || undefined
    const data = await apiKeysService.list(providerSlug)
    return NextResponse.json(data)
  } catch (err) {
    const msg = (err as Error)?.message || ""
    if (msg.includes("does not exist") || msg.includes("Could not find the table")) {
      return NextResponse.json([])
    }
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = await apiKeysService.create({
      provider_slug: body.provider_slug || body.provider_id,
      name: body.name,
      key: body.key,
      is_enabled: body.is_enabled ?? true,
    })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to create API key" }, { status: 400 })
  }
}
