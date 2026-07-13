import { profileRepo, type ProfileRow } from "@/lib/repositories/profile-repo"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validation/admin-schemas"

export const userService = {
  async list(params: PaginationParams) {
    return profileRepo.list(params)
  },

  async getById(id: string) {
    return profileRepo.getById(id)
  },

  async update(id: string, updates: Partial<ProfileRow>) {
    return profileRepo.update(id, updates)
  },

  async delete(id: string) {
    const { data: projects } = await supabaseAdmin.from("projects").select("id").eq("user_id", id)
    if (projects && projects.length > 0) {
      await supabaseAdmin.from("projects").delete().eq("user_id", id)
    }
    await supabaseAdmin.auth.admin.deleteUser(id)
    await profileRepo.delete(id)
  },

  async create(data: { email: string; name?: string; role?: string; plan_id?: string }) {
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      email_confirm: true,
    })
    if (authError) throw new Error(`Failed to create auth user: ${authError.message}`)
    const userId = authUser.user.id

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      user_id: userId,
      email: data.email,
      full_name: data.name || null,
      role: data.role || "free_user",
      plan: data.plan_id || "free",
      credits: 0,
      status: "active",
    })
    if (profileError) throw new Error(`Failed to create profile: ${profileError.message}`)

    return { id: userId, email: data.email }
  },

  async addCredits(userId: string, amount: number, description?: string) {
    const { error } = await supabaseAdmin.rpc("add_credits", {
      p_user_id: userId,
      p_amount: amount,
    })
    if (error) throw new Error(`Failed to add credits: ${error.message}`)

    await supabaseAdmin.from("credit_logs").insert({
      user_id: userId,
      amount,
      type: "added",
      reason: description || null,
    })
  },

  async getStats() {
    return profileRepo.getStats()
  },
}
