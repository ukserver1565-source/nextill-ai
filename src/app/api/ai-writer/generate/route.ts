import { NextResponse } from "next/server"
import { AIWriterEngine } from "@/lib/ai/engine"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { z } from "zod"

const generateSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  primaryKeyword: z.string().default(""),
  secondaryKeywords: z.string().default(""),
  language: z.string().default("English"),
  country: z.string().default("US"),
  audience: z.string().default("General audience"),
  writingStyle: z.string().default("Professional"),
  tone: z.string().default("Informative"),
  wordCount: z.number().min(100).max(10000).default(800),
  articleType: z.string().default("seo-blog"),
  creativity: z.number().min(1).max(10).default(5),
  temperature: z.number().min(0).max(2).default(0.7),
  brandVoice: z.string().default(""),
  pointOfView: z.string().default("third"),
  faqCount: z.number().min(0).max(20).default(3),
  includeTables: z.boolean().default(true),
  includeLists: z.boolean().default(true),
  includeStatistics: z.boolean().default(true),
  includeInternalLinks: z.boolean().default(true),
  includeExternalLinks: z.boolean().default(true),
})

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json()
    const parsed = generateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.issues }, { status: 400 })
    }

    const input = parsed.data

    const engine = new AIWriterEngine()
    const result = await engine.generate(input)

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Generation failed" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      article: result.article,
      html: result.html,
      markdown: result.markdown,
      seo: result.seo,
      readability: result.readability,
      provider: result.provider,
      generatedAt: new Date().toISOString(),
      user: user ? { id: user.id } : null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
