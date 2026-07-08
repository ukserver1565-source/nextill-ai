import { supabaseAdmin } from "@/lib/supabase/admin"
import { NotFoundError } from "@/lib/errors"
import type { CreateCouponInput, UpdateCouponInput } from "@/lib/validations/coupon.schema"

export interface CouponRow {
  id: string
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  usage_limit: number
  used_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export const couponsRepo = {
  async list() {
    const { data, error } = await supabaseAdmin.from("coupons").select("*").order("created_at", { ascending: false })
    if (error) throw new Error(`Failed to fetch coupons: ${error.message}`)
    return data as CouponRow[]
  },

  async create(data: CreateCouponInput) {
    const { data: coupon, error } = await supabaseAdmin.from("coupons").insert(data).select().single()
    if (error) throw new Error(`Failed to create coupon: ${error.message}`)
    return coupon as CouponRow
  },

  async update(id: string, updates: UpdateCouponInput) {
    const { data, error } = await supabaseAdmin.from("coupons").update(updates).eq("id", id).select().single()
    if (error) throw new Error(`Failed to update coupon: ${error.message}`)
    return data as CouponRow
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin.from("coupons").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete coupon: ${error.message}`)
  },
}
