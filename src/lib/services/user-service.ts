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

  async create(data: { email: string; name?: string; password?: string; role?: string; plan?: string; plan_id?: string }) {
    // Generate a temporary password if none provided
    const tempPassword = data.password || `Temp${Date.now()}!${Math.random().toString(36).slice(2, 8)}`

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
    })
    if (authError) throw new Error(`Failed to create auth user: ${authError.message}`)
    const userId = authUser.user.id

    // Set user metadata (full_name) on the auth user
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { full_name: data.name || "" },
    })

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      user_id: userId,
      email: data.email,
      full_name: data.name || null,
      role: data.role === "user" ? "free_user" : (data.role || "free_user"),
      plan: data.plan || data.plan_id || "free",
      credits: 0,
      status: "active",
    }, { onConflict: "user_id" })
    if (profileError) throw new Error(`Failed to create profile: ${profileError.message}`)

    // Create subscription row
    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1)
    try {
      await supabaseAdmin.from("subscriptions").insert({
        user_id: userId,
        plan_slug: data.plan || data.plan_id || "free",
        status: "active",
        billing_cycle: "monthly",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
    } catch { /* non-critical */ }

    // Create credits row
    try {
      await supabaseAdmin.from("credits").insert({
        user_id: userId,
        balance: 0,
      })
    } catch { /* non-critical */ }

    return { id: userId, email: data.email, tempPassword }
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
