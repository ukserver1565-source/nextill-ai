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
      return new Response(
        encoder.encode(JSON.stringify({ error: "Primary keyword is required" })),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Authenticate user
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        encoder.encode(JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" })),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
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
      return new Response(
        encoder.encode(JSON.stringify({
          error: "Insufficient credits",
          code: "INSUFFICIENT_CREDITS",
          creditsRequired: creditsCost,
          creditsAvailable: balance,
        })),
        { status: 402, headers: { "Content-Type": "application/json" } }
      )
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

    const stream = new ReadableStream({
      async start(controller) {
        for (let i = 0; i < steps.length; i++) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ step: steps[i], status: "running", progress: i + 1, total: steps.length })}\n\n`
            )
          )
          if (i === 0) {
            runPostGenerator(input)
              .then(async (result) => {
                // Deduct credits after successful generation
                const { error: deductErr } = await supabaseAdmin
                  .rpc("deduct_credits", { p_user_id: user.id, p_amount: creditsCost })

                if (!deductErr) {
                  // Log credit usage
                  try {
                    await supabaseAdmin.from("credit_logs").insert({
                      user_id: user.id,
                      amount: creditsCost,
                      type: "used",
                      reason: "post-generator usage",
                    })
                  } catch { /* best-effort logging */ }

                  // Log usage
                  try {
                    await supabaseAdmin.from("usage_logs").insert({
                      user_id: user.id,
                      tool_slug: "post-generator",
                      credits_used: creditsCost,
                      input_chars: JSON.stringify(input).length,
                      output_chars: JSON.stringify(result || {}).length,
                    })
                  } catch { /* best-effort logging */ }
                }

                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ step: "complete", status: "completed", data: result, creditsUsed: creditsCost })}\n\n`
                  )
                )
                controller.close()
              })
              .catch((err) => {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ step: "error", status: "failed", error: err.message })}\n\n`
                  )
                )
                controller.close()
              })
          }
          await new Promise((r) => setTimeout(r, 500))
        }
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
    return new Response(
      encoder.encode(JSON.stringify({ error: "Stream failed", details: (err as Error).message })),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
