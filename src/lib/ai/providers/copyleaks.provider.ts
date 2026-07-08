import type { AIProvider, AIProviderResult } from "./index"
import { getApiKey } from "./index"

export const copyleaksProvider: AIProvider = {
  name: "Copyleaks",
  slug: "copyleaks",
  get enabled() {
    return !!getApiKey("COPYLEAKS_API_KEY")
  },

  async generate(_prompt: string, _options?: Record<string, unknown>): Promise<AIProviderResult> {
    const apiKey = getApiKey("COPYLEAKS_API_KEY")
    if (!apiKey) {
      return { success: false, content: "", error: "Copyleaks API key not configured" }
    }
    return { success: false, content: "", error: "Copyleaks provider not yet implemented" }
  },
}
