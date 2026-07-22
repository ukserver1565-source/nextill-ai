import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getAdapter } from "@/lib/payments/providers"

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
    const role = ((profile as { role?: string } | null)?.role || "").toLowerCase()
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { provider } = body as { provider?: string }

    if (!provider || typeof provider !== "string") {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 })
    }

    // Look up payment provider credentials
    const { data: creds, error: credsErr } = await supabaseAdmin
      .from("payment_provider_credentials")
      .select("*")
      .eq("provider", provider)
      .single()

    if (credsErr || !creds) {
      return NextResponse.json({ error: `No credentials found for provider: ${provider}` }, { status: 404 })
    }

    // Get adapter
    const adapter = getAdapter(provider)
    if (!adapter) {
      return NextResponse.json({ error: `No adapter found for provider: ${provider}` }, { status: 400 })
    }

    // Test connection
    const now = new Date().toISOString()
    try {
      const result = await adapter.testConnection()

      if (result.success) {
        await supabaseAdmin
          .from("payment_provider_credentials")
          .update({
            is_verified: true,
            last_tested_at: now,
            last_test_result: "success",
            last_test_error: null,
          })
          .eq("id", creds.id)

        return NextResponse.json({ success: true, message: result.message })
      } else {
        await supabaseAdmin
          .from("payment_provider_credentials")
          .update({
            is_verified: false,
            last_tested_at: now,
            last_test_result: "error",
            last_test_error: result.message,
          })
          .eq("id", creds.id)

        return NextResponse.json({ success: false, message: result.message })
      }
    } catch (testErr) {
      const errMsg = (testErr as Error).message || "Unknown test error"

      await supabaseAdmin
        .from("payment_provider_credentials")
        .update({
          is_verified: false,
          last_tested_at: now,
          last_test_result: "error",
          last_test_error: errMsg,
        })
        .eq("id", creds.id)

      return NextResponse.json({ success: false, message: errMsg })
    }
  } catch (err) {
    console.error("Payment credentials test API error:", err)
    return NextResponse.json({ error: "Failed to test connection", details: (err as Error).message }, { status: 500 })
  }
}
