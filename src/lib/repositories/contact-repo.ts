import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PaginationParams } from "@/lib/validation/admin-schemas"

export interface ContactRow {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  created_at: string
}

export const contactRepo = {
  async list(params: PaginationParams) {
    let query = supabaseAdmin.from("contact_messages").select("*", { count: "exact" })
    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,subject.ilike.%${params.search}%`)
    }
    if (params.filter?.read) {
      query = query.eq("read", params.filter.read === "true")
    }
    query = query.order("created_at", { ascending: false })
    const from = (params.page - 1) * params.limit
    query = query.range(from, from + params.limit - 1)
    const { data, error, count } = await query
    if (error) throw new Error(`Failed to fetch messages: ${error.message}`)
    return { data: data as ContactRow[], total: count || 0, page: params.page, limit: params.limit }
  },

  async markAsRead(id: string) {
    const { error } = await supabaseAdmin.from("contact_messages").update({ read: true }).eq("id", id)
    if (error) throw new Error(`Failed to mark message as read: ${error.message}`)
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin.from("contact_messages").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete message: ${error.message}`)
  },
}
