import { supabaseAdmin } from "@/lib/supabase/admin"

export interface PlanRow {
  id: string
  name: string
  slug: string
  price: number
  currency: string
  monthly_credits: number
  tool_access: string[]
  max_projects: number
  max_users: number
  priority: string
  enabled: boolean
  description: string
  created_at: string
}

export const planRepo = {
  async list() {
    const { data, error } = await supabaseAdmin.from("plans").select("*").order("price", { ascending: true })
    if (error) throw new Error(`Failed to fetch plans: ${error.message}`)
    return data as PlanRow[]
  },

  async getById(id: string) {
    const { data, error } = await supabaseAdmin.from("plans").select("*").eq("id", id).single()
    if (error) throw new Error(`Plan not found: ${error.message}`)
    return data as PlanRow
  },

  async create(plan: Omit<PlanRow, "created_at">) {
    const { data, error } = await supabaseAdmin.from("plans").insert(plan).select().single()
    if (error) throw new Error(`Failed to create plan: ${error.message}`)
    return data as PlanRow
  },

  async update(id: string, updates: Partial<PlanRow>) {
    const { data, error } = await supabaseAdmin.from("plans").update(updates).eq("id", id).select().single()
    if (error) throw new Error(`Failed to update plan: ${error.message}`)
    return data as PlanRow
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin.from("plans").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete plan: ${error.message}`)
  },
}
