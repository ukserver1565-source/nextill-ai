import { NextRequest, NextResponse } from "next/server"
import { runPostGenerator } from "@/lib/workflows"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// In-memory job store (survives within same serverless instance)
// For cross-instance: use DB or Redis
const jobs = new Map<string, {
  status: "pending" | "running" | "completed" | "failed"
  result: any
  error: string | null
  createdAt: number
}>()

const encoder = new TextEncoder()

function getCreditCost(wordCount: number): number {
  if (wordCount <= 1000) return 5
  if (wordCount <= 2000) return 8
  if (wordCount <= 3000) return 12
  if (wordCount <= 4000) return 16
  return 20
}

// POST — Start generation (returns immediately with job ID)
export async function POST(req: NextRequest) {
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

    // Create job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    jobs.set(jobId, { status: "running", result: null, error: null, createdAt: Date.now() })

    // Run generation in background (fire and forget — no timeout!)
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

        // Save result to job
        const job = jobs.get(jobId)
        if (job) {
          job.status = "completed"
          job.result = result
        }

        // Also save to DB for persistence
        try {
          await supabaseAdmin.from("generated_posts").insert({
            user_id: user.id,
            primary_keyword: primaryKeyword,
            article_type: input.articleType,
            word_count: input.wordCount,
            language: input.language,
            country: input.country,
            tone: input.tone,
            audience: input.audience,
            seo_title: result.seoTitle,
            meta_description: result.metaDescription,
            slug: result.slug,
            content: result.content,
            html_content: result.htmlContent,
            markdown_content: result.markdownContent,
          })
        } catch { /* non-critical */ }
      })
      .catch((err) => {
        const job = jobs.get(jobId)
        if (job) {
          job.status = "failed"
          job.error = (err as Error).message || "Generation failed"
        }
      })

    // Return job ID immediately (no timeout!)
    return NextResponse.json({
      jobId,
      status: "running",
      message: "Generation started. Poll /status for result.",
      creditsRequired: creditsCost,
    })
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to start generation", details: (err as Error).message },
      { status: 500 }
    )
  }
}

// GET — Poll job status (returns result when ready)
export async function GET(req: NextRequest) {
  try {
    const jobId = req.nextUrl.searchParams.get("jobId")
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 })
    }

    const job = jobs.get(jobId)
    if (!job) {
      return NextResponse.json({ error: "Job not found", status: "not_found" }, { status: 404 })
    }

    // Clean up old jobs (older than 1 hour)
    const now = Date.now()
    for (const [key, val] of jobs.entries()) {
      if (now - val.createdAt > 3600000) jobs.delete(key)
    }

    if (job.status === "completed") {
      // Clean up job after returning result
      const result = job.result
      jobs.delete(jobId)
      return NextResponse.json({
        status: "completed",
        data: result,
      })
    }

    if (job.status === "failed") {
      const error = job.error
      jobs.delete(jobId)
      return NextResponse.json({
        status: "failed",
        error: error,
      })
    }

    // Still running
    return NextResponse.json({
      status: job.status,
      message: "Still generating... Please wait.",
    })
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to check status", details: (err as Error).message },
      { status: 500 }
    )
  }
}
