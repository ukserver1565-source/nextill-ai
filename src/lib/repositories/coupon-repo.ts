import { supabaseAdmin } from "@/lib/supabase/admin"

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

export const couponRepo = {
  async list() {
    const { data, error } = await supabaseAdmin.from("coupons").select("*").order("created_at", { ascending: false })
    if (error) throw new Error(`Failed to fetch coupons: ${error.message}`)
    return (data || []) as CouponRow[]
  },

  async create(coupon: { code: string; discount_type: "percentage" | "fixed"; discount_value: number; usage_limit?: number; expires_at?: string; is_active?: boolean }) {
    const { data, error } = await supabaseAdmin.from("coupons").insert({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      usage_limit: coupon.usage_limit ?? 0,
      used_count: 0,
      expires_at: coupon.expires_at || null,
      is_active: coupon.is_active ?? true,
    }).select().single()
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
