import { NextResponse } from "next/server"
import { getAdminOrNull } from "@/lib/supabase/admin"
import { unwrapSetting } from "@/lib/utils/site-settings"

export async function GET() {
  try {
    const supabase = getAdminOrNull()
    if (!supabase) {
      return NextResponse.json({ logo_url: null })
    }

    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_logo_url")
      .single()

    return NextResponse.json({ logo_url: unwrapSetting(data?.value) || null })
  } catch {
    return NextResponse.json({ logo_url: null })
  }
}
