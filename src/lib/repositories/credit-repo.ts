import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validation/admin-schemas"

export interface CreditLogRow {
  id: string
  user_id: string
  amount: number
  type: "added" | "removed" | "used"
  reason: string | null
  created_at: string
}

export const creditRepo = {
  async list(params: PaginationParams) {
    let query = supabaseAdmin
      .from("credit_logs")
      .select("*", { count: "exact" })

    if (params.search) {
      query = query.or(`reason.ilike.%${params.search}%`)
    }
    if (params.filter?.type) {
      query = query.eq("type", params.filter.type)
    }

    query = query.order("created_at", { ascending: false })
    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch credit logs: ${error.message}`)
    return { data: (data || []) as CreditLogRow[], total: count || 0, page: params.page, limit: params.limit }
  },

  async add(userId: string, amount: number, reason: string) {
    const { error: logError } = await supabaseAdmin.from("credit_logs").insert({
      user_id: userId, amount, type: "added", reason,
    })
    if (logError) throw new Error(`Failed to log credit addition: ${logError.message}`)

    const { error: updateError } = await supabaseAdmin.rpc("add_credits", {
      p_user_id: userId, p_amount: amount,
    })
    if (updateError) throw new Error(`Failed to add credits: ${updateError.message}`)
  },

  async remove(userId: string, amount: number, reason: string) {
    const { error: logError } = await supabaseAdmin.from("credit_logs").insert({
      user_id: userId, amount, type: "removed", reason,
    })
    if (logError) throw new Error(`Failed to log credit removal: ${logError.message}`)

    const { error: updateError } = await supabaseAdmin.rpc("deduct_credits", {
      p_user_id: userId, p_amount: amount,
    })
    if (updateError) throw new Error(`Failed to remove credits: ${updateError.message}`)
  },
}
