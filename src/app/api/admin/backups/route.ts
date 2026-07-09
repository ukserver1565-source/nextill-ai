import { NextRequest, NextResponse } from "next/server"
import { auditService } from "@/lib/services/admin/audit.service"
import { adminSettingsService } from "@/lib/services/admin/settings.service"
import { promptsService } from "@/lib/services/admin/prompts.service"

export async function GET() {
  try {
    const settings = await adminSettingsService.getAll()
    const prompts = await promptsService.list()
    return NextResponse.json({ settings, prompts })
  } catch (err) {
    return NextResponse.json({ error: "Failed to list backups", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST() {
  try {
    const settings = await adminSettingsService.getAll()
    const prompts = await promptsService.list()
    const backup = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      settings,
      prompts,
    }
    await auditService.log("backup_created", { id: backup.id, prompt_count: prompts.length })
    return NextResponse.json(backup)
  } catch (err) {
    return NextResponse.json({ error: "Failed to create backup", details: (err as Error).message }, { status: 500 })
  }
}
