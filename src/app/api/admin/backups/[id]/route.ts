import { NextRequest, NextResponse } from "next/server"
import { adminSettingsService } from "@/lib/services/admin/settings.service"
import { promptsService } from "@/lib/services/admin/prompts.service"
import { auditService } from "@/lib/services/admin/audit.service"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const settings = await adminSettingsService.getAll()
    const prompts = await promptsService.list()
    return NextResponse.json({ id, settings, prompts })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch backup", details: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await auditService.log("backup_deleted", "backups", { id })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete backup", details: (err as Error).message }, { status: 500 })
  }
}
