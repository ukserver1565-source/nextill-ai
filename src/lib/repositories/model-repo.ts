import { supabaseAdmin } from "@/lib/supabase/admin"

export interface ModelRow {
  id: string
  provider: string
  model_name: string
  is_enabled: boolean
  is_default: boolean
  cost_input: number
  cost_output: number
  provider_slug: string | null
  temperature: number
  max_tokens: number
  is_fallback: boolean
}

export const modelRepo = {
  async list() {
    const { data, error } = await supabaseAdmin.from("ai_models").select("*").order("model_name")
    if (error) throw new Error(`Failed to fetch models: ${error.message}`)
    return (data || []) as ModelRow[]
  },

  async update(id: string, updates: Partial<ModelRow>) {
    const { data, error } = await supabaseAdmin.from("ai_models").update(updates).eq("id", id).select().single()
    if (error) throw new Error(`Failed to update model: ${error.message}`)
    return data as ModelRow
  },
}
