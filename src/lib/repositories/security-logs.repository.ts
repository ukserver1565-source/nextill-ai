import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validations/pagination.schema"

export const securityLogsRepo = {
  async list(params: PaginationParams) {
    let query = supabaseAdmin
      .from("security_logs")
      .select("*, profiles!left(full_name)", { count: "exact" })

    if (params.search) {
      query = query.or(`action.ilike.%${params.search}%,ip_hash.ilike.%${params.search}%`)
    }
    if (params.filter?.event_type) {
      query = query.eq("event_type", params.filter.event_type)
    }

    query = query.order("created_at", { ascending: false })

    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch security logs: ${error.message}`)
    return { data: data as any[], total: count || 0, page: params.page, limit: params.limit }
  },

  async create(data: { event_type: string; user_id?: string; ip_hash?: string; user_agent?: string }) {
    const { error } = await supabaseAdmin.from("security_logs").insert({
      event_type: data.event_type,
      user_id: data.user_id || null,
      ip_hash: data.ip_hash || "",
      user_agent: data.user_agent || "",
    })
    if (error) console.error("Failed to create security log:", error.message)
  },
}
