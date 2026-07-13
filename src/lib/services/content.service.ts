import { projectRepo } from "@/lib/repositories/project-repo"
import { blogRepo } from "@/lib/repositories/blog-repo"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validation/admin-schemas"
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validations/project.schema"
import type { CreateDocumentInput, UpdateDocumentInput } from "@/lib/validations/document.schema"
import type { CreateBlogPostInput, UpdateBlogPostInput } from "@/lib/validations/blog.schema"

export const contentService = {
  // Projects
  async getProjects(userId: string, params: PaginationParams) {
    const result = await projectRepo.list(params)
    const filtered = result.data.filter((p: any) => p.user_id === userId)
    return { data: filtered, total: filtered.length, page: params.page, limit: params.limit }
  },
  async getAllProjects(params: PaginationParams) {
    return projectRepo.list(params)
  },
  async getProject(id: string) {
    try {
      return await projectRepo.getById(id)
    } catch {
      return null
    }
  },
  async createProject(userId: string, data: CreateProjectInput) {
    return projectRepo.create({ user_id: userId, name: data.name, domain: data.domain })
  },
  async updateProject(id: string, data: UpdateProjectInput) {
    return projectRepo.update(id, data)
  },
  async deleteProject(id: string) {
    return projectRepo.delete(id)
  },
  // Documents
  async getDocuments(userId: string, params: PaginationParams) {
    const { data, error, count } = await supabaseAdmin
      .from("documents")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range((params.page - 1) * params.limit, params.page * params.limit - 1)
    if (error) throw new Error(`Failed to fetch documents: ${error.message}`)
    return { data: data || [], total: count || 0, page: params.page, limit: params.limit }
  },
  async getAllDocuments(params: PaginationParams) {
    const { data, error, count } = await supabaseAdmin
      .from("documents")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((params.page - 1) * params.limit, params.page * params.limit - 1)
    if (error) throw new Error(`Failed to fetch documents: ${error.message}`)
    return { data: data || [], total: count || 0, page: params.page, limit: params.limit }
  },
  async getDocument(id: string) {
    const { data, error } = await supabaseAdmin.from("documents").select("*").eq("id", id).single()
    if (error) throw new Error(`Document not found: ${error.message}`)
    return data
  },
  async createDocument(userId: string, data: CreateDocumentInput) {
    const { data: doc, error } = await supabaseAdmin.from("documents").insert({
      user_id: userId, ...data,
    }).select().single()
    if (error) throw new Error(`Failed to create document: ${error.message}`)
    return doc
  },
  async updateDocument(id: string, data: UpdateDocumentInput) {
    const { data: doc, error } = await supabaseAdmin.from("documents").update(data).eq("id", id).select().single()
    if (error) throw new Error(`Failed to update document: ${error.message}`)
    return doc
  },
  async deleteDocument(id: string) {
    const { error } = await supabaseAdmin.from("documents").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete document: ${error.message}`)
  },
  // Blog
  async getPosts(params: PaginationParams) {
    return blogRepo.list(params)
  },
  async getPublishedPosts(params: PaginationParams) {
    return blogRepo.list({ ...params, filter: { ...params.filter, status: "published" } })
  },
  async getPost(id: string) {
    return blogRepo.getById(id)
  },
  async createPost(data: CreateBlogPostInput) {
    return blogRepo.create(data as any)
  },
  async updatePost(id: string, data: UpdateBlogPostInput) {
    return blogRepo.update(id, data)
  },
  async deletePost(id: string) {
    return blogRepo.delete(id)
  },
  async getCategories() {
    return blogRepo.listCategories()
  },
}
