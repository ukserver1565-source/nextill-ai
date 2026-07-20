import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validation/admin-schemas"

export interface BlogPostRow {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  featured_image_url: string | null
  category_id: string | null
  author_id: string | null
  status: "draft" | "published"
  published_at: string | null
  seo_title: string | null
  meta_description: string | null
  view_count: number
  created_at: string
  updated_at: string
}

export const blogRepo = {
  async list(params: PaginationParams) {
    let query = supabaseAdmin.from("blog_posts").select("*, blog_categories(id, name, slug)", { count: "exact" })
    if (params.search) query = query.ilike("title", `%${params.search}%`)
    if (params.filter?.category_id) query = query.eq("category_id", params.filter.category_id)
    if (params.filter?.status) query = query.eq("status", params.filter.status)
    const sortCol = params.sort_by || "created_at"
    const sortDir = params.sort_order || "desc"
    query = query.order(sortCol, { ascending: sortDir === "asc" })
    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)
    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch posts: ${error.message}`)
    return { data: (data || []) as BlogPostRow[], total: count || 0, page: params.page, limit: params.limit }
  },

  async getById(id: string) {
    const { data, error } = await supabaseAdmin.from("blog_posts").select("*").eq("id", id).single()
    if (error) throw new Error(`Post not found: ${error.message}`)
    return data as BlogPostRow
  },

  async create(post: { title: string; slug: string; excerpt?: string; content?: string; featured_image_url?: string; category_id?: string; author_id?: string; status?: string; published_at?: string; seo_title?: string; meta_description?: string }) {
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
    const { data, error } = await supabaseAdmin.from("blog_categories").select("id, name, slug").order("name")
    if (error) throw new Error(`Failed to fetch categories: ${error.message}`)
    return (data || [])
  },

  // Public methods — published posts only
  async listPublished(params: { page: number; limit: number; category_id?: string }) {
    let query = supabaseAdmin
      .from("blog_posts")
      .select("*, blog_categories(id, name, slug)", { count: "exact" })
      .eq("status", "published")
      .not("published_at", "is", null)
    if (params.category_id) query = query.eq("category_id", params.category_id)
    query = query.order("published_at", { ascending: false })
    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)
    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch published posts: ${error.message}`)
    return { data: data || [], total: count || 0, page: params.page, limit: params.limit }
  },

  async getPublishedBySlug(slug: string) {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*, blog_categories(id, name, slug)")
      .eq("slug", slug)
      .eq("status", "published")
      .not("published_at", "is", null)
      .single()
    if (error) throw new Error(`Post not found: ${error.message}`)
    // Increment view count
    await supabaseAdmin
      .from("blog_posts")
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq("id", data.id)
    return data as BlogPostRow & { blog_categories?: { id: string; name: string; slug: string } | null }
  },

  async getRelatedPosts(categoryId: string, excludeId: string, limit = 3) {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("id, title, slug, excerpt, featured_image_url, published_at, blog_categories(id, name, slug)")
      .eq("status", "published")
      .eq("category_id", categoryId)
      .neq("id", excludeId)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(limit)
    if (error) throw new Error(`Failed to fetch related posts: ${error.message}`)
    return data || []
  },

  async getLatestPublished(limit = 3) {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("id, title, slug, excerpt, featured_image_url, published_at, blog_categories(id, name, slug)")
      .eq("status", "published")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(limit)
    if (error) throw new Error(`Failed to fetch latest posts: ${error.message}`)
    return data || []
  },

  async listPublishedSlugs() {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("slug, published_at, updated_at")
      .eq("status", "published")
      .not("published_at", "is", null)
    if (error) throw new Error(`Failed to fetch post slugs: ${error.message}`)
    return data || []
  },
}
