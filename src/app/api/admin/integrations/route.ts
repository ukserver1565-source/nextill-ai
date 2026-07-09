import { NextRequest, NextResponse } from "next/server"
import { adminSettingsService } from "@/lib/services/admin/settings.service"
import { auditService } from "@/lib/services/admin/audit.service"

const DEFAULT_INTEGRATIONS = [
  { id: "supabase", name: "Supabase", enabled: true, type: "database" },
  { id: "stripe", name: "Stripe", enabled: false, type: "payments" },
  { id: "sendgrid", name: "SendGrid", enabled: false, type: "email" },
  { id: "openai", name: "OpenAI", enabled: false, type: "ai" },
]

export async function GET() {
  try {
    const settings = await adminSettingsService.getByCategory("integrations")
    const integrations = DEFAULT_INTEGRATIONS.map((i) => ({
      ...i,
      enabled: settings[`integration_${i.id}_enabled`] ?? i.enabled,
    }))
    return NextResponse.json(integrations)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch integrations", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, enabled, config } = await req.json()
    if (id) {
      await adminSettingsService.set(`integration_${id}_enabled`, enabled)
    }
    if (config) {
      for (const [key, value] of Object.entries(config)) {
        await adminSettingsService.set(`integration_${id}_${key}`, value)
      }
    }
    await auditService.log("integration_updated", { id, enabled })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to update integration", details: (err as Error).message }, { status: 400 })
  }
}
