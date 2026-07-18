import { NextRequest, NextResponse } from "next/server"
import { normalizeDomainInput } from "@/lib/domain-intelligence/domain-normalizer"
import { domainIntelligenceService } from "@/lib/domain-intelligence/domain-intelligence.service"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

const CREDITS_COST = 2

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }

    // Check credits
    const { data: profile } = await supabaseAdmin
      .from("credits")
      .select("balance")
      .eq("user_id", user.id)
      .single()

    const balance = (profile as { balance: number } | null)?.balance ?? 0
    if (balance < CREDITS_COST) {
      return NextResponse.json({
        error: "Insufficient credits",
        code: "INSUFFICIENT_CREDITS",
        creditsRequired: CREDITS_COST,
        creditsAvailable: balance,
      }, { status: 402 })
    }

    const body = await request.json()
    const { domain, mode, country, language, device, date, currency } = body

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // Normalize and validate domain (blocks SSRF)
    const input = normalizeDomainInput(domain, { mode, country, language, device, date, currency })

    // Run analysis
    const result = await domainIntelligenceService.analyze(input)

    // Deduct credits after successful analysis
    const { error: deductErr } = await supabaseAdmin
      .rpc("deduct_credits", { p_user_id: user.id, p_amount: CREDITS_COST })

    if (!deductErr) {
      // Log credit usage
      try {
        await supabaseAdmin.from("credit_logs").insert({
          user_id: user.id,
          amount: CREDITS_COST,
          type: "used",
          reason: "domain-intelligence analysis",
        })
      } catch { /* best-effort logging */ }

      // Log usage
      try {
        await supabaseAdmin.from("usage_logs").insert({
          user_id: user.id,
          tool_slug: "domain-intelligence",
          credits_used: CREDITS_COST,
          input_chars: JSON.stringify(body).length,
          output_chars: JSON.stringify(result).length,
        })
      } catch { /* best-effort logging */ }
    }

    return NextResponse.json({
      success: true,
      creditsUsed: CREDITS_COST,
      input: {
        raw: input.raw,
        normalized: input.normalized,
        rootDomain: input.rootDomain,
        mode: input.mode,
        country: input.country,
        device: input.device,
      },
      ...result,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Analysis failed"
    if (msg.includes("Invalid domain") || msg.includes("Blocked")) {
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    console.error("[Domain Intelligence]", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reports = await domainIntelligenceService.listSavedReports(user.id)
    return NextResponse.json({ success: true, reports })
  } catch (e) {
    console.error("[Domain Intelligence] list", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
