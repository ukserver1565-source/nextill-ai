import { z } from "zod"

export const createPlanSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50),
  price_monthly: z.number().min(0),
  price_yearly: z.number().min(0),
  credits: z.number().int().min(0),
  features: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
})

export const updatePlanSchema = createPlanSchema.partial()

export type CreatePlanInput = z.infer<typeof createPlanSchema>
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>
