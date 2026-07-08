import type { AIProvider, AIProviderResult } from "./index"
import { getApiKey } from "./index"

export const pagespeedProvider: AIProvider = {
  name: "PageSpeed",
  slug: "pagespeed",
  get enabled() {
    return !!getApiKey("PAGESPEED_API_KEY")
  },

  async generate(_prompt: string, _options?: Record<string, unknown>): Promise<AIProviderResult> {
    const apiKey = getApiKey("PAGESPEED_API_KEY")
    if (!apiKey) {
      return { success: false, content: "", error: "PageSpeed API key not configured" }
    }
    return { success: false, content: "", error: "PageSpeed provider not yet implemented" }
  },
}
