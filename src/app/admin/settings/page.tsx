"use client"

import { useState, useEffect } from "react"
import { Save, Globe, ToggleLeft, Coins, Loader2, Link2, Plus, Trash2, GripVertical, Eye, EyeOff, MessageCircle, Instagram, Facebook, Hash, AtSign, CreditCard, ChevronUp, ChevronDown, Wallet, Smartphone, Building, Coins as CoinsIcon, Globe as GlobeIcon, Pencil, X } from "lucide-react"

interface SocialLink {
  name: string
  url: string
  icon: string
  is_visible: boolean
}

interface PaymentMethod {
  id: string
  name: string
  enabled: boolean
  icon: string
  type: string
  description: string
  wallet_address: string
  qr_code_url: string
  instructions: string
  sort_order: number
}

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "stripe", name: "Stripe", enabled: true, icon: "credit-card", type: "card", description: "Credit/Debit Cards via Stripe", wallet_address: "", qr_code_url: "", instructions: "", sort_order: 0 },
  { id: "paypal", name: "PayPal", enabled: false, icon: "wallet", type: "online", description: "PayPal online payments", wallet_address: "", qr_code_url: "", instructions: "", sort_order: 1 },
  { id: "jazzcash", name: "JazzCash", enabled: false, icon: "smartphone", type: "mobile", description: "JazzCash mobile wallet", wallet_address: "", qr_code_url: "", instructions: "", sort_order: 2 },
  { id: "easypaisa", name: "EasyPaisa", enabled: false, icon: "smartphone", type: "mobile", description: "EasyPaisa mobile wallet", wallet_address: "", qr_code_url: "", instructions: "", sort_order: 3 },
  { id: "bank_transfer", name: "Bank Transfer", enabled: false, icon: "building", type: "bank", description: "Direct bank transfer", wallet_address: "", qr_code_url: "", instructions: "", sort_order: 4 },
  { id: "binance_pay", name: "Binance Pay", enabled: false, icon: "coins", type: "crypto", description: "Crypto payments via Binance", wallet_address: "", qr_code_url: "", instructions: "", sort_order: 5 },
  { id: "crypto_wallet", name: "Crypto Wallet", enabled: false, icon: "wallet", type: "crypto", description: "Direct crypto wallet transfer", wallet_address: "", qr_code_url: "", instructions: "", sort_order: 6 },
  { id: "payoneer", name: "Payoneer", enabled: false, icon: "globe", type: "online", description: "Payoneer international payments", wallet_address: "", qr_code_url: "", instructions: "", sort_order: 7 },
  { id: "paddle", name: "Paddle", enabled: false, icon: "credit-card", type: "card", description: "Paddle payment processing", wallet_address: "", qr_code_url: "", instructions: "", sort_order: 8 },
]

const PAYMENT_ICON_OPTIONS: Record<string, { label: string; Icon: any }> = {
  "credit-card": { label: "Credit Card", Icon: CreditCard },
  "wallet": { label: "Wallet", Icon: Wallet },
  "smartphone": { label: "Smartphone", Icon: Smartphone },
  "building": { label: "Building", Icon: Building },
  "coins": { label: "Coins", Icon: CoinsIcon },
  "globe": { label: "Globe", Icon: GlobeIcon },
}

function getPaymentIcon(icon: string) {
  return PAYMENT_ICON_OPTIONS[icon]?.Icon || CreditCard
}

const PAYMENT_TYPE_OPTIONS = [
  { value: "card", label: "Card" },
  { value: "online", label: "Online" },
  { value: "mobile", label: "Mobile" },
  { value: "bank", label: "Bank" },
  { value: "crypto", label: "Crypto" },
]

const SOCIAL_ICON_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
  { value: "instagram", label: "Instagram", Icon: Instagram },
  { value: "facebook", label: "Facebook", Icon: Facebook },
  { value: "twitter", label: "X (Twitter)", Icon: Hash },
  { value: "tiktok", label: "TikTok", Icon: AtSign },
]

function SocialIconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 px-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all"
    >
      {SOCIAL_ICON_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export default function SettingsPage() {
  const [form, setForm] = useState({
    siteName: "Nextill AI",
    description: "AI-powered SEO and content generation platform",
    logoUrl: "/logo.png",
  })
  const [registrationOpen, setRegistrationOpen] = useState(true)
  const [defaultCredits, setDefaultCredits] = useState(5000)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(DEFAULT_PAYMENT_METHODS)
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null)
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
        if (data.social_links) {
          try {
            const parsed = typeof data.social_links === "string" ? JSON.parse(data.social_links) : data.social_links
            if (Array.isArray(parsed)) setSocialLinks(parsed)
          } catch { /* ignore */ }
        }
        if (data.payment_methods) {
          try {
            const parsed = typeof data.payment_methods === "string" ? JSON.parse(data.payment_methods) : data.payment_methods
            if (Array.isArray(parsed) && parsed.length > 0) setPaymentMethods(parsed)
          } catch { /* ignore */ }
        }
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
          social_links: socialLinks,
          payment_methods: paymentMethods,
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

          <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[#EC4899]" /> Social Links
            </h2>
            <p className="text-xs text-[#A7B0C0] -mt-3">Manage social media links shown on the contact page</p>
            <div className="space-y-3">
              {socialLinks.map((link, i) => {
                const iconOption = SOCIAL_ICON_OPTIONS.find(o => o.value === link.icon)
                const IconComponent = iconOption?.Icon || Link2
                return (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-[#090B16] border border-white/[0.06]">
                    <GripVertical className="w-4 h-4 text-[#A7B0C0]/40 cursor-grab shrink-0" />
                    <IconComponent className="w-4 h-4 text-[#A7B0C0] shrink-0" />
                    <input
                      value={link.name}
                      onChange={(e) => {
                        const next = [...socialLinks]
                        next[i] = { ...next[i], name: e.target.value }
                        setSocialLinks(next)
                      }}
                      placeholder="Name"
                      className="w-28 h-9 px-3 rounded-lg bg-[#151C2E] border border-white/[0.06] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all"
                    />
                    <SocialIconSelect
                      value={link.icon}
                      onChange={(v) => {
                        const next = [...socialLinks]
                        next[i] = { ...next[i], icon: v }
                        setSocialLinks(next)
                      }}
                    />
                    <input
                      value={link.url}
                      onChange={(e) => {
                        const next = [...socialLinks]
                        next[i] = { ...next[i], url: e.target.value }
                        setSocialLinks(next)
                      }}
                      placeholder="https://..."
                      className="flex-1 h-9 px-3 rounded-lg bg-[#151C2E] border border-white/[0.06] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all"
                    />
                    <button
                      onClick={() => {
                        const next = [...socialLinks]
                        next[i] = { ...next[i], is_visible: !next[i].is_visible }
                        setSocialLinks(next)
                      }}
                      className="p-2 rounded-lg hover:bg-white/[0.06] transition-all"
                      title={link.is_visible ? "Hide" : "Show"}
                    >
                      {link.is_visible ? (
                        <Eye className="w-3.5 h-3.5 text-[#22C55E]" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-[#A7B0C0]" />
                      )}
                    </button>
                    <button
                      onClick={() => setSocialLinks(socialLinks.filter((_, j) => j !== i))}
                      className="p-2 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-[#EF4444] transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => setSocialLinks([...socialLinks, { name: "", url: "", icon: "whatsapp", is_visible: true }])}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6D5EF5]/10 text-[#6D5EF5] text-xs font-medium hover:bg-[#6D5EF5]/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Social Link
            </button>
          </div>

          {/* Payment Methods Section */}
          <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#22C55E]" /> Payment Methods
                </h2>
                <p className="text-xs text-[#A7B0C0] mt-1">Manage available payment methods for checkout</p>
              </div>
              <span className="text-xs text-[#A7B0C0] bg-[#090B16] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                {paymentMethods.filter(m => m.enabled).length} enabled
              </span>
            </div>

            <div className="space-y-2">
              {paymentMethods.map((method, i) => {
                const IconComponent = getPaymentIcon(method.icon)
                const isEditing = editingPaymentId === method.id

                return (
                  <div key={method.id} className={`rounded-xl border transition-all ${isEditing ? "bg-[#090B16] border-[#6D5EF5]/30" : "bg-[#090B16] border-white/[0.06]"}`}>
                    {/* Method Header */}
                    <div className="flex items-center gap-2 p-3">
                      <IconComponent className="w-4 h-4 text-[#A7B0C0] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{method.name}</p>
                        <p className="text-[10px] text-[#A7B0C0] truncate">{method.description}</p>
                      </div>

                      {/* Reorder buttons */}
                      <div className="flex flex-col -space-y-0.5 shrink-0">
                        <button
                          onClick={() => {
                            if (i === 0) return
                            const next = [...paymentMethods]
                            const tempOrder = next[i].sort_order
                            next[i] = { ...next[i], sort_order: next[i - 1].sort_order }
                            next[i - 1] = { ...next[i - 1], sort_order: tempOrder }
                            setPaymentMethods(next.sort((a, b) => a.sort_order - b.sort_order))
                          }}
                          disabled={i === 0}
                          className="p-1 rounded hover:bg-white/[0.06] disabled:opacity-20 transition-all"
                        >
                          <ChevronUp className="w-3 h-3 text-[#A7B0C0]" />
                        </button>
                        <button
                          onClick={() => {
                            if (i === paymentMethods.length - 1) return
                            const next = [...paymentMethods]
                            const tempOrder = next[i].sort_order
                            next[i] = { ...next[i], sort_order: next[i + 1].sort_order }
                            next[i + 1] = { ...next[i + 1], sort_order: tempOrder }
                            setPaymentMethods(next.sort((a, b) => a.sort_order - b.sort_order))
                          }}
                          disabled={i === paymentMethods.length - 1}
                          className="p-1 rounded hover:bg-white/[0.06] disabled:opacity-20 transition-all"
                        >
                          <ChevronDown className="w-3 h-3 text-[#A7B0C0]" />
                        </button>
                      </div>

                      {/* Edit button */}
                      <button
                        onClick={() => setEditingPaymentId(isEditing ? null : method.id)}
                        className={`p-2 rounded-lg transition-all ${isEditing ? "bg-[#6D5EF5]/20 text-[#6D5EF5]" : "hover:bg-white/[0.06] text-[#A7B0C0]"}`}
                        title={isEditing ? "Close editor" : "Edit details"}
                      >
                        {isEditing ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                      </button>

                      {/* Enable/Disable toggle */}
                      <button
                        onClick={() => {
                          const next = [...paymentMethods]
                          next[i] = { ...next[i], enabled: !next[i].enabled }
                          setPaymentMethods(next)
                        }}
                        className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${method.enabled ? "bg-[#22C55E]" : "bg-white/[0.06]"}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${method.enabled ? "translate-x-6" : "translate-x-0.5"}`} />
                      </button>
                    </div>

                    {/* Edit Panel */}
                    {isEditing && (
                      <div className="px-3 pb-3 space-y-3 border-t border-white/[0.04] pt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-medium text-[#A7B0C0] uppercase tracking-wider">Name</label>
                            <input
                              value={method.name}
                              onChange={(e) => {
                                const next = [...paymentMethods]
                                next[i] = { ...next[i], name: e.target.value }
                                setPaymentMethods(next)
                              }}
                              className="w-full h-9 px-3 rounded-lg bg-[#151C2E] border border-white/[0.06] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-medium text-[#A7B0C0] uppercase tracking-wider">Type</label>
                            <select
                              value={method.type}
                              onChange={(e) => {
                                const next = [...paymentMethods]
                                next[i] = { ...next[i], type: e.target.value }
                                setPaymentMethods(next)
                              }}
                              className="w-full h-9 px-3 rounded-lg bg-[#151C2E] border border-white/[0.06] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all"
                            >
                              {PAYMENT_TYPE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-[#A7B0C0] uppercase tracking-wider">Description</label>
                          <input
                            value={method.description}
                            onChange={(e) => {
                              const next = [...paymentMethods]
                              next[i] = { ...next[i], description: e.target.value }
                              setPaymentMethods(next)
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#151C2E] border border-white/[0.06] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-[#A7B0C0] uppercase tracking-wider">Wallet Address</label>
                          <input
                            value={method.wallet_address}
                            onChange={(e) => {
                              const next = [...paymentMethods]
                              next[i] = { ...next[i], wallet_address: e.target.value }
                              setPaymentMethods(next)
                            }}
                            placeholder="Enter wallet address (for crypto/mobile payments)"
                            className="w-full h-9 px-3 rounded-lg bg-[#151C2E] border border-white/[0.06] text-white text-xs placeholder-[#A7B0C0]/40 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-[#A7B0C0] uppercase tracking-wider">QR Code URL</label>
                          <input
                            value={method.qr_code_url}
                            onChange={(e) => {
                              const next = [...paymentMethods]
                              next[i] = { ...next[i], qr_code_url: e.target.value }
                              setPaymentMethods(next)
                            }}
                            placeholder="https://... (URL to QR code image)"
                            className="w-full h-9 px-3 rounded-lg bg-[#151C2E] border border-white/[0.06] text-white text-xs placeholder-[#A7B0C0]/40 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-[#A7B0C0] uppercase tracking-wider">Instructions</label>
                          <textarea
                            value={method.instructions}
                            onChange={(e) => {
                              const next = [...paymentMethods]
                              next[i] = { ...next[i], instructions: e.target.value }
                              setPaymentMethods(next)
                            }}
                            rows={3}
                            placeholder="Payment instructions for customers..."
                            className="w-full px-3 py-2 rounded-lg bg-[#151C2E] border border-white/[0.06] text-white text-xs placeholder-[#A7B0C0]/40 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all resize-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-[#A7B0C0] uppercase tracking-wider">Icon</label>
                          <select
                            value={method.icon}
                            onChange={(e) => {
                              const next = [...paymentMethods]
                              next[i] = { ...next[i], icon: e.target.value }
                              setPaymentMethods(next)
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-[#151C2E] border border-white/[0.06] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all"
                          >
                            {Object.entries(PAYMENT_ICON_OPTIONS).map(([val, opt]) => (
                              <option key={val} value={val}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <p className="text-[10px] text-[#A7B0C0]/60">Use arrow buttons to reorder. Toggle enabled to show/hide during checkout.</p>
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
