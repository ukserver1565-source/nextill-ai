import type { AIProvider, AIProviderResult } from "./index"
import { geminiProvider } from "./gemini.provider"
import { openaiProvider } from "./openai.provider"
import { deepseekProvider } from "./deepseek.provider"
import { copyleaksProvider } from "./copyleaks.provider"
import { dataforseoProvider } from "./dataforseo.provider"
import { pagespeedProvider } from "./pagespeed.provider"

export const providers: Record<string, AIProvider> = {
  gemini: geminiProvider,
  openai: openaiProvider,
  deepseek: deepseekProvider,
  copyleaks: copyleaksProvider,
  dataforseo: dataforseoProvider,
  pagespeed: pagespeedProvider,
}

// Map tool slugs to their preferred provider
const toolProviderMap: Record<string, string> = {
  "ai-writer": "gemini",
  "ai-humanizer": "gemini",
  "seo-title-generator": "gemini",
  "meta-description-generator": "gemini",
  "content-brief": "gemini",
  "topical-map": "gemini",
  "faq-generator": "gemini",
  "article-rewriter": "gemini",
  "grammar-checker": "gemini",
  "summarizer": "gemini",
  "translator": "gemini",
  "ai-detector": "copyleaks",
  "plagiarism-checker": "copyleaks",
  "keyword-research": "dataforseo",
  "website-audit": "dataforseo",
  "rank-tracker": "dataforseo",
  "backlink-checker": "dataforseo",
  "schema-generator": "gemini",
  "sitemap-generator": "openai",
  "robots-txt-generator": "openai",
  "internal-link-generator": "gemini",
}

export function getProviderForTool(toolSlug: string): AIProvider | null {
  const providerSlug = toolProviderMap[toolSlug]
  if (!providerSlug) return null
  const provider = providers[providerSlug]
  if (!provider || !provider.enabled) return null
  return provider
}

export function generateWithProvider(toolSlug: string, prompt: string, options?: Record<string, unknown>): Promise<AIProviderResult> {
  const provider = getProviderForTool(toolSlug)
  if (!provider) {
    return Promise.resolve({ success: false, content: "", error: "No AI provider configured for this tool" })
  }
  return provider.generate(prompt, options)
}
