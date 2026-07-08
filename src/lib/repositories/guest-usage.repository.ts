import { supabaseAdmin } from "@/lib/supabase/admin"

function hashId(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    const chr = id.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return Math.abs(hash).toString(16)
}

export const guestUsageRepo = {
  async getDailyCount(guestId: string, toolSlug: string): Promise<number> {
    const today = new Date().toISOString().split("T")[0]
    const ipHash = hashId(guestId)
    const { data, error } = await supabaseAdmin
      .from("guest_usage")
      .select("usage_count")
      .eq("ip_hash", ipHash)
      .eq("tool_slug", toolSlug)
      .eq("usage_date", today)
      .maybeSingle()

    if (error || !data) {
      if (error) console.error("Failed to check guest usage:", error)
      return 0
    }
    return data.usage_count ?? 0
  },

  async log(data: {
    guestId: string
    toolSlug: string
  }) {
    const today = new Date().toISOString().split("T")[0]
    const ipHash = hashId(data.guestId)
    const { data: existing } = await supabaseAdmin
      .from("guest_usage")
      .select("usage_count")
      .eq("ip_hash", ipHash)
      .eq("tool_slug", data.toolSlug)
      .eq("usage_date", today)
      .maybeSingle()

    if (existing) {
      await supabaseAdmin
        .from("guest_usage")
        .update({ usage_count: (existing.usage_count ?? 0) + 1 })
        .eq("ip_hash", ipHash)
        .eq("tool_slug", data.toolSlug)
        .eq("usage_date", today)
    } else {
      await supabaseAdmin.from("guest_usage").insert({
        ip_hash: ipHash,
        tool_slug: data.toolSlug,
        usage_date: today,
        usage_count: 1,
      })
    }
  },
}
