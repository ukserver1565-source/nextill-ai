"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, FolderKanban, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

const sampleProjects = [
  { id: 1, name: "TechBlog", owner: "Sarah Johnson", documents: 24, created: "2024-06-01", domain: "techblog.com" },
  { id: 2, name: "HealthHub", owner: "Michael Chen", documents: 18, created: "2024-06-15", domain: "healthhub.io" },
  { id: 3, name: "FinancePro", owner: "Emily Davis", documents: 32, created: "2024-05-20", domain: "financepro.com" },
  { id: 4, name: "TravelGo", owner: "James Wilson", documents: 12, created: "2024-07-01", domain: "travelgo.net" },
  { id: 5, name: "FoodieZone", owner: "Lisa Thompson", documents: 45, created: "2024-04-10", domain: "foodiezone.com" },
  { id: 6, name: "FitLife", owner: "David Martinez", documents: 8, created: "2024-07-10", domain: "fitlife.org" },
  { id: 7, name: "EduSmart", owner: "Anna Kim", documents: 28, created: "2024-05-01", domain: "edusmart.io" },
  { id: 8, name: "GreenEarth", owner: "Robert Taylor", documents: 15, created: "2024-06-20", domain: "greenearth.com" },
]

const PAGE_SIZE = 8

export default function ProjectsPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const filtered = sampleProjects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.owner.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">All user projects across the platform</p>
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search projects..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Project</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Owner</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Documents</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Created</th>
                <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((proj, i) => (
                <motion.tr key={proj.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] flex items-center justify-center text-sm font-bold text-white">
                        {proj.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{proj.name}</p>
                        <p className="text-[10px] text-[#A7B0C0]">{proj.domain}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-white">{proj.owner}</td>
                  <td className="p-4 text-xs text-[#A7B0C0]">{proj.documents}</td>
                  <td className="p-4 text-xs text-[#A7B0C0]">{proj.created}</td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-[#4CC9F0] transition-all">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-xs text-[#A7B0C0]">No projects found</td></tr>
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
