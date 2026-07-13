import { supabaseAdmin } from "@/lib/supabase/admin"

export interface SiteSettingsRow {
  id: string
  key: string
  value: unknown
  category: string | null
  description: string | null
  updated_at: string
}

export const settingsRepo = {
  async getAll(): Promise<Record<string, unknown>> {
    const { data, error } = await supabaseAdmin.from("site_settings").select("*").order("key")
    if (error) throw new Error(`Failed to fetch settings: ${error.message}`)
    const map: Record<string, unknown> = {}
    for (const row of data || []) {
      map[row.key] = row.value
    }
    return map
  },

  async get(key: string) {
    const { data, error } = await supabaseAdmin.from("site_settings").select("*").eq("key", key).maybeSingle()
    if (error) throw new Error(`Failed to fetch setting: ${error.message}`)
    return data?.value ?? null
  },

  async set(key: string, value: unknown) {
    const { data: existing } = await supabaseAdmin.from("site_settings").select("id").eq("key", key).maybeSingle()
    if (existing) {
      const { data, error } = await supabaseAdmin.from("site_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key).select().single()
      if (error) throw new Error(`Failed to update setting: ${error.message}`)
      return data as SiteSettingsRow
    }
    const { data, error } = await supabaseAdmin.from("site_settings").insert({ key, value }).select().single()
    if (error) throw new Error(`Failed to create setting: ${error.message}`)
    return data as SiteSettingsRow
  },
}
