"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Key, Plus, RefreshCw, Trash2, Eye, EyeOff, Edit3, Zap, Check, X, Loader2 } from "lucide-react"

const sampleKeys = [
  { id: 1, name: "Production Key", key: "sk-proj-9f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a", provider: "OpenAI", status: "active", lastUsed: "2026-07-09", created: "2026-01-15" },
  { id: 2, name: "Dev Key", key: "sk-proj-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0", provider: "OpenAI", status: "active", lastUsed: "2026-07-08", created: "2026-02-20" },
  { id: 3, name: "Claude API", key: "sk-ant-3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c", provider: "Anthropic", status: "active", lastUsed: "2026-07-09", created: "2026-03-10" },
  { id: 4, name: "Gemini Key", key: "AIzaSyB1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U", provider: "Google", status: "inactive", lastUsed: "2026-06-15", created: "2026-01-05" },
  { id: 5, name: "DeepSeek Prod", key: "sk-ds-4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d", provider: "DeepSeek", status: "active", lastUsed: "2026-07-07", created: "2026-04-01" },
]

function maskKey(key: string): string {
  if (!key) return "sk-...XXXX"
  if (key.length <= 12) return key.slice(0, 6) + "..." + key.slice(-4)
  return key.slice(0, 8) + "..." + key.slice(-4)
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState(sampleKeys)
  const [visible, setVisible] = useState<Set<number>>(new Set())
  const [testStatus, setTestStatus] = useState<Record<number, "testing" | "success" | "error">>({})

  const toggleVisible = (id: number) => {
    const s = new Set(visible)
    if (s.has(id)) s.delete(id); else s.add(id)
    setVisible(s)
  }

  const handleTest = (id: number) => {
    setTestStatus(s => ({ ...s, [id]: "testing" }))
    setTimeout(() => {
      setTestStatus(s => ({ ...s, [id]: Math.random() > 0.2 ? "success" : "error" }))
    }, 1200)
    setTimeout(() => {
      setTestStatus(s => { const n = { ...s }; delete n[id]; return n })
    }, 3500)
  }

  const handleDelete = (id: number) => {
    setKeys(prev => prev.filter(k => k.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage API keys for AI provider integrations</p>
        </div>
        <button className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
          <Plus className="w-4 h-4" /> Add Key
        </button>
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs text-[#A7B0C0]">
              <th className="text-left p-4 font-medium">Name</th>
              <th className="text-left p-4 font-medium">Key</th>
              <th className="text-left p-4 font-medium">Provider</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Last Used</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k, i) => (
              <motion.tr key={k.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] flex items-center justify-center">
                      <Key className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">{k.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5">
                    <code className="text-[11px] text-[#A7B0C0] font-mono bg-[#090B16] px-2 py-1 rounded-lg border border-white/[0.06]">
                      {visible.has(k.id) ? k.key : maskKey(k.key)}
                    </code>
                    <button onClick={() => toggleVisible(k.id)} className="text-[#A7B0C0] hover:text-white transition-colors">
                      {visible.has(k.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </td>
                <td className="p-4 text-xs text-white">{k.provider}</td>
                <td className="p-4">
                  {testStatus[k.id] === "testing" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">
                      <Loader2 className="w-3 h-3 animate-spin" /> Testing
                    </span>
                  ) : testStatus[k.id] === "success" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20">
                      <Check className="w-3 h-3" /> OK
                    </span>
                  ) : testStatus[k.id] === "error" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20">
                      <X className="w-3 h-3" /> Failed
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      k.status === "active" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${k.status === "active" ? "bg-[#22C55E]" : "bg-[#A7B0C0]"}`} />
                      {k.status === "active" ? "Active" : "Inactive"}
                    </span>
                  )}
                </td>
                <td className="p-4 text-xs text-[#A7B0C0]">{k.lastUsed}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleTest(k.id)} disabled={testStatus[k.id] === "testing"} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all disabled:opacity-50">
                      {testStatus[k.id] === "testing" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    </button>
                    <button className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#A7B0C0] hover:text-white transition-all"><RefreshCw className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(k.id)} className="w-7 h-7 rounded-lg bg-[#090B16] border border-white/[0.06] flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
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
