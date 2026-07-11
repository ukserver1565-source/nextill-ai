"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Download, Plus, CheckCircle, XCircle, HardDrive, Loader2 } from "lucide-react"

interface BackupExport {
  id: string
  type: string
  status: string
  file_url: string | null
  size_bytes: number | null
  created_by: string | null
  created_at: string
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<BackupExport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/backups")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setBackups(Array.isArray(json) ? json : json.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await fetch("/api/admin/backups", { method: "POST" })
      if (!res.ok) throw new Error("Failed")
      fetchData()
    } catch (e) { console.error("[backups] error:", e) } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Backups</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage database and system backups</p>
        </div>
        <button onClick={handleCreate} disabled={creating} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20 disabled:opacity-50">
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Backup
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-6 text-center">
          <p className="text-sm text-[#EF4444]">{error}</p>
          <button onClick={fetchData} className="mt-3 text-xs text-[#EF4444] underline hover:no-underline">Retry</button>
        </div>
      ) : backups.length === 0 ? (
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-12 text-center">
          <HardDrive className="w-10 h-10 text-[#A7B0C0] mx-auto mb-3" />
          <p className="text-sm text-[#A7B0C0]">No backups yet</p>
          <p className="text-xs text-[#A7B0C0]/60 mt-1">Create your first backup to safeguard your data</p>
        </div>
      ) : (
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">ID</th>
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Type</th>
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Date</th>
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Size</th>
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Status</th>
                  <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b, i) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4 text-xs font-mono text-[#4CC9F0]">#{b.id.slice(0, 8)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-[#A7B0C0]" />
                        <span className="text-xs text-white capitalize">{b.type}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-[#A7B0C0]">{formatDate(b.created_at)}</td>
                    <td className="p-4 text-xs text-white font-medium">{formatSize(b.size_bytes)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                        b.status === "completed"
                          ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                          : b.status === "failed"
                          ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
                          : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                      }`}>
                        {b.status === "completed" ? <CheckCircle className="w-3 h-3 mr-1" /> : b.status === "failed" ? <XCircle className="w-3 h-3 mr-1" /> : <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {b.file_url ? (
                        <a href={b.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all inline-block">
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <button disabled className="p-1.5 rounded-lg text-[#A7B0C0]/30 cursor-not-allowed inline-block">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
