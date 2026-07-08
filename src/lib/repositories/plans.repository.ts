import { supabaseAdmin } from "@/lib/supabase/admin"
import { NotFoundError } from "@/lib/errors"
import type { CreatePlanInput, UpdatePlanInput } from "@/lib/validations/plan.schema"

export interface PlanRow {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_yearly: number
  credits: number
  features: any
  is_active: boolean
  created_at: string
}

export const plansRepo = {
  async list() {
    const { data, error } = await supabaseAdmin.from("plans").select("*").order("price_monthly", { ascending: true })
    if (error) throw new Error(`Failed to fetch plans: ${error.message}`)
    return data as PlanRow[]
  },

  async getById(id: string) {
    const { data, error } = await supabaseAdmin.from("plans").select("*").eq("id", id).single()
    if (error) throw new NotFoundError("Plan")
    return data as PlanRow
  },

  async create(data: CreatePlanInput) {
    const { data: plan, error } = await supabaseAdmin.from("plans").insert(data).select().single()
    if (error) throw new Error(`Failed to create plan: ${error.message}`)
    return plan as PlanRow
  },

  async update(id: string, updates: UpdatePlanInput) {
    const { data, error } = await supabaseAdmin.from("plans").update(updates).eq("id", id).select().single()
    if (error) throw new Error(`Failed to update plan: ${error.message}`)
    return data as PlanRow
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin.from("plans").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete plan: ${error.message}`)
  },
}
