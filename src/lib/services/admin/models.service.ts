import { supabaseAdmin } from "@/lib/supabase/admin"

export interface ModelRow {
  id: string
  provider: string
  model_name: string
  api_key_secret_name: string | null
  is_enabled: boolean
  is_default: boolean
  cost_input: number
  cost_output: number
  provider_slug: string | null
  temperature: number
  top_p: number
  max_tokens: number
  streaming: boolean
  priority: number
  fallback_model_id: string | null
  is_fallback: boolean
  created_at: string
}

export const modelsService = {
  async list(providerSlug?: string) {
    let query = supabaseAdmin
      .from("ai_models")
      .select("*")
    if (providerSlug) query = query.eq("provider_slug", providerSlug)
    query = query.order("model_name", { ascending: true })
    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch models: ${error.message}`)
    return (data || []) as ModelRow[]
  },

  async get(id: string) {
    const { data, error } = await supabaseAdmin
      .from("ai_models")
      .select("*")
      .eq("id", id)
      .single()
    if (error) throw new Error(`Failed to fetch model: ${error.message}`)
    return data as ModelRow
  },

  async create(data: {
    provider: string
    provider_slug?: string
    model_name: string
    cost_input?: number
    cost_output?: number
    max_tokens?: number
    temperature?: number
    is_default?: boolean
  }) {
    const { data: created, error } = await supabaseAdmin
      .from("ai_models")
      .insert({
        provider: data.provider,
        provider_slug: data.provider_slug || data.provider,
        model_name: data.model_name,
        cost_input: data.cost_input ?? 0,
        cost_output: data.cost_output ?? 0,
        max_tokens: data.max_tokens ?? 4096,
        temperature: data.temperature ?? 0.7,
        is_enabled: true,
        is_default: data.is_default ?? false,
      })
      .select()
      .single()
    if (error) throw new Error(`Failed to create model: ${error.message}`)
    return created as ModelRow
  },

  async update(id: string, data: {
    model_name?: string
    cost_input?: number
    cost_output?: number
    max_tokens?: number
    temperature?: number
    is_enabled?: boolean
    is_default?: boolean
  }) {
    const { data: updated, error } = await supabaseAdmin
      .from("ai_models")
      .update(data)
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(`Failed to update model: ${error.message}`)
    return updated as ModelRow
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin.from("ai_models").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete model: ${error.message}`)
  },

  async setDefault(providerSlug: string, modelId: string) {
    await supabaseAdmin.from("ai_models").update({ is_default: false }).eq("provider_slug", providerSlug)
    const { data, error } = await supabaseAdmin
      .from("ai_models")
      .update({ is_default: true })
      .eq("id", modelId)
      .eq("provider_slug", providerSlug)
      .select()
      .single()
    if (error) throw new Error(`Failed to set default model: ${error.message}`)
    return data as ModelRow
  },

  async getDefault(providerSlug: string) {
    const { data, error } = await supabaseAdmin
      .from("ai_models")
      .select("*")
      .eq("provider_slug", providerSlug)
      .eq("is_default", true)
      .maybeSingle()
    if (error) throw new Error(`Failed to get default model: ${error.message}`)
    return data as ModelRow | null
  },

  async getByProvider(providerSlug: string) {
    const { data, error } = await supabaseAdmin
      .from("ai_models")
      .select("*")
      .eq("provider_slug", providerSlug)
      .order("model_name", { ascending: true })
    if (error) throw new Error(`Failed to fetch models for provider: ${error.message}`)
    return (data || []) as ModelRow[]
  },
}
