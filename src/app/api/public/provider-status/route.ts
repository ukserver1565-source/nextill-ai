import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const { data: providers } = await supabaseAdmin
      .from("ai_providers")
      .select("slug, name, enabled, status")

    const { data: apiKeys } = await supabaseAdmin
      .from("ai_api_keys")
      .select("provider_slug, is_enabled")
      .eq("is_enabled", true)

    const connectedProviders = new Set(
      (apiKeys || []).map((k: any) => k.provider_slug)
    )

    const result = (providers || []).map((p: any) => ({
      slug: p.slug,
      name: p.name,
      enabled: p.enabled,
      connected: connectedProviders.has(p.slug),
      status: p.status || (connectedProviders.has(p.slug) ? "active" : "inactive"),
    }))

    return NextResponse.json(result)
  } catch {
    return NextResponse.json([])
  }
}
