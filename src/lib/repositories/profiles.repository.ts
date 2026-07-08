import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validations/pagination.schema"
import { NotFoundError } from "@/lib/errors"

export interface ProfileRow {
  id: string
  user_id: string
  full_name: string
  email: string
  role: "free_user" | "admin" | "super_admin"
  plan: "free" | "starter" | "pro" | "agency" | "enterprise"
  credits: number
  avatar_url: string | null
  status: "active" | "suspended" | "inactive"
  created_at: string
  updated_at: string
}

export const profilesRepo = {
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
    return { data: data as ProfileRow[], total: count || 0, page: params.page, limit: params.limit }
  },

  async getById(id: string) {
    const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", id).single()
    if (error) throw new NotFoundError("Profile")
    return data as ProfileRow
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("user_id", userId).single()
    if (error) throw new NotFoundError("Profile")
    return data as ProfileRow
  },

  async update(userId: string, updates: Partial<ProfileRow>) {
    const { data, error } = await supabaseAdmin.from("profiles").update(updates).eq("user_id", userId).select().single()
    if (error) throw new Error(`Failed to update profile: ${error.message}`)
    return data as ProfileRow
  },

  async getStats() {
    const { data: all, error } = await supabaseAdmin
      .from("profiles")
      .select("role,plan,status,credits,updated_at")
    if (error) throw new Error(`Failed to fetch stats: ${error.message}`)

    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 86400000).toISOString()
    const activeToday = all?.filter((u) => u.updated_at && u.updated_at >= oneDayAgo).length || 0
    const premium = all?.filter((u) => u.plan !== "free" && u.status === "active").length || 0
    const free = all?.filter((u) => u.plan === "free" && u.status === "active").length || 0
    const totalCredits = all?.reduce((s, u) => s + u.credits, 0) || 0

    return {
      total: all?.length || 0,
      activeToday,
      premium,
      free,
      totalCredits,
    }
  },
}
