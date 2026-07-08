import { z } from "zod"

export const createDocumentSchema = z.object({
  project_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(500),
  content: z.string().optional(),
  tool_slug: z.string().optional(),
})

export const updateDocumentSchema = createDocumentSchema.partial()

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>
