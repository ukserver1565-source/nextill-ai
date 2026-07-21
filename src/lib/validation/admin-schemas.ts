import { z } from "zod"

export const userRoleSchema = z.enum(["free_user", "admin", "super_admin"])
export const userPlanSchema = z.enum(["free", "starter", "pro", "agency", "enterprise"])
export const userStatusSchema = z.enum(["active", "suspended", "inactive"])
export const paymentStatusSchema = z.enum(["pending", "completed", "failed", "refunded"])
export const blogStatusSchema = z.enum(["draft", "published"])
export const couponTypeSchema = z.enum(["percentage", "fixed"])

export const updateUserSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: userRoleSchema.optional(),
  plan: userPlanSchema.optional(),
  status: userStatusSchema.optional(),
  credits: z.number().int().min(0).optional(),
})

export const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50),
  price_monthly: z.number().min(0),
  price_yearly: z.number().min(0).optional(),
  credits: z.number().int().min(0),
  features: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
})

export const updatePlanSchema = createPlanSchema.partial()

export const createCouponSchema = z.object({
  code: z.string().min(3).max(50),
  discount_type: couponTypeSchema,
  discount_value: z.number().min(0),
  usage_limit: z.number().int().min(0).default(0),
  expires_at: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
})

export const createBlogPostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  featured_image_url: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  author_id: z.string().nullable().optional(),
  status: blogStatusSchema.default("draft"),
  published_at: z.string().nullable().optional(),
  seo_title: z.string().max(200).optional(),
  meta_description: z.string().max(300).optional(),
  view_count: z.number().int().min(0).optional(),
})

export const updateBlogPostSchema = createBlogPostSchema.partial()

export const addCreditsSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().positive(),
  description: z.string().optional(),
})

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  domain: z.string().optional(),
  user_id: z.string().uuid().optional(),
})

export const updateToolSchema = z.object({
  is_enabled: z.boolean().optional(),
  guest_daily_limit: z.number().int().min(0).optional(),
  free_daily_limit: z.number().int().min(0).optional(),
  premium_daily_limit: z.number().int().min(0).optional(),
  credits_cost: z.number().int().min(0).optional(),
  default_model: z.string().optional(),
  prompt_template: z.string().optional(),
})

export const updateModelSchema = z.object({
  model_name: z.string().optional(),
  is_enabled: z.boolean().optional(),
  is_default: z.boolean().optional(),
  cost_input: z.number().min(0).optional(),
  cost_output: z.number().min(0).optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().min(1).optional(),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).optional(),
  filter: z.record(z.string(), z.string()).optional(),
})

export type PaginationParams = z.infer<typeof paginationSchema>
