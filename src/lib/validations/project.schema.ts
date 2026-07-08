import { z } from "zod"

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  domain: z.string().max(500).optional(),
})

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  domain: z.string().max(500).nullable().optional(),
  seo_score: z.number().int().min(0).max(100).optional(),
  pulse_score: z.number().int().min(0).max(100).optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
