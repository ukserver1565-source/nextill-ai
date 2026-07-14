"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, ToggleLeft, Clock, Save, AlertTriangle, Loader2, Inbox, XCircle } from "lucide-react"

export default function SecurityPage() {
  const [rateLimiting, setRateLimiting] = useState(true)
  const [twoFA, setTwoFA] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(60)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [securityLogs, setSecurityLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState("")

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch("/api/admin/settings")
        if (res.ok) {
          const data = await res.json()
          if (data.rateLimiting !== undefined) setRateLimiting(data.rateLimiting === "true")
          if (data.twoFA !== undefined) setTwoFA(data.twoFA === "true")
          if (data.sessionTimeout) setSessionTimeout(Number(data.sessionTimeout))
        }
      } catch { /* use defaults */ }
      try {
        const logsRes = await fetch("/api/admin/security?perPage=20")
        if (logsRes.ok) {
          const logsJson = await logsRes.json()
          setSecurityLogs(logsJson.data || [])
        }
      } catch { /* leave empty */ }
      setLoading(false)
    }
    load()
  }, [])

  const severityStyles: Record<string, string> = {
    low: "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]",
    medium: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
    high: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
    critical: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError("")
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rateLimiting: String(rateLimiting),
          twoFA: String(twoFA),
          sessionTimeout: String(sessionTimeout),
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      setSaveError(err.message || "Failed to save settings")
      setTimeout(() => setSaveError(""), 4000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Security</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Security settings and event monitoring</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#6D5EF5]" /> Security Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#090B16] border border-white/[0.06]">
              <div>
                <p className="text-sm text-white font-medium">Rate Limiting</p>
                <p className="text-xs text-[#A7B0C0] mt-0.5">Protect against brute force attacks</p>
              </div>
              <button onClick={() => setRateLimiting(!rateLimiting)} className={`relative w-12 h-6 rounded-full transition-colors ${rateLimiting ? "bg-[#22C55E]" : "bg-white/[0.06]"}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${rateLimiting ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#090B16] border border-white/[0.06]">
              <div>
                <p className="text-sm text-white font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-[#A7B0C0] mt-0.5">Enforce 2FA for admin accounts</p>
              </div>
              <button onClick={() => setTwoFA(!twoFA)} className={`relative w-12 h-6 rounded-full transition-colors ${twoFA ? "bg-[#22C55E]" : "bg-white/[0.06]"}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${twoFA ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div className="space-y-2 max-w-xs">
              <label className="text-xs font-medium text-[#A7B0C0]">Session Timeout (minutes)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
                <input type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(Number(e.target.value))} className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
              </div>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="h-11 px-6 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saved ? "Saved!" : "Save Settings"}
          </button>
          {saveError && (
            <div className="flex items-center gap-2 text-xs text-[#EF4444] mt-2">
              <XCircle className="w-3.5 h-3.5" />
              <span>{saveError}</span>
            </div>
          )}
        </div>

        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-[#F59E0B]" /> Security Events
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#A7B0C0]" />
            </div>
          ) : securityLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Inbox className="w-10 h-10 text-[#A7B0C0] mb-3" />
              <p className="text-sm font-medium text-[#A7B0C0] mb-1">No security events recorded</p>
              <p className="text-xs text-[#A7B0C0]">Events will appear here as they occur</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-3 pr-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Event</th>
                    <th className="text-left py-3 pr-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">IP</th>
                    <th className="text-left py-3 pr-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Severity</th>
                    <th className="text-left py-3 pr-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Blocked</th>
                    <th className="text-left py-3 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {securityLogs.map((event: any, i: number) => (
                    <motion.tr
                      key={event.id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 pr-4 text-xs text-white">{event.event_type || event.event || "—"}</td>
                      <td className="py-3 pr-4 text-xs font-mono text-[#A7B0C0]">{event.ip_address || event.ip_hash || "—"}</td>
                      <td className="py-3 pr-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${severityStyles[event.severity] || severityStyles.low}`}>{event.severity || "low"}</span></td>
                      <td className="py-3 pr-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${event.blocked ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20" : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"}`}>{event.blocked ? "Yes" : "No"}</span></td>
                      <td className="py-3 text-xs text-[#A7B0C0]">{event.created_at ? new Date(event.created_at).toLocaleString() : "—"}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
