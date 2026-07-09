"use client"

import { useState } from "react"
import { Save, Mail, Send, Eye, EyeOff } from "lucide-react"

export default function EmailPage() {
  const [provider, setProvider] = useState<"smtp" | "resend">("smtp")
  const [showSmtpPass, setShowSmtpPass] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [form, setForm] = useState({
    smtpHost: "smtp.sendgrid.net",
    smtpPort: "587",
    smtpUser: "apikey",
    smtpPass: "",
    apiKey: "",
    fromEmail: "noreply@nextill.ai",
    fromName: "Nextill AI",
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Email Settings</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Configure SMTP or Resend email provider</p>
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-1 p-1 bg-[#090B16] rounded-xl border border-white/[0.06] w-fit">
          {(["smtp", "resend"] as const).map(p => (
            <button key={p} onClick={() => setProvider(p)} className={`px-5 py-2 rounded-lg text-xs font-medium transition-all capitalize ${provider === p ? "bg-[#6D5EF5] text-white shadow-lg shadow-[#6D5EF5]/20" : "text-[#A7B0C0] hover:text-white"}`}>
              {p === "smtp" ? <Mail className="w-3.5 h-3.5 inline mr-1.5" /> : <Send className="w-3.5 h-3.5 inline mr-1.5" />}
              {p}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#A7B0C0]">From Name</label>
              <input value={form.fromName} onChange={(e) => setForm(f => ({ ...f, fromName: e.target.value }))} className="w-full h-11 px-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#A7B0C0]">From Email</label>
              <input value={form.fromEmail} onChange={(e) => setForm(f => ({ ...f, fromEmail: e.target.value }))} className="w-full h-11 px-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
            </div>
          </div>

          {provider === "smtp" ? (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-[#A7B0C0] uppercase tracking-wider">SMTP Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#A7B0C0]">Host</label>
                  <input value={form.smtpHost} onChange={(e) => setForm(f => ({ ...f, smtpHost: e.target.value }))} className="w-full h-11 px-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#A7B0C0]">Port</label>
                  <input value={form.smtpPort} onChange={(e) => setForm(f => ({ ...f, smtpPort: e.target.value }))} className="w-full h-11 px-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#A7B0C0]">Username</label>
                  <input value={form.smtpUser} onChange={(e) => setForm(f => ({ ...f, smtpUser: e.target.value }))} className="w-full h-11 px-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#A7B0C0]">Password</label>
                  <div className="relative">
                    <input type={showSmtpPass ? "text" : "password"} value={form.smtpPass} onChange={(e) => setForm(f => ({ ...f, smtpPass: e.target.value }))} className="w-full h-11 px-4 pr-11 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
                    <button onClick={() => setShowSmtpPass(!showSmtpPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A7B0C0] hover:text-white">{showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-[#A7B0C0] uppercase tracking-wider">Resend Configuration</h3>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#A7B0C0]">API Key</label>
                <div className="relative">
                  <input type={showApiKey ? "text" : "password"} value={form.apiKey} onChange={(e) => setForm(f => ({ ...f, apiKey: e.target.value }))} placeholder="re_..." className="w-full h-11 px-4 pr-11 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
                  <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A7B0C0] hover:text-white">{showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} className="h-11 px-6 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
            <Save className="w-4 h-4" /> {saved ? "Saved!" : "Save Settings"}
          </button>
          <button className="h-11 px-6 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm font-medium flex items-center gap-2 hover:bg-white/[0.06] transition-all">
            <Send className="w-4 h-4" /> Test Email
          </button>
        </div>
      </div>
    </div>
  )
}
