"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Mail, Reply, CheckCheck, Trash2 } from "lucide-react"

const sampleMessages = [
  { id: 1, name: "John Doe", email: "john@example.com", subject: "Billing Question", message: "I was charged twice for my Pro plan this month...", date: "2024-07-15", read: false },
  { id: 2, name: "Alice Smith", email: "alice@example.com", subject: "Feature Request", message: "It would be great if you could add support for...", date: "2024-07-14", read: false },
  { id: 3, name: "Bob Wilson", email: "bob@example.com", subject: "Account Issue", message: "I can't log into my account after the update...", date: "2024-07-13", read: true },
  { id: 4, name: "Carol Brown", email: "carol@example.com", subject: "Partnership Inquiry", message: "We're interested in partnering with Nextill AI for...", date: "2024-07-12", read: true },
  { id: 5, name: "David Lee", email: "david@example.com", subject: "Technical Support", message: "The AI writer tool is not generating proper...", date: "2024-07-11", read: false },
  { id: 6, name: "Emma Taylor", email: "emma@example.com", subject: "Feedback", message: "Love the platform! Just a suggestion for...", date: "2024-07-10", read: true },
]

export default function ContactPage() {
  const [search, setSearch] = useState("")

  const filtered = sampleMessages.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.subject.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">User inquiries and support messages</p>
        </div>
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
          {sampleMessages.filter(m => !m.read).length} Unread
        </span>
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
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
              {filtered.map((m, i) => (
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
                        {m.name.split(" ").map(n => n[0]).join("")}
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
                  <td className="p-4 text-xs text-[#A7B0C0]">{m.date}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-[#4CC9F0] transition-all"><Reply className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"><CheckCheck className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-[#EF4444] transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-xs text-[#A7B0C0]">No messages found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
