export interface AIProvider {
  name: string
  slug: string
  enabled: boolean
  generate(prompt: string, options?: Record<string, unknown>): Promise<AIProviderResult>
}

export interface AIProviderResult {
  success: boolean
  content: string
  error?: string
}

export function getApiKey(key: string): string | null {
  if (typeof process === "undefined") return null
  const value = process.env[key]
  return value && value.length > 0 ? value : null
}
