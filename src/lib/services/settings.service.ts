import { settingsRepo } from "@/lib/repositories/settings-repo"
import { contactRepo } from "@/lib/repositories/contact-repo"
import { couponRepo } from "@/lib/repositories/coupon-repo"
import { adminLogRepo } from "@/lib/repositories/admin-log-repo"
import type { PaginationParams } from "@/lib/validation/admin-schemas"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const settingsService = {
  async getSettings() {
    return settingsRepo.getAll()
  },
  async updateSetting(key: string, value: unknown) {
    return settingsRepo.set(key, value)
  },
  async getContactMessages(params: PaginationParams) {
    return contactRepo.list(params)
  },
  async createContactMessage(data: { name: string; email: string; subject: string; message: string }) {
    const { error } = await supabaseAdmin.from("contact_messages").insert(data)
    if (error) throw new Error(`Failed to create message: ${error.message}`)
  },
  async markContactAsRead(id: string) {
    return contactRepo.markAsRead(id)
  },
  async deleteContactMessage(id: string) {
    return contactRepo.delete(id)
  },
  async getCoupons() {
    return couponRepo.list()
  },
  async createCoupon(data: { code: string; discount_type: "percentage" | "fixed"; discount_value: number; usage_limit?: number; expires_at?: string; is_active?: boolean }) {
    return couponRepo.create(data)
  },
  async updateCoupon(id: string, data: Record<string, unknown>) {
    return couponRepo.update(id, data)
  },
  async deleteCoupon(id: string) {
    return couponRepo.delete(id)
  },
  async logAdminAction(adminUserId: string, action: string, targetType?: string, targetId?: string, metadata?: Record<string, unknown>) {
    await adminLogRepo.log(adminUserId, action, targetType || "", targetId, metadata)
  },
}
