"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Download, Plus, CheckCircle, XCircle, HardDrive, Loader2, Trash2, Database } from "lucide-react"

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

const TYPE_COLORS: Record<string, string> = {
  full: "bg-[#6D5EF5]/10 text-[#6D5EF5] border-[#6D5EF5]/20",
  settings: "bg-[#4CC9F0]/10 text-[#4CC9F0] border-[#4CC9F0]/20",
  prompts: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  providers: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<BackupExport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)
  const [actionError, setActionError] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)

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
    setActionError("")
    try {
      const res = await fetch("/api/admin/backups", { method: "POST" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Failed")
      }
      fetchData()
    } catch (e: any) {
      setActionError(e.message || "Failed to create backup")
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this backup?")) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/backups/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      fetchData()
    } catch (e: any) {
      setActionError(e.message || "Failed to delete backup")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Backups</h1>
          <p className="text-sm text-muted mt-1">Manage database and system backups</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-foreground text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20 disabled:opacity-50"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Backup
        </button>
      </div>

      {actionError && (
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 text-xs text-[#EF4444]">
          {actionError}
          <button onClick={() => setActionError("")} className="ml-2 underline">dismiss</button>
        </div>
      )}

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
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-12 text-center">
          <HardDrive className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">No backups yet</p>
          <p className="text-xs text-muted/60 mt-1">Create your first backup to safeguard your data</p>
        </div>
      ) : (
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-[11px] font-medium text-muted uppercase tracking-wider">ID</th>
                  <th className="text-left p-4 text-[11px] font-medium text-muted uppercase tracking-wider">Type</th>
                  <th className="text-left p-4 text-[11px] font-medium text-muted uppercase tracking-wider">Date</th>
                  <th className="text-left p-4 text-[11px] font-medium text-muted uppercase tracking-wider">Size</th>
                  <th className="text-left p-4 text-[11px] font-medium text-muted uppercase tracking-wider">Status</th>
                  <th className="text-right p-4 text-[11px] font-medium text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b, i) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4 text-xs font-mono text-[#4CC9F0]">#{b.id.slice(0, 8)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border ${TYPE_COLORS[b.type] || "bg-muted/10 text-muted border-border"}`}>
                        <Database className="w-3 h-3" />
                        {b.type}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted">{formatDate(b.created_at)}</td>
                    <td className="p-4 text-xs text-foreground font-medium">{formatSize(b.size_bytes)}</td>
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
                      <div className="flex items-center justify-end gap-1">
                        {b.status === "completed" && (
                          <a
                            href={`/api/admin/backups/${b.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted hover:text-foreground transition-all"
                            aria-label="Download backup"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(b.id)}
                          disabled={deleting === b.id}
                          className="p-1.5 rounded-lg hover:bg-[#EF4444]/10 text-muted hover:text-[#EF4444] transition-all disabled:opacity-50"
                          aria-label="Delete backup"
                        >
                          {deleting === b.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
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
