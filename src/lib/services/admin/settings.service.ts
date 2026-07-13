import { supabaseAdmin } from "@/lib/supabase/admin"

export interface SiteSettingRow {
  id: string
  key: string
  value: unknown
  category: string | null
  description: string | null
  updated_at: string
}

export const adminSettingsService = {
  async getAll(): Promise<Record<string, unknown>> {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .order("key", { ascending: true })
    if (error) throw new Error(`Failed to fetch settings: ${error.message}`)
    const map: Record<string, unknown> = {}
    for (const row of data || []) {
      map[row.key] = row.value
    }
    return map
  },

  async get(key: string) {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .eq("key", key)
      .maybeSingle()
    if (error) throw new Error(`Failed to fetch setting: ${error.message}`)
    if (!data) return null
    return data.value
  },

  async set(key: string, value: unknown) {
    const jsonValue = typeof value === "string" ? value : JSON.stringify(value)
    const { data: existing } = await supabaseAdmin
      .from("site_settings")
      .select("id")
      .eq("key", key)
      .maybeSingle()
    if (existing) {
      const { data: updated, error } = await supabaseAdmin
        .from("site_settings")
        .update({ value: jsonValue, updated_at: new Date().toISOString() })
        .eq("key", key)
        .select()
        .single()
      if (error) throw new Error(`Failed to update setting: ${error.message}`)
      return updated as SiteSettingRow
    }
    const { data: created, error } = await supabaseAdmin
      .from("site_settings")
      .insert({ key, value: jsonValue, category: "general" })
      .select()
      .single()
    if (error) throw new Error(`Failed to create setting: ${error.message}`)
    return created as SiteSettingRow
  },

  async setBulk(settings: Record<string, unknown>) {
    const results: SiteSettingRow[] = []
    for (const [key, value] of Object.entries(settings)) {
      const result = await this.set(key, value)
      results.push(result)
    }
    return results
  },

  async getByCategory(category: string) {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .eq("category", category)
      .order("key", { ascending: true })
    if (error) throw new Error(`Failed to fetch settings by category: ${error.message}`)
    const map: Record<string, unknown> = {}
    for (const row of data || []) {
      map[row.key] = row.value
    }
    return map
  },
}
