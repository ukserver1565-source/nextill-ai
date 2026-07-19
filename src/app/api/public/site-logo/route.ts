import { NextResponse } from "next/server"
import { getAdminOrNull } from "@/lib/supabase/admin"

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

    return NextResponse.json({ logo_url: data?.value || null })
  } catch {
    return NextResponse.json({ logo_url: null })
  }
}
