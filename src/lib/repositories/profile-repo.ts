import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validation/admin-schemas"

export interface ProfileRow {
  id: string
  email: string
  name: string
  role: "user" | "admin" | "super_admin"
  plan_id: string
  status: "active" | "suspended" | "inactive"
  avatar_url: string | null
  credits: number
  credits_used: number
  articles_generated: number
  created_at: string
  last_login: string | null
}

export const profileRepo = {
  async list(params: PaginationParams) {
    let query = supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact" })

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`)
    }
    if (params.filter?.role) {
      query = query.eq("role", params.filter.role)
    }
    if (params.filter?.plan_id) {
      query = query.eq("plan_id", params.filter.plan_id)
    }
    if (params.filter?.status) {
      query = query.eq("status", params.filter.status)
    }

    const sortCol = params.sort_by || "created_at"
    const sortDir = params.sort_order || "desc"
    query = query.order(sortCol, { ascending: sortDir === "asc" })

    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch profiles: ${error.message}`)
    return { data: data as ProfileRow[], total: count || 0, page: params.page, limit: params.limit }
  },

  async getById(id: string) {
    const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", id).single()
    if (error) throw new Error(`Profile not found: ${error.message}`)
    return data as ProfileRow
  },

  async update(id: string, updates: Partial<ProfileRow>) {
    const { data, error } = await supabaseAdmin.from("profiles").update(updates).eq("id", id).select().single()
    if (error) throw new Error(`Failed to update profile: ${error.message}`)
    return data as ProfileRow
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin.from("profiles").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete profile: ${error.message}`)
  },

  async getStats() {
    const { data: all, error: e1 } = await supabaseAdmin.from("profiles").select("role,plan_id,status,credits,credits_used,last_login")
    if (e1) throw new Error(`Failed to fetch stats: ${e1.message}`)

    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 86400000).toISOString()
    const activeToday = all?.filter((u) => u.last_login && u.last_login >= oneDayAgo).length || 0
    const premium = all?.filter((u) => u.plan_id !== "free" && u.status === "active").length || 0
    const free = all?.filter((u) => u.plan_id === "free" && u.status === "active").length || 0
    const totalCredits = all?.reduce((s, u) => s + u.credits, 0) || 0
    const totalUsed = all?.reduce((s, u) => s + u.credits_used, 0) || 0

    return {
      total: all?.length || 0,
      activeToday,
      premium,
      free,
      totalCredits,
      totalUsed,
    }
  },
}
