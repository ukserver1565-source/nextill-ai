import { supabaseAdmin } from "@/lib/supabase/admin"

export interface CouponRow {
  id: string
  code: string
  type: "percentage" | "fixed"
  value: number
  expiry_date: string
  usage_limit: number
  usage_count: number
  active: boolean
  created_at: string
}

export const couponRepo = {
  async list() {
    const { data, error } = await supabaseAdmin.from("coupons").select("*").order("created_at", { ascending: false })
    if (error) throw new Error(`Failed to fetch coupons: ${error.message}`)
    return data as CouponRow[]
  },

  async create(coupon: Omit<CouponRow, "id" | "usage_count" | "created_at">) {
    const { data, error } = await supabaseAdmin.from("coupons").insert({ ...coupon, usage_count: 0 }).select().single()
    if (error) throw new Error(`Failed to create coupon: ${error.message}`)
    return data as CouponRow
  },

  async update(id: string, updates: Partial<CouponRow>) {
    const { data, error } = await supabaseAdmin.from("coupons").update(updates).eq("id", id).select().single()
    if (error) throw new Error(`Failed to update coupon: ${error.message}`)
    return data as CouponRow
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin.from("coupons").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete coupon: ${error.message}`)
  },
}
