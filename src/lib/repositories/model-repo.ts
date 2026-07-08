import { supabaseAdmin } from "@/lib/supabase/admin"

export interface ModelRow {
  id: string
  name: string
  provider: string
  enabled: boolean
  api_key_placeholder: string
  default_for: string[]
  fallback: boolean
  usage_count: number
  cost_per_request: number
  monthly_cost: number
}

export const modelRepo = {
  async list() {
    const { data, error } = await supabaseAdmin.from("ai_models").select("*").order("name")
    if (error) throw new Error(`Failed to fetch models: ${error.message}`)
    return data as ModelRow[]
  },

  async update(id: string, updates: Partial<ModelRow>) {
    const { data, error } = await supabaseAdmin.from("ai_models").update(updates).eq("id", id).select().single()
    if (error) throw new Error(`Failed to update model: ${error.message}`)
    return data as ModelRow
  },
}
