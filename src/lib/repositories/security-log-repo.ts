import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validation/admin-schemas"

export const securityLogRepo = {
  async list(params: PaginationParams) {
    let query = supabaseAdmin.from("security_logs").select("*", { count: "exact" })
    if (params.search) query = query.or(`event_type.ilike.%${params.search}%,ip_hash.ilike.%${params.search}%`)
    if (params.filter?.event_type) query = query.eq("event_type", params.filter.event_type)
    query = query.order("created_at", { ascending: false })
    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)
    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch security logs: ${error.message}`)
    return { data: (data || []) as Array<{ id: string; user_id: string | null; event_type: string; ip_hash: string | null; user_agent: string | null; created_at: string }>, total: count || 0, page: params.page, limit: params.limit }
  },
}
