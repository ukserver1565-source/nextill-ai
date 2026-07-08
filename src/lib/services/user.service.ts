import { profileRepo, type ProfileRow } from "@/lib/repositories/profile-repo"
import { projectRepo } from "@/lib/repositories/project-repo"
import { creditRepo } from "@/lib/repositories/credit-repo"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validation/admin-schemas"

export const userService = {
  async list(params: PaginationParams) {
    return profileRepo.list(params)
  },
  async getById(id: string) {
    return profileRepo.getById(id)
  },
  async getByUserId(userId: string) {
    return profileRepo.getById(userId)
  },
  async update(userId: string, updates: Partial<ProfileRow>) {
    return profileRepo.update(userId, updates)
  },
  async delete(userId: string) {
    await supabaseAdmin.from("projects").delete().eq("user_id", userId)
    await supabaseAdmin.from("documents").delete().eq("user_id", userId)
    await supabaseAdmin.auth.admin.deleteUser(userId)
  },
  async addCredits(userId: string, amount: number, reason?: string) {
    await creditRepo.add(userId, amount, reason || "Manual credit addition")
  },
  async deductCredits(userId: string, amount: number, reason?: string) {
    await creditRepo.remove(userId, amount, reason || "Manual credit deduction")
  },
  async getCredits(userId: string) {
    const profile = await profileRepo.getById(userId)
    return profile.credits
  },
  async getStats() {
    return profileRepo.getStats()
  },
}
