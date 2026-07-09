"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Plus, Copy, Edit3, Trash2, ChevronLeft, ChevronRight, Tag } from "lucide-react"

const sampleCoupons = [
  { id: 1, code: "SUMMER24", discount: 20, type: "percentage", uses: 145, limit: 500, expires: "2024-09-30", active: true },
  { id: 2, code: "WELCOME10", discount: 10, type: "percentage", uses: 890, limit: 1000, expires: "2024-12-31", active: true },
  { id: 3, code: "PRO50", discount: 50, type: "fixed", uses: 23, limit: 100, expires: "2024-08-15", active: true },
  { id: 4, code: "FLAT25", discount: 25, type: "fixed", uses: 67, limit: 200, expires: "2024-10-01", active: false },
  { id: 5, code: "VIP100", discount: 100, type: "fixed", uses: 5, limit: 10, expires: "2024-07-31", active: true },
  { id: 6, code: "BLACKFRIDAY", discount: 50, type: "percentage", uses: 0, limit: 1000, expires: "2024-11-30", active: false },
]

const PAGE_SIZE = 8

export default function CouponsPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const filtered = sampleCoupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupons</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage discount coupons and promotions</p>
        </div>
        <button className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search coupons..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Code</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Discount</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Uses</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Expires</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Status</th>
                <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#6D5EF5]" />
                      <code className="px-2.5 py-1 rounded-lg bg-[#090B16] border border-white/[0.06] text-xs font-mono font-bold text-white">{c.code}</code>
                      <button onClick={() => navigator.clipboard.writeText(c.code)} className="p-1 rounded hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"><Copy className="w-3 h-3" /></button>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold text-white">{c.type === "percentage" ? `${c.discount}%` : `$${c.discount}`}</td>
                  <td className="p-4 text-xs text-[#A7B0C0]">{c.uses}/{c.limit}</td>
                  <td className="p-4 text-xs text-[#A7B0C0]">{c.expires}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${c.active ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-[#EF4444] transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-xs text-[#A7B0C0]">No coupons found</td></tr>
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
