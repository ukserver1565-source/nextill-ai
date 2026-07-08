import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validations/pagination.schema"

export const adminLogsRepo = {
  async list(params: PaginationParams) {
    let query = supabaseAdmin
      .from("admin_logs")
      .select("*, profiles!inner(full_name)", { count: "exact" })

    if (params.search) {
      query = query.or(`action.ilike.%${params.search}%,target_type.ilike.%${params.search}%`)
    }
    if (params.filter?.admin_id) {
      query = query.eq("admin_id", params.filter.admin_id)
    }
    if (params.filter?.target_type) {
      query = query.eq("target_type", params.filter.target_type)
    }

    query = query.order("created_at", { ascending: false })

    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch admin logs: ${error.message}`)
    return { data: data as any[], total: count || 0, page: params.page, limit: params.limit }
  },

  async log(
    adminUserId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    metadata?: Record<string, any>,
  ) {
    const { error } = await supabaseAdmin.from("admin_logs").insert({
      admin_id: adminUserId,
      action,
      target_type: targetType || null,
      target_id: targetId || null,
      metadata: metadata || {},
    })
    if (error) console.error("Failed to log admin action:", error.message)
  },
}
