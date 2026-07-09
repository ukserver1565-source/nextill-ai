import { supabaseAdmin } from "@/lib/supabase/admin"

export interface AuditLogEntry {
  id: string
  action: string
  details: Record<string, any>
  user_id: string | null
  ip_address: string | null
  created_at: string
}

export interface SystemLogEntry {
  id: string
  level: "info" | "warn" | "error" | "debug"
  message: string
  source: string | null
  metadata: Record<string, any> | null
  created_at: string
}

export const auditService = {
  async log(action: string, details: Record<string, any>, userId?: string) {
    const { error } = await supabaseAdmin.from("admin_logs").insert({
      action,
      details: details || {},
      user_id: userId || null,
      created_at: new Date().toISOString(),
    })
    if (error) console.error("Failed to create audit log:", error.message)
  },

  async list(page = 1, perPage = 20): Promise<{ data: AuditLogEntry[]; total: number; page: number; perPage: number }> {
    const from = (page - 1) * perPage
    const { data, error, count } = await supabaseAdmin
      .from("admin_logs")
      .select("*, profiles:user_id(full_name, email)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + perPage - 1)
    if (error) throw new Error(`Failed to fetch audit logs: ${error.message}`)
    return { data: (data || []) as AuditLogEntry[], total: count || 0, page, perPage }
  },

  async getByUser(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("admin_logs")
      .select("*, profiles:user_id(full_name, email)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (error) throw new Error(`Failed to fetch audit logs for user: ${error.message}`)
    return (data || []) as AuditLogEntry[]
  },

  async systemLog(level: "info" | "warn" | "error" | "debug", message: string, source?: string, metadata?: Record<string, any>) {
    const { error } = await supabaseAdmin.from("system_logs").insert({
      level,
      message,
      source: source || null,
      metadata: metadata || null,
    })
    if (error) console.error("Failed to create system log:", error.message)
  },

  async systemLogs(page = 1, perPage = 20, level?: string): Promise<{ data: SystemLogEntry[]; total: number; page: number; perPage: number }> {
    let query = supabaseAdmin
      .from("system_logs")
      .select("*", { count: "exact" })
    if (level) query = query.eq("level", level)
    query = query.order("created_at", { ascending: false })
    const from = (page - 1) * perPage
    query = query.range(from, from + perPage - 1)
    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch system logs: ${error.message}`)
    return { data: (data || []) as SystemLogEntry[], total: count || 0, page, perPage }
  },
}
