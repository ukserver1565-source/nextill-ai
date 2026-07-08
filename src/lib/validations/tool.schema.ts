import { z } from "zod"

export const createToolSchema = z.object({
  tool_slug: z.string().min(2).max(100),
  tool_name: z.string().min(2).max(100),
  is_enabled: z.boolean().default(true),
  guest_daily_limit: z.number().int().min(0).default(0),
  free_daily_limit: z.number().int().min(0).default(5),
  premium_daily_limit: z.number().int().min(0).default(100),
  credits_cost: z.number().int().min(0).default(1),
  default_model: z.string().optional(),
  prompt_template: z.string().optional(),
})

export const updateToolSchema = createToolSchema.partial()

export type CreateToolInput = z.infer<typeof createToolSchema>
export type UpdateToolInput = z.infer<typeof updateToolSchema>
