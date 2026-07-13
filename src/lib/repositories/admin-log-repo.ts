import { supabaseAdmin } from "@/lib/supabase/admin"

export const adminLogRepo = {
  async log(adminUserId: string, action: string, targetType: string, targetId?: string, metadata?: Record<string, unknown>) {
    const { error } = await supabaseAdmin.from("admin_logs").insert({
      admin_user_id: adminUserId,
      action,
      target_type: targetType,
      target_id: targetId,
      metadata: metadata || {},
    })
    if (error) console.error("Failed to log admin action:", error.message)
  },
}
