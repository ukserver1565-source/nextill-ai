"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, FileText, ChevronLeft, ChevronRight, Download, Trash2, Loader2 } from "lucide-react"

const PAGE_SIZE = 8

export default function DocumentsPage() {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: PAGE_SIZE.toString() })
      if (search) params.set("search", search)
      const res = await fetch(`/api/admin/documents?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json.data || [])
      setTotal(json.total || 0)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchData() }, [fetchData])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const handleDownload = async (doc: any) => {
    try {
      const res = await fetch(`/api/admin/documents/${doc.id}`)
      if (!res.ok) throw new Error("Failed")
      const json = await res.json()
      const content = json.content || json.body || JSON.stringify(json, null, 2)
      const blob = new Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${doc.title || "document"}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error("[documents] error:", e) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return
    try {
      const res = await fetch(`/api/admin/documents/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      fetchData()
    } catch (e) { console.error("[documents] error:", e) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Documents</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">All documents created across the platform</p>
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search documents..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Title</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Author</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Type</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Date</th>
                <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin mx-auto" /></td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="p-8 text-center text-xs text-[#EF4444]">{error}</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-xs text-[#A7B0C0]">No documents found</td></tr>
              ) : (
                data.map((doc, i) => (
                  <motion.tr key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#6D5EF5]" />
                        <span className="text-sm text-white">{doc.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-white">{doc.profiles?.full_name || "—"}</td>
                    <td className="p-4 text-xs text-[#A7B0C0]">{doc.tool_slug || "—"}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                        doc.updated_at ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                      }`}>{doc.updated_at ? "completed" : "pending"}</span>
                    </td>
                    <td className="p-4 text-xs text-[#A7B0C0]">{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "—"}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleDownload(doc)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"><Download className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-[#EF4444] transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#A7B0C0]">{total === 0 ? "No results" : `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total}`}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-white disabled:opacity-30 hover:bg-white/[0.06] transition-all"><ChevronLeft className="w-4 h-4" /></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === p ? "bg-[#6D5EF5] text-white" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="p-2 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-white disabled:opacity-30 hover:bg-white/[0.06] transition-all"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  )
}
