import { supabaseAdmin } from "@/lib/supabase/admin"

export interface AppSettingRow {
  id: string
  key: string
  value: string
  type: "string" | "number" | "boolean" | "json"
  category: string
  description: string | null
  created_at: string
  updated_at: string
}

function coerceValue(value: any, type?: string): string {
  if (type === "json") return typeof value === "string" ? value : JSON.stringify(value)
  if (type === "boolean") return value ? "true" : "false"
  if (type === "number") return String(Number(value))
  return String(value)
}

function parseValue(value: string, type: string): any {
  switch (type) {
    case "number": return Number(value)
    case "boolean": return value === "true"
    case "json": return JSON.parse(value)
    default: return value
  }
}

export const adminSettingsService = {
  async getAll(): Promise<Record<string, any>> {
    const { data, error } = await supabaseAdmin
      .from("admin_settings")
      .select("*")
      .order("key", { ascending: true })
    if (error) throw new Error(`Failed to fetch settings: ${error.message}`)
    const map: Record<string, any> = {}
    for (const row of data || []) {
      try {
        map[row.key] = parseValue(row.value, row.type || "string")
      } catch {
        map[row.key] = row.value
      }
    }
    return map
  },

  async get(key: string) {
    const { data, error } = await supabaseAdmin
      .from("admin_settings")
      .select("*")
      .eq("key", key)
      .maybeSingle()
    if (error) throw new Error(`Failed to fetch setting: ${error.message}`)
    if (!data) return null
    try {
      return parseValue(data.value, data.type || "string")
    } catch {
      return data.value
    }
  },

  async set(key: string, value: any, type?: "string" | "number" | "boolean" | "json") {
    const resolvedType = type || (value === null || value === undefined ? "string" :
      typeof value === "boolean" ? "boolean" :
      typeof value === "number" ? "number" :
      typeof value === "object" ? "json" : "string")
    const stringValue = coerceValue(value, resolvedType)
    const { data: existing } = await supabaseAdmin
      .from("admin_settings")
      .select("id")
      .eq("key", key)
      .maybeSingle()
    if (existing) {
      const { data: updated, error } = await supabaseAdmin
        .from("admin_settings")
        .update({ value: stringValue, type: resolvedType, updated_at: new Date().toISOString() })
        .eq("key", key)
        .select()
        .single()
      if (error) throw new Error(`Failed to update setting: ${error.message}`)
      return updated as AppSettingRow
    }
    const { data: created, error } = await supabaseAdmin
      .from("admin_settings")
      .insert({ key, value: stringValue, type: resolvedType, category: "general" })
      .select()
      .single()
    if (error) throw new Error(`Failed to create setting: ${error.message}`)
    return created as AppSettingRow
  },

  async setBulk(settings: Record<string, any>) {
    const results: AppSettingRow[] = []
    for (const [key, value] of Object.entries(settings)) {
      const result = await this.set(key, value)
      results.push(result)
    }
    return results
  },

  async getByCategory(category: string) {
    const { data, error } = await supabaseAdmin
      .from("admin_settings")
      .select("*")
      .eq("category", category)
      .order("key", { ascending: true })
    if (error) throw new Error(`Failed to fetch settings by category: ${error.message}`)
    const map: Record<string, any> = {}
    for (const row of data || []) {
      try {
        map[row.key] = parseValue(row.value, row.type || "string")
      } catch {
        map[row.key] = row.value
      }
    }
    return map
  },
}
