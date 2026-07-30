import { NextResponse } from "next/server"
import { runPostGenerator } from "@/lib/workflows"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

const steps = [
  "keyword_analysis",
  "seo_outline",
  "ai_writer",
  "humanizer",
  "rewriter",
  "grammar_check",
  "ai_detector",
  "plagiarism_check",
  "seo_title",
  "meta_description",
  "faq",
  "schema",
  "internal_links",
  "readability",
  "final_optimization",
]

const encoder = new TextEncoder()

function getCreditCost(wordCount: number): number {
  if (wordCount <= 1000) return 5
  if (wordCount <= 2000) return 8
  if (wordCount <= 3000) return 12
  if (wordCount <= 4000) return 16
  return 20
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { primaryKeyword, articleType, wordCount, language, country, tone, audience } = body
    if (!primaryKeyword) {
      return NextResponse.json({ error: "Primary keyword is required" }, { status: 400 })
    }

    // Authenticate user
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }

    // Check credits
    const creditsCost = getCreditCost(wordCount || 1500)
    const { data: profile } = await supabaseAdmin
      .from("credits")
      .select("balance")
      .eq("user_id", user.id)
      .single()

    const balance = (profile as { balance: number } | null)?.balance ?? 0
    if (balance < creditsCost) {
      return NextResponse.json({
        error: "Insufficient credits",
        code: "INSUFFICIENT_CREDITS",
        creditsRequired: creditsCost,
        creditsAvailable: balance,
      }, { status: 402 })
    }

    const input = {
      primaryKeyword,
      articleType: articleType || "blog-post",
      wordCount: wordCount || 1500,
      language: language || "en",
      country: country || "us",
      tone: tone || "professional",
      audience: audience || "general",
    }

    // Keep a reference so the loop can signal completion
    let resolveResult: ((value: any) => void) | null = null
    let rejectResult: ((err: any) => void) | null = null
    const resultPromise = new Promise((resolve, reject) => {
      resolveResult = resolve
      rejectResult = reject
    })

    // Start generation in background
    runPostGenerator(input)
      .then(async (result) => {
        // Deduct credits
        const { error: deductErr } = await supabaseAdmin
          .rpc("deduct_credits", { p_user_id: user.id, p_amount: creditsCost })

        if (!deductErr) {
          try {
            await supabaseAdmin.from("credit_logs").insert({
              user_id: user.id,
              amount: creditsCost,
              type: "used",
              reason: "post-generator usage",
            })
          } catch { /* best-effort */ }

          try {
            await supabaseAdmin.from("usage_logs").insert({
              user_id: user.id,
              tool_slug: "post-generator",
              credits_used: creditsCost,
              input_chars: JSON.stringify(input).length,
              output_chars: JSON.stringify(result || {}).length,
            })
          } catch { /* best-effort */ }
        }

        resolveResult!(result)
      })
      .catch((err) => {
        rejectResult!(err)
      })

    const stream = new ReadableStream({
      async start(controller) {
        // Send initial "starting" event
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ step: steps[0], status: "running", progress: 1, total: steps.length })}\n\n`
          )
        )

        // WAIT for the actual result (stream stays open while pipeline runs)
        try {
          const result = await resultPromise

          // Send all steps as completed (the pipeline ran them all)
          for (let i = 0; i < steps.length; i++) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ step: steps[i], status: "completed", progress: i + 1, total: steps.length })}\n\n`
              )
            )
          }

          // Send final result
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ step: "complete", status: "completed", data: result, creditsUsed: creditsCost })}\n\n`
            )
          )
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ step: "error", status: "failed", error: (err as Error).message })}\n\n`
            )
          )
        }

        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: "Stream failed", details: (err as Error).message },
      { status: 500 }
    )
  }
}
