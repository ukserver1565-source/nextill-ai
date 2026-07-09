import { supabaseAdmin } from "@/lib/supabase/admin"

export interface ModelRow {
  id: string
  provider_id: string
  display_name: string
  model_name: string
  provider_model_id: string
  is_enabled: boolean
  is_default: boolean
  cost_input: number
  cost_output: number
  max_tokens: number
  config: Record<string, any>
  created_at: string
  updated_at: string
}

export const modelsService = {
  async list(providerId?: string) {
    let query = supabaseAdmin
      .from("ai_models")
      .select("*, providers:provider_id(name, slug)")
    if (providerId) query = query.eq("provider_id", providerId)
    query = query.order("display_name", { ascending: true })
    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch models: ${error.message}`)
    return (data || []) as any[]
  },

  async get(id: string) {
    const { data, error } = await supabaseAdmin
      .from("ai_models")
      .select("*, providers:provider_id(name, slug)")
      .eq("id", id)
      .single()
    if (error) throw new Error(`Failed to fetch model: ${error.message}`)
    return data as any
  },

  async create(data: {
    provider_id: string
    display_name: string
    model_name: string
    provider_model_id: string
    cost_input?: number
    cost_output?: number
    max_tokens?: number
    config?: Record<string, any>
    is_default?: boolean
  }) {
    const { data: created, error } = await supabaseAdmin
      .from("ai_models")
      .insert({
        provider_id: data.provider_id,
        display_name: data.display_name,
        model_name: data.model_name,
        provider_model_id: data.provider_model_id,
        cost_input: data.cost_input ?? 0,
        cost_output: data.cost_output ?? 0,
        max_tokens: data.max_tokens ?? 4096,
        config: data.config || {},
        is_enabled: true,
        is_default: data.is_default ?? false,
      })
      .select()
      .single()
    if (error) throw new Error(`Failed to create model: ${error.message}`)
    return created as ModelRow
  },

  async update(id: string, data: {
    display_name?: string
    model_name?: string
    provider_model_id?: string
    cost_input?: number
    cost_output?: number
    max_tokens?: number
    config?: Record<string, any>
    is_enabled?: boolean
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

  async setDefault(providerId: string, modelId: string) {
    await supabaseAdmin.from("ai_models").update({ is_default: false }).eq("provider_id", providerId)
    const { data, error } = await supabaseAdmin
      .from("ai_models")
      .update({ is_default: true })
      .eq("id", modelId)
      .eq("provider_id", providerId)
      .select()
      .single()
    if (error) throw new Error(`Failed to set default model: ${error.message}`)
    return data as ModelRow
  },

  async getDefault(providerId: string) {
    const { data, error } = await supabaseAdmin
      .from("ai_models")
      .select("*")
      .eq("provider_id", providerId)
      .eq("is_default", true)
      .maybeSingle()
    if (error) throw new Error(`Failed to get default model: ${error.message}`)
    return data as ModelRow | null
  },

  async getByProvider(providerId: string) {
    const { data, error } = await supabaseAdmin
      .from("ai_models")
      .select("*")
      .eq("provider_id", providerId)
      .order("display_name", { ascending: true })
    if (error) throw new Error(`Failed to fetch models for provider: ${error.message}`)
    return (data || []) as ModelRow[]
  },
}
