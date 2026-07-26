"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Workflow, XCircle, Clock, BarChart3, Settings, Play, Loader2, Inbox } from "lucide-react"

interface WorkflowRow {
  id: string
  workflow_slug: string
  workflow_name: string
  is_enabled: boolean
  credits_cost: number
  daily_limit: number
  created_at: string
  updated_at: string
}

export default function WorkflowsPage() {
  const router = useRouter()
  const [workflows, setWorkflows] = useState<WorkflowRow[]>([])
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
      setWorkflows(Array.isArray(json) ? json : json.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleRun = async (wf: WorkflowRow) => {
    setRunningId(wf.id)
    try {
      await fetch("/api/admin/workflows", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: wf.id }),
      })
      await fetchData()
    } catch (e: any) { setActionError(e.message || "Failed to run workflow") } finally {
      setRunningId(null)
    }
  }

  const handleSettings = (_wf: WorkflowRow) => {
    router.push(`/zain-nextill-ansari/integrations`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Workflows</h1>
        <p className="text-sm text-muted mt-1">Manage automated workflow settings</p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#6D5EF5] animate-spin mb-4" />
          <p className="text-sm text-muted">Loading workflows...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20">
          <XCircle className="w-12 h-12 text-[#EF4444] mb-4" />
          <p className="text-sm font-medium text-[#EF4444] mb-1">Failed to load workflows</p>
          <p className="text-xs text-muted">{error}</p>
        </div>
      )}

      {!loading && !error && workflows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Inbox className="w-12 h-12 text-muted mb-4" />
          <p className="text-sm font-medium text-muted mb-1">No workflows found</p>
          <p className="text-xs text-muted">Workflows will appear here once configured</p>
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
              className="liquid-glass-card border border-border rounded-xl p-6 hover:border-white/[0.12] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${wf.is_enabled ? "bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6]" : "bg-background border border-border"}`}>
                  <Workflow className={`w-6 h-6 ${wf.is_enabled ? "text-foreground" : "text-muted"}`} />
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                  wf.is_enabled
                    ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                    : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
                }`}>
                  {wf.is_enabled ? "Active" : "Inactive"}
                </span>
              </div>

              <h3 className="text-base font-semibold text-foreground">{wf.workflow_name}</h3>
              <p className="text-xs text-muted mt-1">{wf.workflow_slug}</p>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="bg-background rounded-xl p-3 border border-border">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted mb-1">
                    <BarChart3 className="w-3 h-3" /> Credits Cost
                  </div>
                  <p className="text-xs font-medium text-foreground">{wf.credits_cost}</p>
                </div>
                <div className="bg-background rounded-xl p-3 border border-border">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted mb-1">
                    <Clock className="w-3 h-3" /> Daily Limit
                  </div>
                  <p className="text-xs font-medium text-foreground">{wf.daily_limit.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <button
                  onClick={() => handleRun(wf)}
                  disabled={runningId === wf.id}
                  className="flex-1 h-9 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-foreground text-xs font-medium flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20 disabled:opacity-50"
                >
                  {runningId === wf.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {runningId === wf.id ? "Running..." : "Run Now"}
                </button>
                <button
                  onClick={() => handleSettings(wf)}
                  className="h-9 px-4 rounded-xl bg-background border border-border text-foreground text-xs font-medium flex items-center gap-1.5 hover:bg-white/[0.06] transition-all"
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
          <button onClick={() => setActionError("")} className="text-[#EF4444] hover:text-foreground transition-colors">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
