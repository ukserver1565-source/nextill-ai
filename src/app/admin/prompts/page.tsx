"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Plus, Edit3, Copy, Trash2 } from "lucide-react"

const samplePrompts = [
  { id: 1, name: "Keyword Analysis", category: "keyword-intelligence", version: 3, status: "active" },
  { id: 2, name: "Content Outline", category: "post-generator", version: 2, status: "active" },
  { id: 3, name: "AI Writer", category: "post-generator", version: 5, status: "active" },
  { id: 4, name: "Humanizer", category: "ai-humanizer", version: 2, status: "active" },
  { id: 5, name: "Rewriter", category: "plagiarism", version: 1, status: "inactive" },
  { id: 6, name: "Grammar Check", category: "ai-humanizer", version: 3, status: "active" },
]

const categories = Array.from(new Set(samplePrompts.map(p => p.category)))

export default function PromptsPage() {
  const [prompts, setPrompts] = useState(samplePrompts)
  const [filterCat, setFilterCat] = useState("all")

  const filtered = filterCat === "all" ? prompts : prompts.filter(p => p.category === filterCat)

  const handleDelete = (id: number) => {
    setPrompts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Prompts</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage system prompts across all AI workflows</p>
        </div>
        <button className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
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
            {filtered.map((p, i) => (
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
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">{p.category}</span>
                </td>
                <td className="p-4 text-xs font-mono text-white">v{p.version}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    p.status === "active" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.status === "active" ? "bg-[#22C55E]" : "bg-[#A7B0C0]"}`} />
                    {p.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(p.id)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
