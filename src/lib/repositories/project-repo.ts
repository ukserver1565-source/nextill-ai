import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validation/admin-schemas"

export interface ProjectRow {
  id: string
  user_id: string
  name: string
  domain: string | null
  articles: number
  keywords: number
  seo_score: number
  traffic: string | null
  status: string
  created_at: string
  updated_at: string
}

export const projectRepo = {
  async list(params: PaginationParams) {
    let query = supabaseAdmin.from("projects")      .select("*, profiles!inner(full_name,email)", { count: "exact" })
    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,profiles.full_name.ilike.%${params.search}%`)
    }
    query = query.order("updated_at", { ascending: false })
    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)
    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch projects: ${error.message}`)
    return { data: data as any[], total: count || 0, page: params.page, limit: params.limit }
  },

  async create(project: { user_id: string; name: string; domain?: string }) {
    const { data, error } = await supabaseAdmin.from("projects").insert(project).select().single()
    if (error) throw new Error(`Failed to create project: ${error.message}`)
    return data as ProjectRow
  },

  async update(id: string, updates: Partial<ProjectRow>) {
    const { data, error } = await supabaseAdmin.from("projects").update(updates).eq("id", id).select().single()
    if (error) throw new Error(`Failed to update project: ${error.message}`)
    return data as ProjectRow
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin.from("projects").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete project: ${error.message}`)
  },
}
