import { supabaseAdmin } from "@/lib/supabase/admin"
import { NotFoundError } from "@/lib/errors"
import type { PaginationParams } from "@/lib/validations/pagination.schema"
import type {
  CreateBlogPostInput, UpdateBlogPostInput, CreateBlogCategoryInput,
} from "@/lib/validations/blog.schema"

export interface BlogPostRow {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  category_id: string | null
  status: "draft" | "published"
  seo_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  blog_categories?: { name: string; slug: string }
}

export interface BlogCategoryRow {
  id: string
  name: string
  slug: string
  created_at: string
}

export const blogRepo = {
  async listPosts(params: PaginationParams) {
    let query = supabaseAdmin
      .from("blog_posts")
      .select("*, blog_categories(name,slug)", { count: "exact" })

    if (params.search) {
      query = query.ilike("title", `%${params.search}%`)
    }
    if (params.filter?.status) {
      query = query.eq("status", params.filter.status)
    }
    if (params.filter?.category_id) {
      query = query.eq("category_id", params.filter.category_id)
    }

    const sortCol = params.sort_by || "created_at"
    const sortDir = params.sort_order || "desc"
    query = query.order(sortCol, { ascending: sortDir === "asc" })

    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch posts: ${error.message}`)
    return { data: data as BlogPostRow[], total: count || 0, page: params.page, limit: params.limit }
  },

  async listPublishedPosts(params: PaginationParams) {
    let query = supabaseAdmin
      .from("blog_posts")
      .select("*, blog_categories(name,slug)", { count: "exact" })
      .eq("status", "published")

    if (params.search) {
      query = query.ilike("title", `%${params.search}%`)
    }
    if (params.filter?.category_id) {
      query = query.eq("category_id", params.filter.category_id)
    }

    query = query.order("created_at", { ascending: false })

    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)

    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch published posts: ${error.message}`)
    return { data: data as BlogPostRow[], total: count || 0, page: params.page, limit: params.limit }
  },

  async getPostById(id: string) {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*, blog_categories(name,slug)")
      .eq("id", id)
      .single()
    if (error) throw new NotFoundError("Blog post")
    return data as BlogPostRow
  },

  async createPost(data: CreateBlogPostInput) {
    const { data: post, error } = await supabaseAdmin.from("blog_posts").insert(data).select().single()
    if (error) throw new Error(`Failed to create post: ${error.message}`)
    return post as BlogPostRow
  },

  async updatePost(id: string, updates: UpdateBlogPostInput) {
    const { data, error } = await supabaseAdmin.from("blog_posts").update(updates).eq("id", id).select().single()
    if (error) throw new Error(`Failed to update post: ${error.message}`)
    return data as BlogPostRow
  },

  async deletePost(id: string) {
    const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete post: ${error.message}`)
  },

  async listCategories() {
    const { data, error } = await supabaseAdmin.from("blog_categories").select("*").order("name")
    if (error) throw new Error(`Failed to fetch categories: ${error.message}`)
    return data as BlogCategoryRow[]
  },

  async createCategory(data: CreateBlogCategoryInput) {
    const { data: category, error } = await supabaseAdmin.from("blog_categories").insert(data).select().single()
    if (error) throw new Error(`Failed to create category: ${error.message}`)
    return category as BlogCategoryRow
  },
}
