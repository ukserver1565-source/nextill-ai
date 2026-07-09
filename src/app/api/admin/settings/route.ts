import { NextRequest, NextResponse } from "next/server"
import { adminSettingsService } from "@/lib/services/admin/settings.service"

export async function GET() {
  try {
    const data = await adminSettingsService.getAll()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch settings", details: (err as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const data = await adminSettingsService.setBulk(body)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update settings", details: (err as Error).message }, { status: 400 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { key, value, type, category, label } = await req.json()
    const data = await adminSettingsService.set(key, value, type)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to create setting", details: (err as Error).message }, { status: 400 })
  }
}
