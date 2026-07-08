import { z } from "zod"

export const createContactMessageSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(5000),
})

export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>
