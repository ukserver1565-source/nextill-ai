import { z } from "zod"

export const userRoleSchema = z.enum(["user", "admin", "super_admin"])
export const userPlanSchema = z.enum(["free", "starter", "pro", "agency", "enterprise"])
export const userStatusSchema = z.enum(["active", "suspended", "inactive"])
export const paymentStatusSchema = z.enum(["pending", "completed", "failed", "refunded"])
export const blogStatusSchema = z.enum(["draft", "published"])
export const couponTypeSchema = z.enum(["percentage", "fixed"])
export const toolNameSchema = z.enum([
  "ai_writer", "ai_humanizer", "ai_detector", "plagiarism_checker",
  "seo_title_generator", "meta_description_generator", "keyword_research",
  "website_audit", "rank_tracker", "backlink_analyzer",
])

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: userRoleSchema.optional(),
  plan_id: userPlanSchema.optional(),
  status: userStatusSchema.optional(),
  credits: z.number().int().min(0).optional(),
})

export const createPlanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  slug: userPlanSchema,
  price: z.number().min(0),
  currency: z.string().default("USD"),
  monthly_credits: z.number().int().min(0),
  tool_access: z.array(toolNameSchema),
  max_projects: z.number().int().min(1),
  max_users: z.number().int().min(1),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  enabled: z.boolean().default(true),
  description: z.string(),
})

export const updatePlanSchema = createPlanSchema.partial()

export const createCouponSchema = z.object({
  code: z.string().min(3).max(50),
  type: couponTypeSchema,
  value: z.number().min(0),
  expiry_date: z.string(),
  usage_limit: z.number().int().min(1),
  active: z.boolean().default(true),
})

export const createBlogPostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  category: z.string(),
  content: z.string().optional(),
  seo_title: z.string().max(200).optional(),
  meta_description: z.string().max(300).optional(),
  status: blogStatusSchema,
  author: z.string(),
  image_url: z.string().nullable().optional(),
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
  enabled: z.boolean().optional(),
  api_key_placeholder: z.string().optional(),
  fallback: z.boolean().optional(),
})

export const updateSettingsSchema = z.object({
  site_name: z.string().optional(),
  primary_color: z.string().optional(),
  free_daily_limits: z.number().int().min(0).optional(),
  maintenance_mode: z.boolean().optional(),
  maintenance_message: z.string().optional(),
  contact_email: z.string().email().optional(),
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
