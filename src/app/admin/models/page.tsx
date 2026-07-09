"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Edit3, Trash2, Star, Cpu, Brain, Globe, Bot } from "lucide-react"

const providerColors: Record<string, string> = {
  OpenAI: "from-emerald-500 to-teal-600",
  Google: "from-blue-500 to-cyan-600",
  Anthropic: "from-purple-500 to-pink-600",
  DeepSeek: "from-orange-500 to-red-600",
  "Self-Hosted": "from-zinc-500 to-zinc-600",
}

const providerIcons: Record<string, any> = {
  OpenAI: Bot, Google: Globe, Anthropic: Brain, DeepSeek: Cpu, "Self-Hosted": Cpu,
}

const sampleModels = [
  { id: 1, model_id: "gpt-4o", display_name: "GPT-4o", provider: "OpenAI", type: "Chat", capabilities: ["Streaming", "Vision"], is_default: true, is_active: true },
  { id: 2, model_id: "gpt-4o-mini", display_name: "GPT-4o Mini", provider: "OpenAI", type: "Chat", capabilities: ["Streaming"], is_default: false, is_active: true },
  { id: 3, model_id: "claude-3-opus", display_name: "Claude 3 Opus", provider: "Anthropic", type: "Chat", capabilities: ["Streaming", "Vision"], is_default: false, is_active: true },
  { id: 4, model_id: "claude-3-sonnet", display_name: "Claude 3 Sonnet", provider: "Anthropic", type: "Chat", capabilities: ["Streaming"], is_default: false, is_active: true },
  { id: 5, model_id: "gemini-pro", display_name: "Gemini Pro", provider: "Google", type: "Chat", capabilities: ["Streaming"], is_default: false, is_active: true },
  { id: 6, model_id: "deepseek-chat", display_name: "DeepSeek Chat", provider: "DeepSeek", type: "Chat", capabilities: ["Streaming"], is_default: false, is_active: true },
]

const allTypes = Array.from(new Set(sampleModels.map(m => m.type)))

export default function ModelsPage() {
  const [filterType, setFilterType] = useState("all")
  const models = sampleModels
  const filtered = filterType === "all" ? models : models.filter(m => m.type === filterType)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Models</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage AI models, parameters, and costs</p>
        </div>
        <button className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
          <Plus className="w-4 h-4" /> Add Model
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setFilterType("all")}
          className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${filterType === "all" ? "bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white shadow-lg shadow-[#6D5EF5]/20" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}>All</button>
        {allTypes.map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${filterType === t ? "bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white shadow-lg shadow-[#6D5EF5]/20" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}>{t}</button>
        ))}
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs text-[#A7B0C0]">
              <th className="text-left p-4 font-medium">Name</th>
              <th className="text-left p-4 font-medium">Provider</th>
              <th className="text-left p-4 font-medium">Type</th>
              <th className="text-left p-4 font-medium">Capabilities</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => {
              const Icon = providerIcons[m.provider] || Cpu
              return (
                <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${providerColors[m.provider] || "from-[#6D5EF5] to-[#8B5CF6]"}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{m.display_name}</p>
                        <p className="text-[10px] text-[#A7B0C0] font-mono">{m.model_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-white">{m.provider}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#151C2E] border border-white/[0.06] text-[#A7B0C0]">{m.type}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {m.capabilities.map(c => (
                        <span key={c} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#6D5EF5]/10 text-[#6D5EF5] border border-[#6D5EF5]/20">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      m.is_active ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.is_active ? "bg-[#22C55E]" : "bg-[#A7B0C0]"}`} />
                      {m.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                      {!m.is_default && <button className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-[#F59E0B] transition-all"><Star className="w-3.5 h-3.5" /></button>}
                      <button className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
