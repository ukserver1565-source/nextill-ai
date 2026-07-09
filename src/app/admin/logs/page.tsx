"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Calendar, ChevronLeft, ChevronRight, Terminal } from "lucide-react"

const sampleLogs = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  timestamp: new Date(Date.now() - i * 3600000).toLocaleString(),
  user: ["Sarah Chen", "Mike Ross", "Lisa Wang", "Tom Baker", "Emma Davis", "Admin System"][i % 6],
  action: ["User login", "Payment processed", "Post generated", "Settings updated", "Coupon created", "Backup completed", "User registered", "Email sent", "Report generated", "Model updated"][i % 10],
  ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  status: i % 5 === 3 ? "failed" : "success",
}))

const PAGE_SIZE = 10

export default function LogsPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const filtered = sampleLogs.filter(log =>
    log.user.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.ip.includes(search)
  )
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Monitor all admin and system activity</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search logs..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
        </div>
        <div className="flex items-center gap-2">
          <input type="date" className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-xs text-white outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
          <span className="text-[10px] text-[#A7B0C0]">to</span>
          <input type="date" className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-xs text-white outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
          <button className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center gap-2 transition-all"><Calendar className="w-3.5 h-3.5" /> Filter</button>
        </div>
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Timestamp</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Action</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">IP Address</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((log, i) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4 text-xs text-[#A7B0C0] font-mono">{log.timestamp}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B5CF6]/20 border border-white/[0.06] flex items-center justify-center text-[9px] font-bold text-white">
                        {log.user.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="text-xs text-white">{log.user}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-white">{log.action}</td>
                  <td className="p-4 text-xs text-[#A7B0C0] font-mono">{log.ip}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                      log.status === "success"
                        ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                        : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-xs text-[#A7B0C0]">No logs found</td></tr>
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
