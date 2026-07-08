import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validations/pagination.schema"

export interface CreditLogRow {
  id: string
  user_id: string
  amount: number
  type: "added" | "deducted" | "used"
  reason: string | null
  created_at: string
}

export const creditsRepo = {
  async getBalance(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("user_id", userId)
      .single()
    if (error) throw new Error(`Failed to fetch credit balance: ${error.message}`)
    return data.credits as number
  },

  async addCredits(userId: string, amount: number, reason?: string) {
    const { error: logError } = await supabaseAdmin.from("credit_logs").insert({
      user_id: userId, amount, type: "added", reason: reason || null,
    })
    if (logError) throw new Error(`Failed to log credit addition: ${logError.message}`)

    const { error: updateError } = await supabaseAdmin.rpc("add_credits", {
      p_user_id: userId, p_amount: amount,
    })
    if (updateError) {
      await supabaseAdmin.from("credit_logs").delete().eq("user_id", userId).eq("amount", amount).eq("type", "added")
      throw new Error(`Failed to add credits: ${updateError.message}`)
    }
  },

  async deductCredits(userId: string, amount: number, reason?: string) {
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("user_id", userId)
      .single()
    if (fetchError) throw new Error(`Failed to fetch profile: ${fetchError.message}`)

    if (profile.credits < amount) return false

    const { error: logError } = await supabaseAdmin.from("credit_logs").insert({
      user_id: userId, amount, type: "deducted", reason: reason || null,
    })
    if (logError) throw new Error(`Failed to log credit deduction: ${logError.message}`)

    const { error: updateError } = await supabaseAdmin.rpc("deduct_credits", {
      p_user_id: userId, p_amount: amount,
    })
    if (updateError) throw new Error(`Failed to deduct credits: ${updateError.message}`)

    return true
  },

  async getLogs(userId: string, params: PaginationParams) {
    let query = supabaseAdmin
      .from("credit_logs")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch credit logs: ${error.message}`)
    return { data: data as CreditLogRow[], total: count || 0, page: params.page, limit: params.limit }
  },

  async listAllLogs(params: PaginationParams) {
    let query = supabaseAdmin
      .from("credit_logs")
      .select("*, profiles!inner(full_name,email)", { count: "exact" })

    if (params.search) {
      query = query.or(`profiles.full_name.ilike.%${params.search}%,reason.ilike.%${params.search}%`)
    }
    if (params.filter?.type) {
      query = query.eq("type", params.filter.type)
    }

    query = query.order("created_at", { ascending: false })
    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch credit logs: ${error.message}`)
    return { data: data as any[], total: count || 0, page: params.page, limit: params.limit }
  },
}
