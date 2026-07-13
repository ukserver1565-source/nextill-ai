import { supabaseAdmin } from "@/lib/supabase/admin"

export interface AIProviderRow {
  id: string
  name: string
  slug: string
  logo: string | null
  enabled: boolean
  priority: number
  base_url: string | null
  default_model: string | null
  status: "active" | "inactive" | "error"
  latency_ms: number
  usage_count: number
  total_cost: number
  last_used_at: string | null
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface AIProviderWithModels extends AIProviderRow {
  model_count: number
  api_key_preview: string | null
}

export const providersService = {
  async list(): Promise<AIProviderWithModels[]> {
    const { data: providers, error } = await supabaseAdmin
      .from("ai_providers")
      .select("*")
      .order("priority", { ascending: true })
      .order("name")
    if (error) throw new Error(`Failed to fetch providers: ${error.message}`)

    const results: AIProviderWithModels[] = []
    for (const p of providers || []) {
      const { count } = await supabaseAdmin
        .from("ai_models")
        .select("id", { count: "exact", head: true })
        .eq("provider_slug", p.slug)
      const { data: apiKey } = await supabaseAdmin
        .from("ai_api_keys")
        .select("key_prefix")
        .eq("provider_slug", p.slug)
        .eq("is_enabled", true)
        .limit(1)
        .maybeSingle()
      results.push({
        ...p,
        model_count: count || 0,
        api_key_preview: apiKey?.key_prefix ? `${apiKey.key_prefix}...` : null,
      })
    }
    return results
  },

  async get(id: string): Promise<AIProviderWithModels> {
    const { data, error } = await supabaseAdmin
      .from("ai_providers")
      .select("*")
      .eq("id", id)
      .single()
    if (error) throw new Error(`Failed to fetch provider: ${error.message}`)
    const { count } = await supabaseAdmin
      .from("ai_models")
      .select("id", { count: "exact", head: true })
      .eq("provider_slug", data.slug)
    const { data: apiKey } = await supabaseAdmin
      .from("ai_api_keys")
      .select("key_prefix")
      .eq("provider_slug", data.slug)
      .eq("is_enabled", true)
      .limit(1)
      .maybeSingle()
    return {
      ...data,
      model_count: count || 0,
      api_key_preview: apiKey?.key_prefix ? `${apiKey.key_prefix}...` : null,
    }
  },

  async create(data: {
    name: string
    slug: string
    base_url?: string
    default_model?: string
    priority?: number
    config?: Record<string, unknown>
  }) {
    const { data: created, error } = await supabaseAdmin
      .from("ai_providers")
      .insert({
        name: data.name,
        slug: data.slug,
        base_url: data.base_url || null,
        default_model: data.default_model || null,
        priority: data.priority ?? 0,
        enabled: true,
        status: "inactive",
        config: data.config || {},
      })
      .select()
      .single()
    if (error) throw new Error(`Failed to create provider: ${error.message}`)
    return created as AIProviderRow
  },

  async update(id: string, data: {
    name?: string
    base_url?: string
    default_model?: string
    priority?: number
    enabled?: boolean
    config?: Record<string, unknown>
  }) {
    const { data: updated, error } = await supabaseAdmin
      .from("ai_providers")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(`Failed to update provider: ${error.message}`)
    return updated as AIProviderRow
  },

  async delete(id: string) {
    const { data: provider } = await supabaseAdmin
      .from("ai_providers")
      .select("slug")
      .eq("id", id)
      .single()
    if (provider) {
      await supabaseAdmin.from("ai_models").delete().eq("provider_slug", provider.slug)
      await supabaseAdmin.from("ai_api_keys").delete().eq("provider_slug", provider.slug)
    }
    const { error } = await supabaseAdmin.from("ai_providers").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete provider: ${error.message}`)
  },

  async testConnection(slug: string): Promise<{ latency: number; success: boolean }> {
    const { data: provider, error } = await supabaseAdmin
      .from("ai_providers")
      .select("slug, base_url")
      .eq("slug", slug)
      .single()
    if (error || !provider) throw new Error(`Provider not found: ${error?.message}`)
    const { data: apiKey } = await supabaseAdmin
      .from("ai_api_keys")
      .select("key_encrypted")
      .eq("provider_slug", slug)
      .eq("is_enabled", true)
      .limit(1)
      .maybeSingle()
    if (!apiKey?.key_encrypted) throw new Error("No API key configured for this provider")
    const start = Date.now()
    try {
      const baseUrl = (provider.base_url || "").replace(/\/+$/, "")
      const response = await fetch(`${baseUrl}/models`, {
        headers: { Authorization: `Bearer ${apiKey.key_encrypted}` },
        signal: AbortSignal.timeout(10000),
      })
      return { latency: Date.now() - start, success: response.ok }
    } catch {
      return { latency: Date.now() - start, success: false }
    }
  },

  async setPriority(id: string, priority: number) {
    const { data, error } = await supabaseAdmin
      .from("ai_providers")
      .update({ priority, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(`Failed to set priority: ${error.message}`)
    return data as AIProviderRow
  },

  async toggle(id: string) {
    const { data: current } = await supabaseAdmin
      .from("ai_providers")
      .select("enabled")
      .eq("id", id)
      .single()
    const { data, error } = await supabaseAdmin
      .from("ai_providers")
      .update({ enabled: !current?.enabled, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(`Failed to toggle provider: ${error.message}`)
    return data as AIProviderRow
  },

  async getFallbackChain(): Promise<AIProviderRow[]> {
    const { data, error } = await supabaseAdmin
      .from("ai_providers")
      .select("*")
      .eq("enabled", true)
      .order("priority", { ascending: true })
    if (error) throw new Error(`Failed to fetch fallback chain: ${error.message}`)
    return (data || []) as AIProviderRow[]
  },
}
