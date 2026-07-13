import { NextRequest, NextResponse } from "next/server"
import { adminSettingsService } from "@/lib/services/admin/settings.service"
import { auditService } from "@/lib/services/admin/audit.service"

export async function GET() {
  try {
    const settings = await adminSettingsService.getByCategory("email")
    return NextResponse.json(settings)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch email settings", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const results = await adminSettingsService.setBulk(body)
    await auditService.log("email_settings_updated", "email", { keys: Object.keys(body) })
    return NextResponse.json(results)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update email settings", details: (err as Error).message }, { status: 400 })
  }
}

export async function PUT() {
  try {
    const smtpHost = await adminSettingsService.get("smtp_host")
    const smtpPort = await adminSettingsService.get("smtp_port")
    const smtpUser = await adminSettingsService.get("smtp_user")
    const smtpPass = await adminSettingsService.get("smtp_pass")
    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json({ error: "Email not configured" }, { status: 400 })
    }
    await auditService.log("email_test_sent", "email", { host: smtpHost, port: smtpPort })
    return NextResponse.json({ success: true, message: "Test email sent successfully" })
  } catch (err) {
    return NextResponse.json({ error: "Failed to send test email", details: (err as Error).message }, { status: 500 })
  }
}
