import { supabaseAdmin } from "@/lib/supabase/admin"

export interface ToolSettingRow {
  id: string
  tool_slug: string
  tool_name: string
  is_enabled: boolean
  guest_daily_limit: number
  free_daily_limit: number
  premium_daily_limit: number
  credits_cost: number
  default_model: string | null
  prompt_template: string | null
  usage_count: number
}

export const toolRepo = {
  async list() {
    const { data, error } = await supabaseAdmin.from("tool_settings").select("*").order("tool_name")
    if (error) throw new Error(`Failed to fetch tools: ${error.message}`)
    return data as ToolSettingRow[]
  },

  async update(id: string, updates: Partial<ToolSettingRow>) {
    const { data, error } = await supabaseAdmin.from("tool_settings").update(updates).eq("id", id).select().single()
    if (error) throw new Error(`Failed to update tool: ${error.message}`)
    return data as ToolSettingRow
  },
}
