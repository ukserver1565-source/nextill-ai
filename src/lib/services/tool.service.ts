import { toolRepo, type ToolSettingRow } from "@/lib/repositories/tool-repo"
import { creditRepo } from "@/lib/repositories/credit-repo"
import { profileRepo } from "@/lib/repositories/profile-repo"
import { supabase } from "@/lib/supabase/client"
import type { UpdateToolInput } from "@/lib/validations/tool.schema"

export interface ToolUsageResult {
  success: boolean; creditsUsed: number; error?: string
}

export const toolService = {
  async list() {
    return toolRepo.list()
  },
  async getBySlug(slug: string) {
    const tools = await toolRepo.list()
    return tools.find(t => t.tool_slug === slug) || null
  },
  async update(toolSlug: string, updates: UpdateToolInput) {
    const tools = await toolRepo.list()
    const tool = tools.find(t => t.tool_slug === toolSlug)
    if (!tool) throw new Error(`Tool not found: ${toolSlug}`)
    return toolRepo.update(tool.id, updates)
  },
  async checkUsageLimit(userId: string | null, guestId: string | null, toolSlug: string): Promise<ToolUsageResult> {
    const tools = await toolRepo.list()
    const tool = tools.find(t => t.tool_slug === toolSlug)
    if (!tool || !tool.is_enabled) {
      return { success: false, creditsUsed: 0, error: "Tool is not available" }
    }
    if (userId) {
      const profile = await profileRepo.getById(userId).catch(() => null)
      if (!profile || profile.credits < tool.credits_cost) {
        return { success: false, creditsUsed: 0, error: "Insufficient credits" }
      }
      await creditRepo.remove(userId, tool.credits_cost, `Used ${tool.tool_name}`)
    }
    return { success: true, creditsUsed: tool.credits_cost }
  },
  async logUsage(userId: string | null, guestId: string | null, toolSlug: string, creditsUsed: number, inputChars?: number, outputChars?: number) {
    await supabase.from("usage_logs").insert({
      user_id: userId, guest_id: guestId, tool_slug: toolSlug,
      credits_used: creditsUsed, input_chars: inputChars || 0, output_chars: outputChars || 0,
    })
  },
}
