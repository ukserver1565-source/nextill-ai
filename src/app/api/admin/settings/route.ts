import { NextRequest, NextResponse } from "next/server"
import { settingsRepo } from "@/lib/repositories/settings-repo"
import { updateSettingsSchema } from "@/lib/validation/admin-schemas"

export async function GET() {
  try {
    const settings = await settingsRepo.get()
    return NextResponse.json(settings)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch settings", details: (err as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = updateSettingsSchema.parse(body)
    const settings = await settingsRepo.update(parsed)
    return NextResponse.json(settings)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update settings", details: (err as Error).message }, { status: 400 })
  }
}
