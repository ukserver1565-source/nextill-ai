"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, UserPlus, ChevronLeft, ChevronRight, MoreVertical, Edit3, Trash2 } from "lucide-react"

const sampleUsers = [
  { id: 1, name: "Sarah Johnson", email: "sarah@example.com", plan: "Pro", status: "active", joined: "2024-01-15", avatar: "SJ" },
  { id: 2, name: "Michael Chen", email: "michael@example.com", plan: "Enterprise", status: "active", joined: "2024-02-20", avatar: "MC" },
  { id: 3, name: "Emily Davis", email: "emily@example.com", plan: "Free", status: "active", joined: "2024-03-10", avatar: "ED" },
  { id: 4, name: "James Wilson", email: "james@example.com", plan: "Pro", status: "suspended", joined: "2024-01-05", avatar: "JW" },
  { id: 5, name: "Lisa Thompson", email: "lisa@example.com", plan: "Starter", status: "active", joined: "2024-03-22", avatar: "LT" },
  { id: 6, name: "David Martinez", email: "david@example.com", plan: "Pro", status: "active", joined: "2024-02-14", avatar: "DM" },
  { id: 7, name: "Anna Kim", email: "anna@example.com", plan: "Free", status: "active", joined: "2024-04-01", avatar: "AK" },
  { id: 8, name: "Robert Taylor", email: "robert@example.com", plan: "Enterprise", status: "suspended", joined: "2023-11-30", avatar: "RT" },
  { id: 9, name: "Sophie Brown", email: "sophie@example.com", plan: "Starter", status: "active", joined: "2024-01-28", avatar: "SB" },
  { id: 10, name: "Daniel Lee", email: "daniel@example.com", plan: "Pro", status: "active", joined: "2024-03-05", avatar: "DL" },
  { id: 11, name: "Olivia Garcia", email: "olivia@example.com", plan: "Free", status: "active", joined: "2024-04-12", avatar: "OG" },
  { id: 12, name: "William Anderson", email: "william@example.com", plan: "Enterprise", status: "active", joined: "2023-12-18", avatar: "WA" },
  { id: 13, name: "Mia Robinson", email: "mia@example.com", plan: "Pro", status: "suspended", joined: "2024-02-08", avatar: "MR" },
  { id: 14, name: "Alexander White", email: "alex@example.com", plan: "Starter", status: "active", joined: "2024-03-30", avatar: "AW" },
  { id: 15, name: "Emma Harris", email: "emma@example.com", plan: "Free", status: "active", joined: "2024-04-15", avatar: "EH" },
]

const PAGE_SIZE = 8

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [planFilter, setPlanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)

  const filtered = sampleUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === "all" || u.plan.toLowerCase() === planFilter
    const matchStatus = statusFilter === "all" || u.status === statusFilter
    return matchSearch && matchPlan && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const planColors: Record<string, string> = {
    free: "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]",
    starter: "bg-[#4CC9F0]/10 text-[#4CC9F0] border-[#4CC9F0]/20",
    pro: "bg-[#6D5EF5]/10 text-[#6D5EF5] border-[#6D5EF5]/20",
    enterprise: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">{sampleUsers.length} total users</p>
        </div>
        <button className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search users..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5]/50 transition-all"
          />
        </div>
        <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1) }} className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-xs text-white outline-none focus:ring-2 focus:ring-[#6D5EF5]/30">
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-xs text-white outline-none focus:ring-2 focus:ring-[#6D5EF5]/30">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Plan</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Joined</th>
                <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B5CF6]/20 border border-white/[0.06] flex items-center justify-center text-xs font-bold text-white">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-[11px] text-[#A7B0C0]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${planColors[user.plan.toLowerCase()]}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                      user.status === "active"
                        ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                        : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-[#A7B0C0]">{user.joined}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-[#EF4444] transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"><MoreVertical className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-xs text-[#A7B0C0]">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#A7B0C0]">Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-white disabled:opacity-30 hover:bg-white/[0.06] transition-all"><ChevronLeft className="w-4 h-4" /></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === p ? "bg-[#6D5EF5] text-white" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-white disabled:opacity-30 hover:bg-white/[0.06] transition-all"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  )
}
