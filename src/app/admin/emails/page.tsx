"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Mail, Edit3, Loader2, Inbox, X } from "lucide-react"

export default function EmailsPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editKey, setEditKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/email")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const entries = Array.isArray(json) ? json : Object.entries(json).map(([key, value]) => ({ key, ...(typeof value === "object" && value !== null ? value : { value }) }))
      setTemplates(entries)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  const openEdit = (t: any) => {
    setEditKey(t.key || t.name || "")
    setEditValue(typeof t.value === "string" ? t.value : typeof t.subject === "string" ? t.subject : JSON.stringify(t, null, 2))
  }

  const handleSave = async () => {
    if (!editKey) return
    setSaving(true)
    try {
      await fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [editKey]: editValue }),
      })
      setEditKey(null)
      fetchTemplates()
    } catch (e) { console.error("[emails] error:", e) }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Email Templates</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Manage email notification templates</p>
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Template Name</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Subject</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Last Updated</th>
                <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-12 text-center"><Loader2 className="w-5 h-5 animate-spin text-[#A7B0C0] mx-auto" /></td></tr>
              ) : error ? (
                <tr><td colSpan={4} className="p-8 text-center text-xs text-red-400">{error}</td></tr>
              ) : templates.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-xs text-[#A7B0C0]">
                  <Inbox className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  No email templates configured
                </td></tr>
              ) : (
                templates.map((t: any, i: number) => (
                  <motion.tr key={t.id || t.key || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#6D5EF5]" />
                        <span className="text-sm text-white">{t.name || t.key || "Template"}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-[#A7B0C0] font-mono">{t.from_name || t.from_email || t.subject || "—"}</td>
                    <td className="p-4 text-xs text-[#A7B0C0]">{t.updated_at ? new Date(t.updated_at).toLocaleDateString("en-US") : "—"}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editKey !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#151C2E] border border-white/[0.06] rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-white">Edit: {editKey}</h2>
              <button onClick={() => setEditKey(null)} className="p-1 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#A7B0C0] mb-5">Update email template content</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#A7B0C0] mb-1.5">Content</label>
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={8}
                  className="w-full bg-[#090B16] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 transition-colors resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setEditKey(null)} className="h-10 px-4 rounded-xl border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20 disabled:opacity-50 flex items-center gap-2">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
