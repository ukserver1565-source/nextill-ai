import { NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { toolRunnerService } from "@/lib/services/tool-runner.service"
import { toolRunSchema } from "@/lib/validations/tool-run.schema"
import { guestUsageRepo } from "@/lib/repositories/guest-usage.repository"
import { usageRepo } from "@/lib/repositories/usage.repository"

const SUPPORTED_TOOLS = [
  "ai-writer", "ai-humanizer", "ai-detector", "plagiarism-checker",
  "seo-title-generator", "meta-description-generator", "keyword-research",
  "website-audit", "rank-tracker", "backlink-checker",
  "schema-generator", "sitemap-generator", "robots-txt-generator",
  "internal-link-generator", "content-brief", "topical-map",
  "faq-generator", "article-rewriter", "grammar-checker",
  "summarizer", "translator",
] as const

async function tryDb<T>(fn: () => T): Promise<{ ok: true; data: Awaited<T> } | { ok: false; error: unknown }> {
  try {
    const data = await fn()
    return { ok: true, data: data as Awaited<T> }
  } catch (error) {
    return { ok: false, error }
  }
}

export async function handleToolApi(req: Request, toolSlug: string) {
  try {
    if (!SUPPORTED_TOOLS.includes(toolSlug as typeof SUPPORTED_TOOLS[number])) {
      return NextResponse.json({ error: `Unknown tool: ${toolSlug}` }, { status: 404 })
    }

    const body = await req.json()
    const parsed = toolRunSchema.parse({ ...body, tool: toolSlug })
    const input = parsed.input
    const settings = parsed.settings || {}

    // Load tool config from DB — fall back to defaults if missing
    let localEngine = false
    const configResult = await tryDb(() =>
      supabaseAdmin.from("tool_settings").select("*").eq("tool_slug", toolSlug).single()
    )
    let toolConfig: Record<string, unknown>
    if (!configResult.ok || !configResult.data.data) {
      localEngine = true
      toolConfig = {
        is_enabled: true,
        credits_cost: 0,
        guest_daily_limit: 3,
        usage_count: 0,
        tool_name: toolSlug,
      }
    } else {
      toolConfig = configResult.data.data as Record<string, unknown>
    }

    if (!toolConfig.is_enabled) {
      return NextResponse.json({ error: `${toolConfig.tool_name || toolSlug} is currently disabled` }, { status: 403 })
    }

    const creditsCost = (toolConfig.credits_cost as number) ?? 0

    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? null
    const guestId = !userId ? (req.headers.get("x-guest-id") || crypto.randomUUID()) : null

    // Guest limit check (best-effort)
    if (!userId) {
      const guestLimit = (toolConfig.guest_daily_limit as number) ?? 3
      let overLimit = false
      try {
        const dailyCount = await guestUsageRepo.getDailyCount(guestId!, toolSlug)
        if (dailyCount >= guestLimit) overLimit = true
      } catch {
        // guest_usage tracking may fail if table/columns don't exist
      }
      if (overLimit) {
        return NextResponse.json({
          error: "Daily guest limit reached. Please sign up to continue.",
          code: "GUEST_LIMIT_REACHED",
          limit: guestLimit,
        }, { status: 429 })
      }
    } else if (creditsCost > 0) {
      // Credit check (best-effort)
      const profileResult = await tryDb(() =>
        supabaseAdmin.from("profiles").select("credits").eq("user_id", userId).single()
      )
      if (profileResult.ok && profileResult.data.data) {
        const profile = profileResult.data.data as { credits: number }
        if (profile.credits < creditsCost) {
          return NextResponse.json({
            error: "Insufficient credits",
            code: "INSUFFICIENT_CREDITS",
            creditsRequired: creditsCost,
            creditsAvailable: profile.credits,
          }, { status: 402 })
        }
      }
    }

    const result = await toolRunnerService.run(toolSlug, input, settings)

    // Usage logging (best-effort)
    const inputChars = JSON.stringify(input).length
    const outputChars = typeof result.content === "string" ? result.content.length : JSON.stringify(result.content).length
    try {
      await usageRepo.log({
        userId,
        guestId,
        toolSlug,
        creditsUsed: userId ? creditsCost : 0,
        inputChars,
        outputChars,
      })
    } catch {
      // usage_logs table may not exist yet
    }

    // Credit deduction + document save (best-effort for logged-in users)
    if (userId && result.success) {
      // Deduct credits via RPC
      await tryDb(() =>
        supabaseAdmin.rpc("deduct_credits", { p_user_id: userId, p_amount: creditsCost })
      )

      // Log credit usage
      await tryDb(() =>
        supabaseAdmin.from("credit_logs").insert({
          user_id: userId,
          amount: creditsCost,
          type: "used",
          reason: `${toolSlug} usage`,
        })
      )

      // Save document
      const topic = (input.topic || input.text || input.seed || input.url || input.domain || toolSlug) as string
      const contentStr = typeof result.content === "string" ? result.content : JSON.stringify(result.content, null, 2)
      await tryDb(() =>
        supabaseAdmin.from("documents").insert({
          user_id: userId,
          title: String(topic).substring(0, 100),
          content: contentStr,
          tool_slug: toolSlug,
          word_count: result.wordCount,
        })
      )
    } else if (!userId && result.success) {
      try {
        await guestUsageRepo.log({ guestId: guestId!, toolSlug })
      } catch {
        // guest_usage tracking may fail if table/columns don't exist
      }
    }

    // Increment usage count (best-effort)
    await tryDb(() =>
      supabaseAdmin.from("tool_settings")
        .update({ usage_count: ((toolConfig.usage_count as number) ?? 0) + 1 })
        .eq("tool_slug", toolSlug)
    )

    return NextResponse.json({
      success: result.success,
      type: result.type,
      content: result.content,
      wordCount: result.wordCount,
      creditsUsed: userId ? creditsCost : 0,
      saved: false,
      localEngine,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.issues }, { status: 400 })
    }
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }
    console.error(`[${toolSlug}] API error:`, err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
