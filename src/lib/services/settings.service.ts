import { settingsRepo } from "@/lib/repositories/settings-repo"
import { contactRepo } from "@/lib/repositories/contact-repo"
import { couponRepo } from "@/lib/repositories/coupon-repo"
import { adminLogRepo } from "@/lib/repositories/admin-log-repo"
import type { PaginationParams } from "@/lib/validation/admin-schemas"
import type { CreateContactMessageInput } from "@/lib/validations/contact.schema"
import type { CreateCouponInput, UpdateCouponInput } from "@/lib/validations/coupon.schema"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const settingsService = {
  async getSettings() {
    return settingsRepo.get()
  },
  async updateSetting(key: string, value: any) {
    return settingsRepo.update({ [key]: value })
  },
  async getContactMessages(params: PaginationParams) {
    return contactRepo.list(params)
  },
  async createContactMessage(data: CreateContactMessageInput) {
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
  async createCoupon(data: CreateCouponInput) {
    return couponRepo.create(data as any)
  },
  async updateCoupon(id: string, data: UpdateCouponInput) {
    return couponRepo.update(id, data)
  },
  async deleteCoupon(id: string) {
    return couponRepo.delete(id)
  },
  async logAdminAction(adminUserId: string, action: string, targetType?: string, targetId?: string, metadata?: Record<string, any>) {
    await adminLogRepo.log(adminUserId, action, targetType || "", targetId, metadata)
  },
}
