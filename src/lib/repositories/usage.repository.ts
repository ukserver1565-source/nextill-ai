import { supabaseAdmin } from "@/lib/supabase/admin"

export const usageRepo = {
  async log(data: {
    userId?: string | null
    guestId?: string | null
    toolSlug: string
    creditsUsed: number
    inputChars: number
    outputChars: number
  }) {
    const { error } = await supabaseAdmin.from("usage_logs").insert({
      user_id: data.userId ?? null,
      guest_id: data.guestId ?? null,
      tool_slug: data.toolSlug,
      credits_used: data.creditsUsed,
      input_chars: data.inputChars,
      output_chars: data.outputChars,
    })
    if (error) console.error("Failed to log usage:", error)
  },
}
