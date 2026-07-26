import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { safeQuery } from "@/lib/supabase/safe-query"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { adminSettingsService } from "@/lib/services/admin/settings.service"
import { promptsService } from "@/lib/services/admin/prompts.service"
import { providersService } from "@/lib/services/admin/providers.service"

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).single()
  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { user }
}

export async function GET() {
  try {
    const { data } = await safeQuery(() =>
      supabaseAdmin
        .from("backup_exports")
        .select("id, type, status, file_url, size_bytes, created_by, created_at")
        .order("created_at", { ascending: false })
        .limit(50)
    )
    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch backups", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST() {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    // Insert pending backup record
    const { data: backup, error: insertErr } = await supabaseAdmin
      .from("backup_exports")
      .insert({
        type: "full",
        status: "pending",
        created_by: auth.user.id,
      })
      .select()
      .single()
    if (insertErr) throw new Error(insertErr.message)

    try {
      // Gather data from key tables
      const [settings, prompts, providers] = await Promise.all([
        adminSettingsService.getAll().catch(() => ({})),
        promptsService.list().catch(() => []),
        providersService.list().catch(() => []),
      ])

      const exportData = {
        version: "1.0",
        exported_at: new Date().toISOString(),
        settings,
        prompts,
        providers,
      }

      const jsonStr = JSON.stringify(exportData, null, 2)
      const sizeBytes = Buffer.byteLength(jsonStr, "utf-8")

      // Update with completed status + data + size
      const { error: updateErr } = await supabaseAdmin
        .from("backup_exports")
        .update({
          status: "completed",
          data: exportData,
          size_bytes: sizeBytes,
        })
        .eq("id", backup.id)
      if (updateErr) throw new Error(updateErr.message)

      return NextResponse.json(
        { ...backup, status: "completed", size_bytes: sizeBytes },
        { status: 201 }
      )
    } catch (innerErr) {
      // Mark backup as failed
      await supabaseAdmin
        .from("backup_exports")
        .update({ status: "failed" })
        .eq("id", backup.id)
      throw innerErr
    }
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create backup", details: (err as Error).message },
      { status: 500 }
    )
  }
}
