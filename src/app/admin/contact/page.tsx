"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, Mail, Reply, CheckCheck, Trash2, Loader2, Inbox } from "lucide-react"

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  created_at: string
}

export default function ContactPage() {
  const [search, setSearch] = useState("")
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (search) params.set("search", search)
      const res = await fetch(`/api/admin/contact?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setMessages(json.data || [])
      setTotal(json.total || 0)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  useEffect(() => {
    const t = setTimeout(() => { setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [search])

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/admin/contact/${id}`, { method: "PATCH" })
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m))
    } catch (e) { console.error("[contact] error:", e) }


  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/contact/${id}`, { method: "DELETE" })
      setMessages(prev => prev.filter(m => m.id !== id))
      setTotal(prev => prev - 1)
    } catch (e) { console.error("[contact] error:", e) }


  const unreadCount = messages.filter(m => !m.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">User inquiries and support messages</p>
        </div>
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
          {unreadCount} Unread
        </span>
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search messages..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all"
        />
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin" />
            <span className="ml-3 text-sm text-[#A7B0C0]">Loading messages...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#EF4444]/10 flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6 text-[#EF4444]" />
            </div>
            <p className="text-sm text-[#EF4444] font-medium">Failed to load messages</p>
            <p className="text-xs text-[#A7B0C0] mt-1">{error}</p>
            <button onClick={fetchMessages} className="mt-3 px-4 py-1.5 rounded-xl bg-[#6D5EF5]/10 text-[#6D5EF5] text-xs font-medium hover:bg-[#6D5EF5]/20 transition-colors">
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">From</th>
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Subject</th>
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Date</th>
                  <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m, i) => (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors ${!m.read ? "bg-[#6D5EF5]/[0.02]" : ""}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B5CF6]/20 border border-white/[0.06] flex items-center justify-center text-[10px] font-bold text-white">
                          {m.name.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{m.name}</p>
                          <p className="text-[10px] text-[#A7B0C0]">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {!m.read && <div className="w-2 h-2 rounded-full bg-[#6D5EF5]" />}
                        <span className={`text-xs ${!m.read ? "text-white font-medium" : "text-[#A7B0C0]"}`}>{m.subject}</span>
                      </div>
                      <p className="text-[10px] text-[#A7B0C0] mt-0.5 truncate max-w-[250px]">{m.message}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                        m.read ? "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]" : "bg-[#6D5EF5]/10 text-[#6D5EF5] border-[#6D5EF5]/20"
                      }`}>
                        {m.read ? "Read" : "New"}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-[#A7B0C0]">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleMarkRead(m.id)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-[#4CC9F0] transition-all"><Reply className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleMarkRead(m.id)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"><CheckCheck className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-[#EF4444] transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {messages.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <Inbox className="w-10 h-10 text-[#A7B0C0]/30 mx-auto mb-3" />
                      <p className="text-sm text-[#A7B0C0]">No messages found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
