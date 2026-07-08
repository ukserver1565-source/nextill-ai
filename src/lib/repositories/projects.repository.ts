import { supabaseAdmin } from "@/lib/supabase/admin"
import { NotFoundError } from "@/lib/errors"
import type { PaginationParams } from "@/lib/validations/pagination.schema"
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validations/project.schema"

export interface ProjectRow {
  id: string
  user_id: string
  name: string
  domain: string | null
  seo_score: number | null
  pulse_score: number | null
  created_at: string
  updated_at: string
}

export const projectsRepo = {
  async listByUser(userId: string, params: PaginationParams) {
    let query = supabaseAdmin
      .from("projects")
      .select("*", { count: "exact" })
      .eq("user_id", userId)

    if (params.search) {
      query = query.ilike("name", `%${params.search}%`)
    }

    const sortCol = params.sort_by || "updated_at"
    const sortDir = params.sort_order || "desc"
    query = query.order(sortCol, { ascending: sortDir === "asc" })

    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch projects: ${error.message}`)
    return { data: data as ProjectRow[], total: count || 0, page: params.page, limit: params.limit }
  },

  async listAll(params: PaginationParams) {
    let query = supabaseAdmin
      .from("projects")
      .select("*, profiles!inner(full_name,email)", { count: "exact" })

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,profiles.full_name.ilike.%${params.search}%`)
    }

    const sortCol = params.sort_by || "updated_at"
    const sortDir = params.sort_order || "desc"
    query = query.order(sortCol, { ascending: sortDir === "asc" })

    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch projects: ${error.message}`)
    return { data: data as any[], total: count || 0, page: params.page, limit: params.limit }
  },

  async getById(id: string) {
    const { data, error } = await supabaseAdmin.from("projects").select("*").eq("id", id).single()
    if (error) throw new NotFoundError("Project")
    return data as ProjectRow
  },

  async create(userId: string, data: CreateProjectInput) {
    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .insert({ ...data, user_id: userId })
      .select()
      .single()
    if (error) throw new Error(`Failed to create project: ${error.message}`)
    return project as ProjectRow
  },

  async update(id: string, updates: UpdateProjectInput) {
    const { data, error } = await supabaseAdmin.from("projects").update(updates).eq("id", id).select().single()
    if (error) throw new Error(`Failed to update project: ${error.message}`)
    return data as ProjectRow
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin.from("projects").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete project: ${error.message}`)
  },
}
