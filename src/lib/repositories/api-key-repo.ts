import { supabaseAdmin } from "@/lib/supabase/admin"

export interface ApiKeyRow {
  id: string
  user_id: string
  key_hash: string
  name: string
  last_used_at: string | null
  created_at: string
}

export const apiKeyRepo = {
  async listAll() {
    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .select("*, profiles!inner(full_name, email)")
      .order("created_at", { ascending: false })
    if (error) throw new Error(`Failed to fetch API keys: ${error.message}`)
    return data as any[]
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin.from("api_keys").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete API key: ${error.message}`)
  },
}
