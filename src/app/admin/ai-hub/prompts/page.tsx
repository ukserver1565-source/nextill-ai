"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { FileText, Search, Plus, Edit3, Copy, Trash2, ChevronDown, ChevronUp, Check, Loader2 } from "lucide-react"

const categories = [
  "keyword-analysis", "outline", "writer", "humanizer", "rewriter",
  "grammar", "detector", "plagiarism", "seo-title", "meta-description",
  "faq", "schema", "internal-links", "readability", "final-optimization",
]

export default function AIHubPromptsPage() {
  const [prompts, setPrompts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [editing, setEditing] = useState<number | string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", category: "", content: "" })

  const fetchPrompts = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/ai/prompts")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setPrompts(Array.isArray(json) ? json : (json.data || []))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPrompts() }, [fetchPrompts])

  const filtered = prompts.filter(p => {
    if (filterCategory !== "all" && p.category !== filterCategory) return false
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleDuplicate = async (id: string) => {
    const original = prompts.find(p => p.id === id)
    if (!original) return
    try {
      const res = await fetch("/api/admin/ai/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${original.name} (Copy)`,
          category: original.category,
          content: original.prompt_text || original.content,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const created = await res.json()
      setPrompts(prev => [...prev, created])
    } catch (err: any) {
      console.error("Failed to duplicate prompt:", err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/ai/prompts`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setPrompts(prev => prev.filter(p => p.id !== id))
    } catch (err: any) {
      console.error("Failed to delete prompt:", err)
    }
  }

  const handleSaveEdit = async () => {
    if (!editing) return
    try {
      if (editing === -1) {
        const res = await fetch("/api/admin/ai/prompts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const created = await res.json()
        setPrompts(prev => [...prev, created])
      } else {
        const res = await fetch(`/api/admin/ai/prompts`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing, ...editForm }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const updated = await res.json()
        setPrompts(prev => prev.map(p => p.id === editing ? { ...p, ...updated } : p))
      }
      setEditing(null)
    } catch (err: any) {
      console.error("Failed to save prompt:", err)
    }
  }

  const startEditing = (p: any) => {
    setEditing(p.id)
    setEditForm({ name: p.name || "", category: p.category || categories[0], content: p.prompt_text || p.content || "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Prompt Templates</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage AI prompt templates across all workflows — versioned and categorized</p>
        </div>
        <button
          onClick={() => { setEditing(-1); setEditForm({ name: "", category: categories[0], content: "" }) }}
          className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20"
        >
          <Plus className="w-4 h-4" /> Add Template
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
          <input
            type="text" placeholder="Search templates..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${filterCategory === "all" ? "bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white shadow-lg shadow-[#6D5EF5]/20" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}
          >All</button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${filterCategory === c ? "bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white shadow-lg shadow-[#6D5EF5]/20" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}
            >{c.replace(/-/g, " ")}</button>
          ))}
        </div>
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-[#A7B0C0]">
                <th className="text-left p-4 font-medium">Template Name</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium">Version</th>
                <th className="text-left p-4 font-medium">Last Updated</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="w-5 h-5 animate-spin text-[#A7B0C0] mx-auto" /></td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="p-8 text-center text-xs text-red-400">{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <FileText className="w-12 h-12 text-[#A7B0C0] mx-auto mb-4" />
                    <p className="text-sm font-medium text-[#A7B0C0] mb-1">No templates found</p>
                    <p className="text-xs text-[#A7B0C0]">Create your first template or change the filter</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] flex items-center justify-center">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-white">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">
                        {(p.category || "").replace(/-/g, " ")}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      <span className="text-white font-mono font-medium">v{p.version || 1}</span>
                    </td>
                    <td className="p-4 text-xs text-[#A7B0C0]">{p.updated_at ? new Date(p.updated_at).toLocaleDateString("en-US") : "—"}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEditing(p)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDuplicate(p.id)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/10 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(editing !== null) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">
            {editing === -1 ? "New Prompt Template" : `Editing: ${editForm.name}`}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">Template Name</label>
                <input
                  type="text" value={editForm.name}
                  onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Template name"
                  className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full h-11 bg-[#090B16] border border-white/[0.06] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-[#6D5EF5]/50 transition-colors"
                >
                  {categories.map(c => <option key={c} value={c}>{c.replace(/-/g, " ")}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#A7B0C0] mb-1.5">Prompt Content</label>
              <textarea
                value={editForm.content}
                onChange={(e) => setEditForm(f => ({ ...f, content: e.target.value }))}
                rows={12}
                className="w-full bg-[#090B16] border border-white/[0.06] rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors resize-none"
                placeholder="Enter prompt content..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditing(null)} className="h-10 px-4 rounded-xl border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSaveEdit} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
                {editing === -1 ? <Plus className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                {editing === -1 ? "Create Template" : "Save Changes"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
