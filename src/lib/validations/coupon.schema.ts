import { z } from "zod"

export const createCouponSchema = z.object({
  code: z.string().min(3).max(50),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number().min(0),
  usage_limit: z.number().int().min(0).default(0),
  expires_at: z.string().datetime().nullable().optional(),
  is_active: z.boolean().default(true),
})

export const updateCouponSchema = createCouponSchema.partial()

export type CreateCouponInput = z.infer<typeof createCouponSchema>
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>
