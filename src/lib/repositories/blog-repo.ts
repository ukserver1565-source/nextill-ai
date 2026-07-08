import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validation/admin-schemas"

export interface BlogPostRow {
  id: string
  title: string
  slug: string
  category: string
  content: string | null
  seo_title: string | null
  meta_description: string | null
  status: "draft" | "published"
  author: string
  image_url: string | null
  created_at: string
  updated_at: string
}

export const blogRepo = {
  async list(params: PaginationParams) {
    let query = supabaseAdmin.from("blog_posts").select("*", { count: "exact" })
    if (params.search) query = query.ilike("title", `%${params.search}%`)
    if (params.filter?.category) query = query.eq("category", params.filter.category)
    if (params.filter?.status) query = query.eq("status", params.filter.status)
    const sortCol = params.sort_by || "created_at"
    const sortDir = params.sort_order || "desc"
    query = query.order(sortCol, { ascending: sortDir === "asc" })
    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)
    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch posts: ${error.message}`)
    return { data: data as BlogPostRow[], total: count || 0, page: params.page, limit: params.limit }
  },

  async getById(id: string) {
    const { data, error } = await supabaseAdmin.from("blog_posts").select("*").eq("id", id).single()
    if (error) throw new Error(`Post not found: ${error.message}`)
    return data as BlogPostRow
  },

  async create(post: Omit<BlogPostRow, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabaseAdmin.from("blog_posts").insert(post).select().single()
    if (error) throw new Error(`Failed to create post: ${error.message}`)
    return data as BlogPostRow
  },

  async update(id: string, updates: Partial<BlogPostRow>) {
    const { data, error } = await supabaseAdmin.from("blog_posts").update(updates).eq("id", id).select().single()
    if (error) throw new Error(`Failed to update post: ${error.message}`)
    return data as BlogPostRow
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete post: ${error.message}`)
  },

  async listCategories() {
    const { data, error } = await supabaseAdmin.from("blog_categories").select("name").order("name")
    if (error) throw new Error(`Failed to fetch categories: ${error.message}`)
    return (data || []).map((c) => c.name)
  },
}
