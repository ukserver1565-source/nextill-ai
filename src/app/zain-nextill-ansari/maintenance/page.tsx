"use client"

import { useState, useEffect } from "react"
import { Wrench, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function MaintenancePage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [message, setMessage] = useState("We are currently performing scheduled maintenance. We'll be back shortly.")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(data => {
        if (data.maintenance_mode !== undefined) setMaintenanceMode(data.maintenance_mode === "true" || data.maintenance_mode === true)
        if (data.maintenance_message) setMessage(data.maintenance_message)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = async () => {
    setSaving(true)
    setSaveError("")
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenance_mode: (!maintenanceMode).toString() }),
      })
      if (!res.ok) throw new Error("Failed")
      setMaintenanceMode(!maintenanceMode)
    } catch (e: any) { setSaveError(e.message || "Failed to toggle") } finally {
      setSaving(false)
    }
  }

  const handleSaveMessage = async () => {
    setSaving(true)
    setSaveError("")
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenance_message: message }),
      })
      if (!res.ok) throw new Error("Failed")
    } catch (e: any) { setSaveError(e.message || "Failed to save") } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Maintenance</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">System maintenance mode controls</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin" />
        </div>
      ) : (
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between p-5 rounded-xl bg-[#090B16] border border-white/[0.06]">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${maintenanceMode ? "bg-[#EF4444]/10" : "bg-[#22C55E]/10"}`}>
                <Wrench className={`w-6 h-6 ${maintenanceMode ? "text-[#EF4444]" : "text-[#22C55E]"}`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Maintenance Mode</h3>
                <p className="text-xs text-[#A7B0C0]">{maintenanceMode ? "Site is in maintenance mode" : "Site is publicly accessible"}</p>
              </div>
            </div>
            <button onClick={handleToggle} disabled={saving} className="relative w-14 h-7 rounded-full transition-colors disabled:opacity-50" style={{ backgroundColor: maintenanceMode ? "#EF4444" : "#22C55E" }}>
              <div className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform shadow" style={{ transform: maintenanceMode ? "translateX(28px)" : "translateX(2px)" }} />
            </button>
          </div>

          {maintenanceMode && (
            <div className="space-y-3">
              <label className="text-xs font-medium text-[#A7B0C0]">Custom Maintenance Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
                className="w-full px-4 py-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all resize-none" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#A7B0C0]">
                  Current status: <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${maintenanceMode ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20" : "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"}`}>
                    {maintenanceMode ? <XCircle className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                    {maintenanceMode ? "Under Maintenance" : "Live"}
                  </span>
                </div>
                <button onClick={handleSaveMessage} disabled={saving} className="h-9 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save
                </button>
              </div>
            </div>
          )}
          {saveError && <p className="text-xs text-[#EF4444]">{saveError}</p>}
        </div>
      )}
    </div>
  )
}
