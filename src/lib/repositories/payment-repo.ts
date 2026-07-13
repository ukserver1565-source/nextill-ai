import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validation/admin-schemas"

export interface PaymentRow {
  id: string
  user_id: string
  plan_slug: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "refunded"
  provider: string
  provider_payment_id: string | null
  created_at: string
}

export const paymentRepo = {
  async list(params: PaginationParams) {
    let query = supabaseAdmin
      .from("payments")
      .select("*", { count: "exact" })

    if (params.search) {
      query = query.or(`plan_slug.ilike.%${params.search}%,provider.ilike.%${params.search}%`)
    }
    if (params.filter?.status) {
      query = query.eq("status", params.filter.status)
    }
    if (params.filter?.plan_slug) {
      query = query.eq("plan_slug", params.filter.plan_slug)
    }

    const sortCol = params.sort_by || "created_at"
    const sortDir = params.sort_order || "desc"
    query = query.order(sortCol, { ascending: sortDir === "asc" })

    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch payments: ${error.message}`)
    return { data: (data || []) as PaymentRow[], total: count || 0, page: params.page, limit: params.limit }
  },

  async getStats() {
    const { data, error } = await supabaseAdmin.from("payments").select("amount,status,created_at")
    if (error) throw new Error(`Failed to fetch payment stats: ${error.message}`)

    const completed = data?.filter((p) => p.status === "completed") || []
    const totalRevenue = completed.reduce((s, p) => s + Number(p.amount), 0)
    const monthlyRevenue = completed
      .filter((p) => p.created_at?.startsWith(new Date().toISOString().slice(0, 7)))
      .reduce((s, p) => s + Number(p.amount), 0)

    return { totalRevenue, monthlyRevenue, totalTransactions: data?.length || 0, completedCount: completed.length }
  },
}
