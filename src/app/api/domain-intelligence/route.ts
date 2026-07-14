import { NextRequest, NextResponse } from "next/server"
import { normalizeDomainInput } from "@/lib/domain-intelligence/domain-normalizer"
import { domainIntelligenceService } from "@/lib/domain-intelligence/domain-intelligence.service"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { domain, mode, country, language, device, date, currency } = body

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // Normalize and validate domain (blocks SSRF)
    const input = normalizeDomainInput(domain, { mode, country, language, device, date, currency })

    // Run analysis
    const result = await domainIntelligenceService.analyze(input)

    return NextResponse.json({
      success: true,
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

export async function GET(request: NextRequest) {
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
