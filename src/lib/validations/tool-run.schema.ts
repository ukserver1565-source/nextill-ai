import { z } from "zod"

export const toolRunSchema = z.object({
  tool: z.string().min(1).max(100),
  input: z.record(z.string(), z.unknown()),
  settings: z.record(z.string(), z.unknown()).optional(),
})

export type ToolRunInput = z.infer<typeof toolRunSchema>

export const toolSaveSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  toolSlug: z.string().optional(),
})

export type ToolSaveInput = z.infer<typeof toolSaveSchema>
