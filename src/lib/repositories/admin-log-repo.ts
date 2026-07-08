import { supabaseAdmin } from "@/lib/supabase/admin"

export const adminLogRepo = {
  async log(adminId: string, action: string, entity: string, entityId?: string, details?: Record<string, any>) {
    const { error } = await supabaseAdmin.from("admin_logs").insert({
      admin_id: adminId,
      action,
      entity,
      entity_id: entityId,
      details: details || {},
    })
    if (error) console.error("Failed to log admin action:", error.message)
  },
}
