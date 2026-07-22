import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

/** Shared admin auth check — returns null on success or NextResponse on failure */
async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle()
  const role = ((profile as { role?: string } | null)?.role || "").toLowerCase()
  if (role !== "admin" && role !== "super_admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { error: null, user }
}

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    const { data: credentials, error } = await supabaseAdmin
      .from("payment_provider_credentials")
      .select("id, provider, merchant_id, is_verified, last_tested_at, last_test_result, last_test_error")
      .order("provider")

    if (error) {
      console.error("Fetch payment credentials error:", error)
      return NextResponse.json({ error: "Failed to fetch credentials", details: error.message }, { status: 500 })
    }

    return NextResponse.json(credentials || [])
  } catch (err) {
    console.error("Payment credentials GET API error:", err)
    return NextResponse.json({ error: "Failed to fetch credentials", details: (err as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    const body = await req.json()
    const { provider, api_key, api_secret, merchant_id } = body as {
      provider?: string
      api_key?: string
      api_secret?: string
      merchant_id?: string
    }

    if (!provider || typeof provider !== "string") {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 })
    }

    // Build update payload — only include non-undefined fields
    const updates: Record<string, unknown> = {}
    if (api_key !== undefined) updates.api_key_encrypted = api_key
    if (api_secret !== undefined) updates.api_secret_encrypted = api_secret
    if (merchant_id !== undefined) updates.merchant_id = merchant_id
    updates.updated_at = new Date().toISOString()

    // IMPORTANT: Do NOT set is_verified here — only testConnection does that

    const { data: updated, error } = await supabaseAdmin
      .from("payment_provider_credentials")
      .update(updates)
      .eq("provider", provider)
      .select("id, provider, merchant_id, is_verified, last_tested_at, last_test_result, last_test_error")
      .single()

    if (error) {
      console.error("Update payment credentials error:", error)
      return NextResponse.json({ error: "Failed to update credentials", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, credential: updated })
  } catch (err) {
    console.error("Payment credentials PATCH API error:", err)
    return NextResponse.json({ error: "Failed to update credentials", details: (err as Error).message }, { status: 500 })
  }
}
