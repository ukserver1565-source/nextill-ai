import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { auditService } from "@/lib/services/admin/audit.service"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("integration_settings")
      .select("*")
      .order("provider_name", { ascending: true })

    if (error) throw new Error(error.message)

    const integrations = (data || []).map((i: any) => ({
      id: i.provider_slug,
      name: i.provider_name,
      enabled: i.is_enabled,
      type: i.config?.type || "integration",
      is_connected: i.is_connected || false,
    }))

    return NextResponse.json(integrations)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch integrations", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, enabled, config } = await req.json()

    const { error: upsertError } = await supabaseAdmin
      .from("integration_settings")
      .upsert(
        { provider_slug: id, provider_name: id, is_enabled: enabled, ...(config ? { config } : {}) },
        { onConflict: "provider_slug" }
      )

    if (upsertError) throw new Error(upsertError.message)
    await auditService.log("integration_updated", "integrations", { id, enabled })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to update integration", details: (err as Error).message }, { status: 400 })
  }
}
