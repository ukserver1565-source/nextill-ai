"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { PenSquare, Search, Shield, TrendingUp, Share2, FileSearch, ToggleLeft, Settings, Loader2, Package, X, Check } from "lucide-react"

interface ToolSetting {
  id: string
  tool_slug: string
  tool_name: string
  is_enabled: boolean
  credits_cost: number
  default_model: string | null
  guest_daily_limit: number
  free_daily_limit: number
  premium_daily_limit: number
  prompt_template: string | null
}

const toolIcons: Record<string, any> = {
  "keyword-intelligence": Search, "domain-intelligence": Search, "post-generator": PenSquare,
  "plagiarism-checker": FileSearch, ai_writer: PenSquare, keyword_research: Search,
  plagiarism_checker: FileSearch, seo_analyzer: Search, rank_tracker: TrendingUp,
  backlink_analyzer: Share2, website_audit: Shield, ai_humanizer: PenSquare,
}

export default function ToolsPage() {
  const [tools, setTools] = useState<ToolSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editTool, setEditTool] = useState<ToolSetting | null>(null)
  const [editForm, setEditForm] = useState({ credits_cost: 0, guest_daily_limit: 0, free_daily_limit: 0, premium_daily_limit: 0 })
  const [saving, setSaving] = useState(false)

  const fetchTools = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/tools")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setTools(Array.isArray(json) ? json : [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTools() }, [fetchTools])

  const [toggleError, setToggleError] = useState("")

  const toggleTool = async (tool: ToolSetting) => {
    setToggleError("")
    try {
      const res = await fetch(`/api/admin/tools/${tool.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_enabled: !tool.is_enabled }),
      })
      if (!res.ok) throw new Error("Failed")
      setTools(prev => prev.map(t => t.id === tool.id ? { ...t, is_enabled: !t.is_enabled } : t))
    } catch (e: any) { setToggleError(e.message || "Failed to toggle tool") }
  }

  const openSettings = (tool: ToolSetting) => {
    setEditTool(tool)
    setEditForm({
      credits_cost: tool.credits_cost,
      guest_daily_limit: tool.guest_daily_limit,
      free_daily_limit: tool.free_daily_limit,
      premium_daily_limit: tool.premium_daily_limit,
    })
  }

  const [saveError, setSaveError] = useState("")

  const saveSettings = async () => {
    if (!editTool) return
    setSaving(true)
    setSaveError("")
    try {
      const res = await fetch(`/api/admin/tools/${editTool.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error("Failed")
      setTools(prev => prev.map(t => t.id === editTool.id ? { ...t, ...editForm } : t))
      setEditTool(null)
    } catch (e: any) { setSaveError(e.message || "Failed to save settings") } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tools</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Manage AI tools and their availability</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin" />
          <span className="ml-3 text-sm text-[#A7B0C0]">Loading tools...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#EF4444]/10 flex items-center justify-center mb-3">
            <Package className="w-6 h-6 text-[#EF4444]" />
          </div>
          <p className="text-sm text-[#EF4444] font-medium">Failed to load tools</p>
          <p className="text-xs text-[#A7B0C0] mt-1">{error}</p>
          <button onClick={fetchTools} className="mt-3 px-4 py-1.5 rounded-xl bg-[#6D5EF5]/10 text-[#6D5EF5] text-xs font-medium hover:bg-[#6D5EF5]/20 transition-colors">
            Retry
          </button>
        </div>
      ) : tools.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#6D5EF5]/10 flex items-center justify-center mb-3">
            <Package className="w-6 h-6 text-[#6D5EF5]" />
          </div>
          <p className="text-sm text-[#A7B0C0]">No tools configured</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tools.map((tool, i) => {
            const Icon = toolIcons[tool.tool_slug] || PenSquare
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tool.is_enabled ? "bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6]" : "bg-[#090B16] border border-white/[0.06]"}`}>
                    <Icon className={`w-5 h-5 ${tool.is_enabled ? "text-white" : "text-[#A7B0C0]"}`} />
                  </div>
                  <button
                    onClick={() => toggleTool(tool)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${tool.is_enabled ? "bg-[#6D5EF5]" : "bg-white/[0.06]"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow ${tool.is_enabled ? "translate-x-5.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-white">{tool.tool_name}</h3>
                <div className="mt-2 flex items-center gap-3 text-[10px] text-[#A7B0C0]">
                  <span>{tool.credits_cost} credits</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className={`text-[10px] font-medium ${tool.is_enabled ? "text-[#22C55E]" : "text-[#A7B0C0]"}`}>
                    {tool.is_enabled ? "Enabled" : "Disabled"}
                  </span>
                  <button onClick={() => openSettings(tool)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all">
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {editTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditTool(null)}>
          <div className="bg-[#090B16] border border-white/[0.06] rounded-xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{editTool.tool_name} Settings</h3>
              <button onClick={() => setEditTool(null)} className="text-[#A7B0C0] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B0C0]">Credits Cost</label>
                <input type="number" value={editForm.credits_cost} onChange={e => setEditForm(f => ({ ...f, credits_cost: Number(e.target.value) }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B0C0]">Guest Daily Limit</label>
                <input type="number" value={editForm.guest_daily_limit} onChange={e => setEditForm(f => ({ ...f, guest_daily_limit: Number(e.target.value) }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B0C0]">Free Daily Limit</label>
                <input type="number" value={editForm.free_daily_limit} onChange={e => setEditForm(f => ({ ...f, free_daily_limit: Number(e.target.value) }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B0C0]">Premium Daily Limit</label>
                <input type="number" value={editForm.premium_daily_limit} onChange={e => setEditForm(f => ({ ...f, premium_daily_limit: Number(e.target.value) }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditTool(null)} className="h-9 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.06] transition-all">Cancel</button>
              <button onClick={saveSettings} disabled={saving} className="h-9 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save
              </button>
            </div>
            {saveError && <p className="text-xs text-[#EF4444] text-center">{saveError}</p>}
          </div>
        </div>
      )}
      {toggleError && (
        <div className="fixed bottom-4 right-4 bg-[#EF4444]/90 backdrop-blur-xl text-white text-xs px-4 py-2.5 rounded-xl shadow-lg z-50">
          {toggleError}
        </div>
      )}
    </div>
  )
}
