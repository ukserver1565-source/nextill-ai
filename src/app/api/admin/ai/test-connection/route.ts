import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createServerClient } from "@supabase/ssr"

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll() {},
        },
      }
    )
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("user_id", user.id).maybeSingle()
    const role = ((profile as { role?: string } | null)?.role || "").toLowerCase()
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { provider_slug, api_key_id } = body

    if (!provider_slug) {
      return NextResponse.json({ error: "provider_slug is required" }, { status: 400 })
    }

    // Get the API key — either by key ID or by provider slug
    let apiKey: string | null = null
    if (api_key_id) {
      const { data: keyRow } = await supabaseAdmin
        .from("ai_api_keys")
        .select("key_encrypted")
        .eq("id", api_key_id)
        .single()
      apiKey = keyRow?.key_encrypted || null
    } else {
      // Get the first enabled key for this provider
      const { data: keyRow } = await supabaseAdmin
        .from("ai_api_keys")
        .select("key_encrypted")
        .eq("provider_slug", provider_slug)
        .eq("is_enabled", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      apiKey = keyRow?.key_encrypted || null
    }

    if (!apiKey && provider_slug !== "ollama") {
      return NextResponse.json({ success: false, message: "No API key found for this provider", latency_ms: 0 })
    }

    // Get provider base URL
    const { data: provider } = await supabaseAdmin
      .from("ai_providers")
      .select("base_url, slug")
      .eq("slug", provider_slug)
      .maybeSingle()

    const baseUrl = (provider?.base_url || "").replace(/\/+$/, "")
    const start = Date.now()

    // Make a REAL test call to the provider
    let result: { success: boolean; message: string; latency_ms: number }

    try {
      switch (provider_slug) {
        case "openai": {
          const res = await fetch(`${baseUrl}/models`, {
            headers: { Authorization: `Bearer ${apiKey}` },
            signal: AbortSignal.timeout(15000),
          })
          result = {
            success: res.ok,
            message: res.ok ? `Connected successfully (${res.status})` : `API returned ${res.status}: ${await res.text().catch(() => "Unknown error")}`,
            latency_ms: Date.now() - start,
          }
          break
        }
        case "gemini": {
          const res = await fetch(`${baseUrl}/models?key=${apiKey}`, {
            signal: AbortSignal.timeout(15000),
          })
          result = {
            success: res.ok,
            message: res.ok ? `Connected successfully (${res.status})` : `API returned ${res.status}`,
            latency_ms: Date.now() - start,
          }
          break
        }
        case "claude": {
          const res = await fetch(`${baseUrl}/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey!,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 1,
              messages: [{ role: "user", content: "hi" }],
            }),
            signal: AbortSignal.timeout(15000),
          })
          const status = res.status
          result = {
            success: status >= 200 && status < 300,
            message: status >= 200 && status < 300
              ? `Connected successfully (${status})`
              : `API returned ${status}: ${await res.text().catch(() => "Unknown error").then(t => t.slice(0, 200))}`,
            latency_ms: Date.now() - start,
          }
          break
        }
        case "deepseek": {
          const res = await fetch(`${baseUrl}/models`, {
            headers: { Authorization: `Bearer ${apiKey}` },
            signal: AbortSignal.timeout(15000),
          })
          result = {
            success: res.ok,
            message: res.ok ? `Connected successfully (${res.status})` : `API returned ${res.status}`,
            latency_ms: Date.now() - start,
          }
          break
        }
        case "ollama": {
          const res = await fetch(`${baseUrl}/api/tags`, {
            signal: AbortSignal.timeout(10000),
          })
          result = {
            success: res.ok,
            message: res.ok ? `Connected successfully (${res.status})` : `Ollama returned ${res.status}`,
            latency_ms: Date.now() - start,
          }
          break
        }
        default: {
          // Generic test: try to list models with Bearer auth
          const res = await fetch(`${baseUrl}/models`, {
            headers: { Authorization: `Bearer ${apiKey}` },
            signal: AbortSignal.timeout(15000),
          })
          result = {
            success: res.ok,
            message: res.ok ? `Connected successfully (${res.status})` : `API returned ${res.status}`,
            latency_ms: Date.now() - start,
          }
        }
      }
    } catch (fetchErr) {
      result = {
        success: false,
        message: `Connection failed: ${fetchErr instanceof Error ? fetchErr.message : "Unknown error"}`,
        latency_ms: Date.now() - start,
      }
    }

    // Store the test result on the workflow_settings for this provider's tools
    try {
      await supabaseAdmin
        .from("ai_api_keys")
        .update({
          last_used_at: new Date().toISOString(),
        })
        .eq("provider_slug", provider_slug)
    } catch { /* non-critical */ }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      latency_ms: result.latency_ms,
      tested_at: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: `Test failed: ${(err as Error).message}`,
      latency_ms: 0,
      tested_at: new Date().toISOString(),
    }, { status: 500 })
  }
}
