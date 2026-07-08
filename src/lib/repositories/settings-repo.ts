import { supabaseAdmin } from "@/lib/supabase/admin"

export interface SiteSettingsRow {
  id: string
  site_name: string
  logo: string | null
  favicon: string | null
  primary_color: string
  free_daily_limits: number
  maintenance_mode: boolean
  maintenance_message: string | null
  contact_email: string | null
  social_links: any
  seo_meta_defaults: any
}

export const settingsRepo = {
  async get() {
    const { data, error } = await supabaseAdmin.from("site_settings").select("*").eq("id", "default").single()
    if (error) throw new Error(`Failed to fetch settings: ${error.message}`)
    return data as SiteSettingsRow
  },

  async update(updates: Partial<SiteSettingsRow>) {
    const { data, error } = await supabaseAdmin.from("site_settings").update(updates).eq("id", "default").select().single()
    if (error) throw new Error(`Failed to update settings: ${error.message}`)
    return data as SiteSettingsRow
  },
}
