import type { AIProvider, AIProviderResult } from "./index"
import { getApiKey } from "./index"

export const geminiProvider: AIProvider = {
  name: "Gemini",
  slug: "gemini",
  get enabled() {
    return !!getApiKey("GEMINI_API_KEY")
  },

  async generate(prompt: string, options?: Record<string, unknown>): Promise<AIProviderResult> {
    const apiKey = getApiKey("GEMINI_API_KEY")
    if (!apiKey) {
      return { success: false, content: "", error: "Gemini API key not configured" }
    }

    try {
      const model = (options?.model as string) || "gemini-2.0-flash"
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

      const body: Record<string, unknown> = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: (options?.temperature as number) ?? 0.7,
          maxOutputTokens: (options?.maxTokens as number) ?? 4096,
        },
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errText = await res.text()
        return { success: false, content: "", error: `Gemini API error (${res.status}): ${errText}` }
      }

      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
      return { success: true, content: text }
    } catch (err) {
      return { success: false, content: "", error: `Gemini request failed: ${err instanceof Error ? err.message : String(err)}` }
    }
  },
}
