import type { AIProvider, AIProviderResult } from "./index"
import { getApiKey } from "./index"

export const openaiProvider: AIProvider = {
  name: "OpenAI",
  slug: "openai",
  get enabled() {
    return !!getApiKey("OPENAI_API_KEY")
  },

  async generate(_prompt: string, _options?: Record<string, unknown>): Promise<AIProviderResult> {
    const apiKey = getApiKey("OPENAI_API_KEY")
    if (!apiKey) {
      return { success: false, content: "", error: "OpenAI API key not configured" }
    }
    return { success: false, content: "", error: "OpenAI provider not yet implemented" }
  },
}
