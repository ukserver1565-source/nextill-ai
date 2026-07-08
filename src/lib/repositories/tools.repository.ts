import { supabaseAdmin } from "@/lib/supabase/admin"
import { NotFoundError } from "@/lib/errors"
import type { UpdateToolInput } from "@/lib/validations/tool.schema"

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
  created_at: string
  updated_at: string
}

export const toolsRepo = {
  async list() {
    const { data, error } = await supabaseAdmin.from("tool_settings").select("*").order("tool_name")
    if (error) throw new Error(`Failed to fetch tools: ${error.message}`)
    return data as ToolSettingRow[]
  },

  async update(toolSlug: string, updates: UpdateToolInput) {
    const { data, error } = await supabaseAdmin
      .from("tool_settings")
      .update(updates)
      .eq("tool_slug", toolSlug)
      .select()
      .single()
    if (error) throw new Error(`Failed to update tool: ${error.message}`)
    return data as ToolSettingRow
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabaseAdmin.from("tool_settings").select("*").eq("tool_slug", slug).single()
    if (error) throw new NotFoundError("Tool setting")
    return data as ToolSettingRow
  },
}
