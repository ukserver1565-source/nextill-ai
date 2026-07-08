import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validation/admin-schemas"

export interface CreditRow {
  id: string
  user_id: string
  amount: number
  type: "added" | "removed" | "used"
  tool: string | null
  description: string
  created_at: string
}

export const creditRepo = {
  async list(params: PaginationParams) {
    let query = supabaseAdmin
      .from("credits")
      .select("*, profiles!inner(full_name)", { count: "exact" })

    if (params.search) {
      query = query.or(`profiles.full_name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
    }
    if (params.filter?.type) {
      query = query.eq("type", params.filter.type)
    }

    query = query.order("created_at", { ascending: false })
    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch credits: ${error.message}`)
    return { data: data as any[], total: count || 0, page: params.page, limit: params.limit }
  },

  async add(userId: string, amount: number, description: string) {
    const { error: logError } = await supabaseAdmin.from("credits").insert({
      user_id: userId, amount, type: "added", description,
    })
    if (logError) throw new Error(`Failed to log credit addition: ${logError.message}`)

    const { error: updateError } = await supabaseAdmin.rpc("add_credits", {
      p_user_id: userId, p_amount: amount,
    })
    if (updateError) {
      await supabaseAdmin.from("credits").delete().eq("user_id", userId).eq("amount", amount).eq("type", "added")
      throw new Error(`Failed to add credits: ${updateError.message}`)
    }
  },

  async remove(userId: string, amount: number, description: string) {
    const { error: logError } = await supabaseAdmin.from("credits").insert({
      user_id: userId, amount, type: "removed", description,
    })
    if (logError) throw new Error(`Failed to log credit removal: ${logError.message}`)

    const { error: updateError } = await supabaseAdmin.rpc("remove_credits", {
      p_user_id: userId, p_amount: amount,
    })
    if (updateError) throw new Error(`Failed to remove credits: ${updateError.message}`)
  },
}
