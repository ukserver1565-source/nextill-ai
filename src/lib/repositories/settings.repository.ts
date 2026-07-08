import { supabaseAdmin } from "@/lib/supabase/admin"

export interface SiteSettingRow {
  id: string
  key: string
  value: any
  updated_at: string
}

export const settingsRepo = {
  async get(key: string) {
    const { data, error } = await supabaseAdmin.from("site_settings").select("value").eq("key", key).single()
    if (error) throw new Error(`Failed to fetch setting "${key}": ${error.message}`)
    return data.value
  },

  async getAll() {
    const { data, error } = await supabaseAdmin.from("site_settings").select("key, value")
    if (error) throw new Error(`Failed to fetch settings: ${error.message}`)

    const result: Record<string, any> = {}
    for (const row of data || []) {
      result[row.key] = row.value
    }
    return result
  },

  async set(key: string, value: any) {
    const { error } = await supabaseAdmin.from("site_settings").upsert({ key, value }, { onConflict: "key" })
    if (error) throw new Error(`Failed to set setting "${key}": ${error.message}`)
  },
}
