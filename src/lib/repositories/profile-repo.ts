import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validation/admin-schemas"

export interface ProfileRow {
  id: string
  user_id: string
  email: string | null
  full_name: string | null
  role: string
  plan: string
  credits: number
  avatar_url: string | null
  status: "active" | "suspended" | "inactive"
  created_at: string
  updated_at: string
}

export const profileRepo = {
  async list(params: PaginationParams) {
    let query = supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact" })

    if (params.search) {
      query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`)
    }
    if (params.filter?.role) {
      query = query.eq("role", params.filter.role)
    }
    if (params.filter?.plan) {
      query = query.eq("plan", params.filter.plan)
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
    return { data: (data || []) as ProfileRow[], total: count || 0, page: params.page, limit: params.limit }
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
    const { data: all, error: e1 } = await supabaseAdmin.from("profiles").select("role,plan,status")
    if (e1) throw new Error(`Failed to fetch stats: ${e1.message}`)

    const premium = all?.filter((u) => u.plan !== "free" && u.status === "active").length || 0
    const free = all?.filter((u) => u.plan === "free" && u.status === "active").length || 0

    // Sum credits from the credits table (single source of truth)
    const { data: creditRows } = await supabaseAdmin
      .from("credits")
      .select("balance")
    const totalCredits = creditRows?.reduce((s: number, r: { balance: number }) => s + (r.balance || 0), 0) || 0

    const { count: totalUsed } = await supabaseAdmin
      .from("credit_logs")
      .select("id", { count: "exact", head: true })
      .eq("type", "used")

    return {
      total: all?.length || 0,
      activeToday: 0,
      premium,
      free,
      totalCredits,
      totalUsed: totalUsed || 0,
    }
  },
}
