import type { WriterInput } from "./prompts"
import { buildSystemPrompt, buildGenerationPrompt } from "./prompts"
import { generateContent, isGeminiAvailable } from "./providers"
import { parseArticle, type ParsedArticle } from "./parser"
import { formatArticleHTML, formatArticleMarkdown } from "./formatter"
import { analyzeSEO, type SEOResult } from "./seo"
import { analyzeReadability, type ReadabilityResult } from "./readability"

export interface EngineResult {
  success: boolean
  article: ParsedArticle | null
  html: string
  markdown: string
  seo: SEOResult | null
  readability: ReadabilityResult | null
  provider: string
  error?: string
}

export class AIWriterEngine {
  async generate(input: WriterInput, options?: { onChunk?: (text: string) => void; signal?: AbortSignal }): Promise<EngineResult> {
    try {
      if (options?.signal?.aborted) {
        return { success: false, article: null, html: "", markdown: "", seo: null, readability: null, provider: "none", error: "Generation cancelled" }
      }

      const systemPrompt = buildSystemPrompt(input)
      const genPrompt = buildGenerationPrompt(input)
      const fullPrompt = `${systemPrompt}\n\n${genPrompt}`

      const provider = isGeminiAvailable() ? "gemini" : "local"

      const providerOptions: Record<string, unknown> = {
        temperature: input.temperature,
        wordCount: input.wordCount,
      }

      if (options?.onChunk && provider === "gemini") {
        await this.streamGenerate(fullPrompt, providerOptions, options.onChunk, options.signal)
      }

      if (options?.signal?.aborted) {
        return { success: false, article: null, html: "", markdown: "", seo: null, readability: null, provider, error: "Generation cancelled" }
      }

      const result = await generateContent(fullPrompt, "ai-writer", providerOptions)

      if (options?.signal?.aborted) {
        return { success: false, article: null, html: "", markdown: "", seo: null, readability: null, provider, error: "Generation cancelled" }
      }

      if (!result.success) {
        return { success: false, article: null, html: "", markdown: "", seo: null, readability: null, provider: result.provider || provider, error: result.error || "Generation failed" }
      }

      const rawContent = result.content
      if (options?.onChunk) {
        options.onChunk(rawContent)
      }

      const article = parseArticle(rawContent)
      const html = formatArticleHTML(article)
      const markdown = formatArticleMarkdown(article)
      const seo = analyzeSEO(rawContent, input.primaryKeyword || "", (input.secondaryKeywords || "").split(",").map(s => s.trim()).filter(Boolean))
      const readability = analyzeReadability(rawContent)

      return {
        success: true,
        article,
        html,
        markdown,
        seo,
        readability,
        provider: result.provider || provider,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error during generation"
      return { success: false, article: null, html: "", markdown: "", seo: null, readability: null, provider: "error", error: message }
    }
  }

  private async streamGenerate(
    prompt: string,
    options: Record<string, unknown>,
    onChunk: (text: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const apiKey = typeof process !== "undefined" ? process.env.GEMINI_API_KEY : null
    if (!apiKey) return

    const model = (options.model as string) || "gemini-2.0-flash"
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: (options.temperature as number) ?? 0.7,
        maxOutputTokens: (options.maxTokens as number) ?? 8192,
      },
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
      })

      if (!response.ok) return
      if (!response.body) return

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
              if (text) onChunk(text)
            } catch {
              // skip malformed SSE data
            }
          }
        }
      }
    } catch {
      // streaming failed, non-critical
    }
  }
}

export const aiWriterEngine = new AIWriterEngine()
