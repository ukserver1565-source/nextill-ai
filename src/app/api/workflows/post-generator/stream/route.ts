import { runPostGenerator } from "@/lib/workflows"

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
              .then((result) => {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ step: "complete", status: "completed", data: result })}\n\n`
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
