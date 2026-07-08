import { z } from "zod"

export const updateSiteSettingSchema = z.object({
  value: z.any(),
})

export type UpdateSiteSettingInput = z.infer<typeof updateSiteSettingSchema>
