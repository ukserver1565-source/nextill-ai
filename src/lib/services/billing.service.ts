import { paymentRepo } from "@/lib/repositories/payment-repo"
import { planRepo } from "@/lib/repositories/plan-repo"
import { creditRepo } from "@/lib/repositories/credit-repo"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validation/admin-schemas"

export const billingService = {
  async getPayments(userId: string, params: PaginationParams) {
    const result = await paymentRepo.list(params)
    const filtered = result.data.filter((p: any) => p.user_id === userId)
    return { data: filtered, total: filtered.length, page: params.page, limit: params.limit }
  },
  async getAllPayments(params: PaginationParams) {
    return paymentRepo.list(params)
  },
  async getPlans() {
    return planRepo.list()
  },
  async createPlan(data: any) {
    return planRepo.create(data)
  },
  async updatePlan(id: string, data: any) {
    return planRepo.update(id, data)
  },
  async deletePlan(id: string) {
    return planRepo.delete(id)
  },
  async getStats() {
    return paymentRepo.getStats()
  },
}
