import { z } from "zod"

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  avatar_url: z.string().url().nullable().optional(),
})

export const updateProfileRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["user", "admin", "super_admin"]),
  plan: z.enum(["free", "starter", "pro", "agency", "enterprise"]).optional(),
  status: z.enum(["active", "suspended", "inactive"]).optional(),
  credits: z.number().int().min(0).optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type UpdateProfileRoleInput = z.infer<typeof updateProfileRoleSchema>
