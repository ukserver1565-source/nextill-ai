"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Workflow, CheckCircle, XCircle, Clock, BarChart3, Settings, Play, Loader2, Inbox } from "lucide-react"

export default function WorkflowsPage() {
  const router = useRouter()
  const [workflows, setWorkflows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [runningId, setRunningId] = useState<string | null>(null)
  const [actionError, setActionError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/workflows")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const rows = Array.isArray(json) ? json : json.data || []
      setWorkflows(rows.map((row: any) => {
        let v = row.value || {}
      if (typeof row.value === "string") { try { v = JSON.parse(row.value) } catch { v = {} } }
        return {
          id: row.id,
          key: row.key,
          name: v.workflow_name || row.key,
          slug: v.workflow_slug || row.key,
          status: v.is_enabled ? "active" : "inactive",
          creditsCost: v.credits_cost ?? 0,
          dailyLimit: v.daily_limit ?? 0,
          updatedAt: row.updated_at,
        }
      }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleRun = async (wf: any) => {
    setRunningId(wf.id)
    try {
      await fetch("/api/admin/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [wf.key]: { trigger: "manual" } }),
      })
      await fetchData()
    } catch (e: any) { setActionError(e.message || "Failed to run workflow") } finally {
      setRunningId(null)
    }
  }

  const handleSettings = (wf: any) => {
    router.push(`/admin/integrations`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Workflows</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Manage automated workflow settings</p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#6D5EF5] animate-spin mb-4" />
          <p className="text-sm text-[#A7B0C0]">Loading workflows...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20">
          <XCircle className="w-12 h-12 text-[#EF4444] mb-4" />
          <p className="text-sm font-medium text-[#EF4444] mb-1">Failed to load workflows</p>
          <p className="text-xs text-[#A7B0C0]">{error}</p>
        </div>
      )}

      {!loading && !error && workflows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Inbox className="w-12 h-12 text-[#A7B0C0] mb-4" />
          <p className="text-sm font-medium text-[#A7B0C0] mb-1">No workflows found</p>
          <p className="text-xs text-[#A7B0C0]">Workflows will appear here once configured</p>
        </div>
      )}

      {!loading && !error && workflows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {workflows.map((wf, i) => (
            <motion.div
              key={wf.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 hover:border-white/[0.12] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${wf.status === "active" ? "bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6]" : "bg-[#090B16] border border-white/[0.06]"}`}>
                  <Workflow className={`w-6 h-6 ${wf.status === "active" ? "text-white" : "text-[#A7B0C0]"}`} />
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                  wf.status === "active"
                    ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                    : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
                }`}>
                  {wf.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>

              <h3 className="text-base font-semibold text-white">{wf.name}</h3>
              <p className="text-xs text-[#A7B0C0] mt-1">{wf.slug}</p>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="bg-[#090B16] rounded-xl p-3 border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#A7B0C0] mb-1">
                    <BarChart3 className="w-3 h-3" /> Credits Cost
                  </div>
                  <p className="text-xs font-medium text-white">{wf.creditsCost}</p>
                </div>
                <div className="bg-[#090B16] rounded-xl p-3 border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#A7B0C0] mb-1">
                    <Clock className="w-3 h-3" /> Daily Limit
                  </div>
                  <p className="text-xs font-medium text-white">{wf.dailyLimit.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <button
                  onClick={() => handleRun(wf)}
                  disabled={runningId === wf.id}
                  className="flex-1 h-9 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20 disabled:opacity-50"
                >
                  {runningId === wf.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {runningId === wf.id ? "Running..." : "Run Now"}
                </button>
                <button
                  onClick={() => handleSettings(wf)}
                  className="h-9 px-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-xs font-medium flex items-center gap-1.5 hover:bg-white/[0.06] transition-all"
                >
                  <Settings className="w-3.5 h-3.5" /> Settings
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {actionError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg backdrop-blur-xl">
          <p className="text-xs text-[#EF4444]">{actionError}</p>
          <button onClick={() => setActionError("")} className="text-[#EF4444] hover:text-white transition-colors">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
