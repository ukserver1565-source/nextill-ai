import { supabaseAdmin } from "@/lib/supabase/admin"
import { NotFoundError } from "@/lib/errors"

export interface ModelRow {
  id: string
  provider: string
  model_name: string
  api_key_secret_name: string | null
  is_enabled: boolean
  is_default: boolean
  cost_input: number
  cost_output: number
  created_at: string
}

export const modelsRepo = {
  async list() {
    const { data, error } = await supabaseAdmin.from("ai_models").select("*").order("model_name")
    if (error) throw new Error(`Failed to fetch models: ${error.message}`)
    return data as ModelRow[]
  },

  async update(id: string, updates: Partial<ModelRow>) {
    const { data, error } = await supabaseAdmin.from("ai_models").update(updates).eq("id", id).select().single()
    if (error) throw new Error(`Failed to update model: ${error.message}`)
    return data as ModelRow
  },
}
