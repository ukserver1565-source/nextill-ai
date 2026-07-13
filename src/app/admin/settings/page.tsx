"use client"

import { useState, useEffect } from "react"
import { Save, Globe, ToggleLeft, Coins, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [form, setForm] = useState({
    siteName: "Nextill AI",
    description: "AI-powered SEO and content generation platform",
    logoUrl: "/logo.png",
  })
  const [registrationOpen, setRegistrationOpen] = useState(true)
  const [defaultCredits, setDefaultCredits] = useState(5000)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(data => {
        if (data.siteName) setForm(f => ({ ...f, siteName: data.siteName }))
        if (data.description) setForm(f => ({ ...f, description: data.description }))
        if (data.logoUrl) setForm(f => ({ ...f, logoUrl: data.logoUrl }))
        if (data.registration_open !== undefined) setRegistrationOpen(data.registration_open === "true" || data.registration_open === true)
        if (data.default_credits) setDefaultCredits(Number(data.default_credits))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaveError("")
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: form.siteName,
          description: form.description,
          logoUrl: form.logoUrl,
          registration_open: registrationOpen ? "true" : "false",
          default_credits: defaultCredits.toString(),
        }),
      })
      if (!res.ok) throw new Error("Failed")
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) { setSaveError(e.message || "Failed to save") } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Configure your application settings</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#6D5EF5]" /> Site Settings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#A7B0C0]">Site Name</label>
                <input value={form.siteName} onChange={(e) => setForm(f => ({ ...f, siteName: e.target.value }))} className="w-full h-11 px-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5]/50 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#A7B0C0]">Logo URL</label>
                <input value={form.logoUrl} onChange={(e) => setForm(f => ({ ...f, logoUrl: e.target.value }))} className="w-full h-11 px-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5]/50 transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#A7B0C0]">Site Description</label>
              <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-4 py-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5]/50 transition-all resize-none" />
            </div>
          </div>

          <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <ToggleLeft className="w-4 h-4 text-[#4CC9F0]" /> Registration Settings
            </h2>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#090B16] border border-white/[0.06]">
              <div>
                <p className="text-sm text-white font-medium">Public Registration</p>
                <p className="text-xs text-[#A7B0C0] mt-0.5">Allow new users to sign up</p>
              </div>
              <button onClick={() => setRegistrationOpen(!registrationOpen)} className={`relative w-12 h-6 rounded-full transition-colors ${registrationOpen ? "bg-[#22C55E]" : "bg-white/[0.06]"}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${registrationOpen ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>

          <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#F59E0B]" /> Default Credits
            </h2>
            <div className="space-y-2 max-w-xs">
              <label className="text-xs font-medium text-[#A7B0C0]">New User Credits</label>
              <input type="number" value={defaultCredits} onChange={(e) => setDefaultCredits(Number(e.target.value))} className="w-full h-11 px-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5]/50 transition-all" />
            </div>
          </div>

          {saveError && <p className="text-xs text-[#EF4444]">{saveError}</p>}
          <button onClick={handleSave} disabled={saving} className="h-11 px-6 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      )}
    </div>
  )
}
