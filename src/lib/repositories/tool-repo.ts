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
  created_at: string
  updated_at: string
}

// Canonical workflow names for the 3 primary tools
const WORKFLOW_TOOLS: Record<string, { name: string; description: string }> = {
  "keyword-intelligence": { name: "Keyword Intelligence", description: "Discover keywords with volume, difficulty & SERP analysis" },
  "domain-intelligence": { name: "Domain Intelligence", description: "Analyze domains for SEO metrics, competitors & technical health" },
  "post-generator": { name: "Post Generator", description: "Generate SEO-optimized articles with AI" },
  "plagiarism-checker": { name: "Plagiarism & Authenticity", description: "Check content originality and AI-likelihood" },
}

export const toolRepo = {
  async list() {
    const { data, error } = await supabaseAdmin
      .from("workflow_settings")
      .select("*")
      .order("workflow_slug")
    if (error) throw new Error(`Failed to fetch tools: ${error.message}`)

    // Map workflow_settings to tool-like format for the UI
    const tools: ToolSettingRow[] = (data || []).map((w: any) => ({
      id: w.id,
      tool_slug: w.workflow_slug,
      tool_name: WORKFLOW_TOOLS[w.workflow_slug]?.name || w.workflow_name || w.workflow_slug,
      is_enabled: w.is_enabled ?? true,
      guest_daily_limit: w.guest_daily_limit ?? 0,
      free_daily_limit: w.free_daily_limit ?? 0,
      premium_daily_limit: w.premium_daily_limit ?? 0,
      credits_cost: w.credits_cost ?? 0,
      default_model: w.default_model ?? null,
      prompt_template: w.prompt_template ?? null,
      created_at: w.created_at,
      updated_at: w.updated_at,
    }))

    return tools
  },

  async update(id: string, updates: Partial<ToolSettingRow>) {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (updates.credits_cost !== undefined) payload.credits_cost = updates.credits_cost
    if (updates.guest_daily_limit !== undefined) payload.guest_daily_limit = updates.guest_daily_limit
    if (updates.free_daily_limit !== undefined) payload.free_daily_limit = updates.free_daily_limit
    if (updates.premium_daily_limit !== undefined) payload.premium_daily_limit = updates.premium_daily_limit
    if (updates.is_enabled !== undefined) payload.is_enabled = updates.is_enabled
    if (updates.default_model !== undefined) payload.default_model = updates.default_model

    const { data, error } = await supabaseAdmin
      .from("workflow_settings")
      .update(payload)
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(`Failed to update tool: ${error.message}`)
    return data as any
  },
}
