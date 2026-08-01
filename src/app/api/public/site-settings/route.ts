import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { unwrapSetting } from "@/lib/utils/site-settings"

// Public endpoint — returns ONLY safe, non-sensitive site settings
export async function GET() {
  try {
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("key, value")
      .in("key", ["social_links", "site_name", "description", "logo_url", "site_logo_url", "maintenance_mode", "maintenance_message"])

    const settings: Record<string, unknown> = {}
    for (const row of data || []) {
      settings[row.key] = unwrapSetting(row.value)
    }

    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({})
  }
}
