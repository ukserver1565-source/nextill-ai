import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validation/admin-schemas"

export const securityLogRepo = {
  async list(params: PaginationParams) {
    let query = supabaseAdmin.from("security_logs").select("*, profiles!left(name)", { count: "exact" })
    if (params.search) query = query.or(`action.ilike.%${params.search}%,ip_hash.ilike.%${params.search}%`)
    if (params.filter?.type) query = query.eq("type", params.filter.type)
    query = query.order("created_at", { ascending: false })
    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)
    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch security logs: ${error.message}`)
    return { data: data as any[], total: count || 0, page: params.page, limit: params.limit }
  },
}
