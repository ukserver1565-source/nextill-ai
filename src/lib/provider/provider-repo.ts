import { supabaseAdmin } from "@/lib/supabase/admin"
import type {
  ProviderConfig,
  ModelConfig,
  PromptTemplate,
  AiLog,
  WorkflowSettings,
} from "./provider-types"
import { createHash, createDecipheriv } from "crypto"

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ||
  createHash("sha256")
    .update(String(process.env.SUPABASE_SERVICE_ROLE_KEY))
    .digest("hex")
    .slice(0, 32)

function decrypt(text: string): string {
  if (!text || !text.includes(":")) return text
  try {
    const parts = text.split(":")
    const iv = Buffer.from(parts.shift()!, "hex")
    const encrypted = parts.join(":")
    const decipher = createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv)
    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  } catch {
    return text
  }
}

function maskApiKey(key: string): string {
  if (!key) return ""
  if (key.length <= 8) return key.slice(0, 2) + "****"
  return key.slice(0, 8) + "****" + key.slice(-4)
}

export const providerRepo = {
  async getEnabledProviders(): Promise<ProviderConfig[]> {
    const { data } = await supabaseAdmin
      .from("ai_providers")
      .select("*")
      .eq("enabled", true)
      .order("priority", { ascending: true })
    if (!data) return []
    return (data as any[]).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      enabled: p.enabled,
      priority: p.priority,
      baseUrl: p.base_url,
      defaultModel: p.default_model,
      status: p.status,
      latencyMs: p.latency_ms ?? 0,
      usageCount: p.usage_count ?? 0,
      totalCost: p.total_cost ?? 0,
      config: p.config ?? {},
    }))
  },

  async getApiKey(providerSlug: string): Promise<string | null> {
    const { data } = await supabaseAdmin
      .from("ai_api_keys")
      .select("key_encrypted")
      .eq("provider_slug", providerSlug)
      .eq("is_enabled", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!data?.key_encrypted) return null
    return decrypt(data.key_encrypted)
  },

  async getApiKeyPreview(providerSlug: string): Promise<string | null> {
    const { data } = await supabaseAdmin
      .from("ai_api_keys")
      .select("key_encrypted")
      .eq("provider_slug", providerSlug)
      .eq("is_enabled", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!data?.key_encrypted) return null
    return maskApiKey(decrypt(data.key_encrypted))
  },

  async getModels(providerSlug: string): Promise<ModelConfig[]> {
    const { data } = await supabaseAdmin
      .from("ai_models")
      .select("*")
      .eq("provider_slug", providerSlug)
      .eq("is_enabled", true)
      .order("priority", { ascending: true })
    if (!data) return []
    return (data as any[]).map((m) => ({
      id: m.id,
      providerId: m.provider_id,
      providerSlug: m.provider_slug,
      displayName: m.display_name,
      modelName: m.model_name,
      providerModelId: m.provider_model_id,
      isEnabled: m.is_enabled,
      isDefault: m.is_default,
      isFallback: m.is_fallback ?? false,
      temperature: m.temperature ?? 0.7,
      topP: m.top_p ?? 1.0,
      maxTokens: m.max_tokens ?? 4096,
      streaming: m.streaming ?? false,
      priority: m.priority ?? 0,
      costInput: m.cost_input ?? 0,
      costOutput: m.cost_output ?? 0,
    }))
  },

  async getDefaultModel(providerSlug: string): Promise<ModelConfig | null> {
    const models = await this.getModels(providerSlug)
    return models.find((m) => m.isDefault) ?? models[0] ?? null
  },

  async getPromptTemplate(slug: string): Promise<PromptTemplate | null> {
    const { data } = await supabaseAdmin
      .from("prompt_templates")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle()
    if (!data) return null
    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      category: data.category,
      promptText: data.prompt_text,
      defaultModel: data.default_model,
      temperature: data.temperature,
      maxTokens: data.max_tokens,
    }
  },

  async getWorkflowSettings(workflowSlug: string): Promise<WorkflowSettings | null> {
    const { data } = await supabaseAdmin
      .from("workflow_settings")
      .select("*")
      .eq("workflow_slug", workflowSlug)
      .maybeSingle()
    if (!data) return null
    return {
      id: data.id,
      workflowSlug: data.workflow_slug,
      workflowName: data.workflow_name,
      isEnabled: data.is_enabled,
      creditsCost: data.credits_cost,
      defaultModel: data.default_model,
      fallbackModel: data.fallback_model,
      promptTemplate: data.prompt_template,
      temperature: data.temperature ?? 0.7,
      maxWords: data.max_words ?? 5000,
      steps: data.steps ?? [],
      config: data.config ?? {},
    }
  },

  async logAiCall(log: AiLog): Promise<void> {
    await supabaseAdmin.from("ai_logs").insert({
      provider_slug: log.providerSlug,
      model_name: log.modelName,
      prompt_tokens: log.promptTokens,
      completion_tokens: log.completionTokens,
      total_tokens: log.totalTokens,
      latency_ms: log.latencyMs,
      cost: log.cost,
      success: log.success,
      error: log.error,
      workflow_slug: log.workflowSlug,
    }).maybeSingle()
  },

  async updateProviderUsage(
    providerSlug: string,
    latencyMs: number,
    cost: number,
    success: boolean
  ): Promise<void> {
    const { data: current } = await supabaseAdmin
      .from("ai_providers")
      .select("usage_count, latency_ms, total_cost, status")
      .eq("slug", providerSlug)
      .single()
    if (!current) return
    const newCount = (current.usage_count ?? 0) + 1
    const smoothedLatency = current.latency_ms
      ? Math.round((current.latency_ms * 0.7 + latencyMs * 0.3))
      : latencyMs
    await supabaseAdmin
      .from("ai_providers")
      .update({
        usage_count: newCount,
        latency_ms: smoothedLatency,
        total_cost: (current.total_cost ?? 0) + cost,
        status: success ? "active" : "error",
        last_used_at: new Date().toISOString(),
      })
      .eq("slug", providerSlug)
  },
}
