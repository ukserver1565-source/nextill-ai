"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Plus, Edit3, Copy, Trash2, Loader2, FileSearch, X } from "lucide-react"

interface Prompt {
  id: string
  tool_slug: string
  name: string
  content: string
  version: number
  is_active: boolean
  variables: string[]
  created_at: string
  updated_at: string
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filterCat, setFilterCat] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [formName, setFormName] = useState("")
  const [formSlug, setFormSlug] = useState("")
  const [formContent, setFormContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [actionError, setActionError] = useState("")

  const fetchPrompts = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/prompts")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setPrompts(Array.isArray(json) ? json : [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPrompts() }, [fetchPrompts])

  const categories = useMemo(() => Array.from(new Set(prompts.map(p => p.tool_slug))), [prompts])

  const filtered = filterCat === "all" ? prompts : prompts.filter(p => p.tool_slug === filterCat)

  const handleDelete = async (id: string) => {
    setActionError("")
    try {
      const res = await fetch(`/api/admin/prompts/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setPrompts(prev => prev.filter(p => p.id !== id))
    } catch (e: any) { setActionError(e.message) }
  }

  const openCreate = () => {
    setEditingPrompt(null)
    setFormName("")
    setFormSlug("")
    setFormContent("")
    setSaveError("")
    setModalOpen(true)
  }

  const openEdit = (p: Prompt) => {
    setEditingPrompt(p)
    setFormName(p.name)
    setFormSlug(p.tool_slug)
    setFormContent(p.content)
    setSaveError("")
    setModalOpen(true)
  }

  const handleCopy = async (p: Prompt) => {
    setActionError("")
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool_slug: p.tool_slug,
          name: `${p.name} (Copy)`,
          content: p.content,
          variables: p.variables || [],
        }),
      })
      if (!res.ok) throw new Error("Failed to copy")
      await fetchPrompts()
    } catch (e: any) { setActionError(e.message) }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError("")
    try {
      const body: any = {
        name: formName,
        tool_slug: formSlug,
        content: formContent,
      }
      if (editingPrompt) {
        body.id = editingPrompt.id
      }
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Failed to save prompt")
      setModalOpen(false)
      await fetchPrompts()
    } catch (err: any) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Prompts</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage system prompts across all AI workflows</p>
        </div>
        <button onClick={openCreate} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
          <Plus className="w-4 h-4" /> New Prompt
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setFilterCat("all")}
          className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${filterCat === "all" ? "bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white shadow-lg shadow-[#6D5EF5]/20" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}>All</button>
        {categories.map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${filterCat === c ? "bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white shadow-lg shadow-[#6D5EF5]/20" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}>{c}</button>
        ))}
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin" />
            <span className="ml-3 text-sm text-[#A7B0C0]">Loading prompts...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#EF4444]/10 flex items-center justify-center mb-3">
              <FileSearch className="w-6 h-6 text-[#EF4444]" />
            </div>
            <p className="text-sm text-[#EF4444] font-medium">Failed to load prompts</p>
            <p className="text-xs text-[#A7B0C0] mt-1">{error}</p>
            <button onClick={fetchPrompts} className="mt-3 px-4 py-1.5 rounded-xl bg-[#6D5EF5]/10 text-[#6D5EF5] text-xs font-medium hover:bg-[#6D5EF5]/20 transition-colors">
              Retry
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-[#A7B0C0]">
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium">Version</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <FileSearch className="w-10 h-10 text-[#A7B0C0]/30 mx-auto mb-3" />
                    <p className="text-sm text-[#A7B0C0]">No prompts found</p>
                  </td>
                </tr>
              ) : filtered.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">{p.tool_slug}</span>
                  </td>
                  <td className="p-4 text-xs font-mono text-white">v{p.version}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      p.is_active ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? "bg-[#22C55E]" : "bg-[#A7B0C0]"}`} />
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleCopy(p)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(p.id)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#151C2E] border border-white/[0.06] rounded-xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">{editingPrompt ? "Edit Prompt" : "New Prompt"}</h3>
                <button onClick={() => setModalOpen(false)} className="text-[#A7B0C0] hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#A7B0C0] mb-1.5">Name</label>
                  <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Prompt name"
                    className="w-full h-10 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm outline-none focus:border-[#6D5EF5] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A7B0C0] mb-1.5">Category (tool_slug)</label>
                  <input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="e.g. blog-writer" disabled={!!editingPrompt}
                    className="w-full h-10 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm outline-none focus:border-[#6D5EF5] transition-colors disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A7B0C0] mb-1.5">Content</label>
                  <textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} rows={8} placeholder="Enter prompt content..."
                    className="w-full px-3 py-2.5 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm outline-none focus:border-[#6D5EF5] transition-colors resize-none font-mono" />
                </div>
                {saveError && <p className="text-xs text-[#EF4444]">{saveError}</p>}
              </div>
              <div className="flex items-center justify-end gap-2 mt-6">
                <button onClick={() => setModalOpen(false)} className="h-9 px-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.06] transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving || !formName || !formSlug} className="h-9 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20 disabled:opacity-50">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingPrompt ? "Update" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {actionError && (
        <div className="fixed bottom-4 right-4 bg-[#EF4444]/90 backdrop-blur-xl text-white text-xs px-4 py-2.5 rounded-xl shadow-lg z-50">
          {actionError}
        </div>
      )}
    </div>
  )
}
