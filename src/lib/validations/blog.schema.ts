import { z } from "zod"

export const createBlogCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
})

export const createBlogPostSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(500),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  category_id: z.string().uuid().nullable().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  seo_title: z.string().max(200).optional(),
  meta_description: z.string().max(500).optional(),
})

export const updateBlogPostSchema = createBlogPostSchema.partial()

export type CreateBlogCategoryInput = z.infer<typeof createBlogCategorySchema>
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>
