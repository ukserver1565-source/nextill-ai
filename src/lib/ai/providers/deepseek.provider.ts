import type { AIProvider, AIProviderResult } from "./index"
import { getApiKey } from "./index"

export const deepseekProvider: AIProvider = {
  name: "DeepSeek",
  slug: "deepseek",
  get enabled() {
    return !!getApiKey("DEEPSEEK_API_KEY")
  },

  async generate(_prompt: string, _options?: Record<string, unknown>): Promise<AIProviderResult> {
    const apiKey = getApiKey("DEEPSEEK_API_KEY")
    if (!apiKey) {
      return { success: false, content: "", error: "DeepSeek API key not configured" }
    }
    return { success: false, content: "", error: "DeepSeek provider not yet implemented" }
  },
}
