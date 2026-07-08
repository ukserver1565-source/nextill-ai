import { supabaseAdmin } from "@/lib/supabase/admin"
import { NotFoundError } from "@/lib/errors"
import type { PaginationParams } from "@/lib/validations/pagination.schema"
import type { CreateDocumentInput, UpdateDocumentInput } from "@/lib/validations/document.schema"

export interface DocumentRow {
  id: string
  user_id: string
  project_id: string | null
  title: string
  content: string | null
  tool_slug: string | null
  word_count: number | null
  created_at: string
  updated_at: string
}

export const documentsRepo = {
  async listByUser(userId: string, params: PaginationParams) {
    let query = supabaseAdmin
      .from("documents")
      .select("*", { count: "exact" })
      .eq("user_id", userId)

    if (params.search) {
      query = query.ilike("title", `%${params.search}%`)
    }
    if (params.filter?.tool_slug) {
      query = query.eq("tool_slug", params.filter.tool_slug)
    }

    const sortCol = params.sort_by || "updated_at"
    const sortDir = params.sort_order || "desc"
    query = query.order(sortCol, { ascending: sortDir === "asc" })

    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch documents: ${error.message}`)
    return { data: data as DocumentRow[], total: count || 0, page: params.page, limit: params.limit }
  },

  async listByProject(projectId: string, params: PaginationParams) {
    let query = supabaseAdmin
      .from("documents")
      .select("*", { count: "exact" })
      .eq("project_id", projectId)

    if (params.search) {
      query = query.ilike("title", `%${params.search}%`)
    }

    const sortCol = params.sort_by || "created_at"
    const sortDir = params.sort_order || "desc"
    query = query.order(sortCol, { ascending: sortDir === "asc" })

    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch documents: ${error.message}`)
    return { data: data as DocumentRow[], total: count || 0, page: params.page, limit: params.limit }
  },

  async listAll(params: PaginationParams) {
    let query = supabaseAdmin
      .from("documents")
      .select("*, profiles!inner(full_name,email)", { count: "exact" })

    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,profiles.full_name.ilike.%${params.search}%`)
    }

    const sortCol = params.sort_by || "created_at"
    const sortDir = params.sort_order || "desc"
    query = query.order(sortCol, { ascending: sortDir === "asc" })

    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch documents: ${error.message}`)
    return { data: data as any[], total: count || 0, page: params.page, limit: params.limit }
  },

  async getById(id: string) {
    const { data, error } = await supabaseAdmin.from("documents").select("*").eq("id", id).single()
    if (error) throw new NotFoundError("Document")
    return data as DocumentRow
  },

  async create(userId: string, data: CreateDocumentInput) {
    const { data: doc, error } = await supabaseAdmin
      .from("documents")
      .insert({ ...data, user_id: userId })
      .select()
      .single()
    if (error) throw new Error(`Failed to create document: ${error.message}`)
    return doc as DocumentRow
  },

  async update(id: string, updates: UpdateDocumentInput) {
    const { data, error } = await supabaseAdmin.from("documents").update(updates).eq("id", id).select().single()
    if (error) throw new Error(`Failed to update document: ${error.message}`)
    return data as DocumentRow
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin.from("documents").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete document: ${error.message}`)
  },
}
