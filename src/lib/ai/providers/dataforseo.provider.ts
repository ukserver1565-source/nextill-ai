import type { AIProvider, AIProviderResult } from "./index"
import { getApiKey } from "./index"

export const dataforseoProvider: AIProvider = {
  name: "DataForSEO",
  slug: "dataforseo",
  get enabled() {
    return !!(getApiKey("DATAFORSEO_LOGIN") && getApiKey("DATAFORSEO_PASSWORD"))
  },

  async generate(_prompt: string, _options?: Record<string, unknown>): Promise<AIProviderResult> {
    const login = getApiKey("DATAFORSEO_LOGIN")
    if (!login) {
      return { success: false, content: "", error: "DataForSEO credentials not configured" }
    }
    return { success: false, content: "", error: "DataForSEO provider not yet implemented" }
  },
}
