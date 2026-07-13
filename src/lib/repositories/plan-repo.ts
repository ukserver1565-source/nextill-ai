import { supabaseAdmin } from "@/lib/supabase/admin"

export interface PlanRow {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_yearly: number
  credits: number
  features: unknown
  is_active: boolean
  created_at: string
}

export const planRepo = {
  async list() {
    const { data, error } = await supabaseAdmin.from("plans").select("*").order("price_monthly", { ascending: true })
    if (error) throw new Error(`Failed to fetch plans: ${error.message}`)
    return (data || []) as PlanRow[]
  },

  async getById(id: string) {
    const { data, error } = await supabaseAdmin.from("plans").select("*").eq("id", id).single()
    if (error) throw new Error(`Plan not found: ${error.message}`)
    return data as PlanRow
  },

  async create(plan: { name: string; slug: string; price_monthly: number; price_yearly?: number; credits: number; features?: unknown; is_active?: boolean }) {
    const { data, error } = await supabaseAdmin.from("plans").insert({
      name: plan.name,
      slug: plan.slug,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly ?? plan.price_monthly * 10,
      credits: plan.credits,
      features: plan.features || [],
      is_active: plan.is_active ?? true,
    }).select().single()
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
