"use client"

import { useState, useEffect, Suspense } from "react"
import { CreditCard, Loader2, ExternalLink, Plus, Trash2, Check, Globe, Smartphone, Building, Coins, Wallet, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthProvider"
import { supabase } from "@/lib/supabase/client"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

const PAYMENT_ICONS: Record<string, any> = {
  "credit-card": CreditCard, "wallet": Wallet, "smartphone": Smartphone,
  "building": Building, "coins": Coins, "globe": Globe,
}

interface PaymentMethod {
  id: string
  name: string
  type: string
  last4?: string
  brand?: string
  is_default: boolean
}

function BillingContent() {
  const searchParams = useSearchParams()
  const insufficientCredits = searchParams.get("insufficient_credits") === "true"
  const requiredCredits = searchParams.get("required") || "0"
  const availableCredits = searchParams.get("available") || "0"
  const { profile } = useAuth()
  const [subscription, setSubscription] = useState<any>(null)
  const [recentPayment, setRecentPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCard, setNewCard] = useState({ number: "", expiry: "", cvc: "", name: "" })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState("")

  useEffect(() => {
    if (!profile) return
    const uid = profile.user_id
    async function load() {
      try {
        const [subRes, payRes, pmRes] = await Promise.all([
          supabase.from("subscriptions").select("*").eq("user_id", uid).eq("status", "active").single(),
          supabase.from("payments").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).single(),
          supabase.from("site_settings").select("value").eq("key", "payment_methods").single(),
        ])
        setSubscription(subRes.data)
        setRecentPayment(payRes.data)
        // Parse payment methods from settings
        if (pmRes.data?.value) {
          try {
            const raw = typeof pmRes.data.value === "string" ? JSON.parse(pmRes.data.value) : pmRes.data.value
            if (Array.isArray(raw)) {
              setPaymentMethods(raw.filter((m: any) => m.enabled).map((m: any, i: number) => ({
                id: m.id || `pm_${i}`,
                name: m.name,
                type: m.type || "card",
                is_default: i === 0,
              })))
            }
          } catch { /* parse error */ }
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [profile])

  const plan = profile?.plan || "free"

  const handleAddCard = async () => {
    if (!newCard.number || !newCard.expiry || !newCard.cvc || !newCard.name) {
      setAddError("All fields are required")
      return
    }
    setAdding(true)
    setAddError("")
    try {
      // Simulate adding card (in production, this would call a payment provider API)
      const last4 = newCard.number.slice(-4)
      const newMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        name: `${newCard.name} •••• ${last4}`,
        type: "credit-card",
        last4,
        brand: newCard.number.startsWith("4") ? "Visa" : newCard.number.startsWith("5") ? "Mastercard" : "Card",
        is_default: paymentMethods.length === 0,
      }
      setPaymentMethods(prev => [...prev, newMethod])
      setNewCard({ number: "", expiry: "", cvc: "", name: "" })
      setShowAddForm(false)
    } catch {
      setAddError("Failed to add payment method")
    } finally {
      setAdding(false)
    }
  }

  const removePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(m => m.id !== id))
  }

  const setDefaultPaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.map(m => ({ ...m, is_default: m.id === id })))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted mt-1">Manage your subscription and billing information.</p>
      </div>

      {/* Insufficient Credits Banner */}
      {insufficientCredits && (
        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#F59E0B]">Insufficient Credits</p>
            <p className="text-xs text-[#A7B0C0] mt-1">
              You need {requiredCredits} credits but only have {availableCredits}. Add a payment method below to upgrade your plan and get more credits.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-muted mb-4 animate-spin" />
          <p className="text-sm text-muted">Loading billing information...</p>
        </div>
      ) : (
        <>
          {/* Current Subscription */}
          {subscription ? (
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Current Subscription</h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                  {subscription.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted mb-1">Plan</p>
                  <p className="text-sm font-medium text-white capitalize">{subscription.plan_slug || plan}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Current Period</p>
                  <p className="text-sm font-medium text-white">
                    {subscription.current_period_start ? new Date(subscription.current_period_start).toLocaleDateString() : "—"}
                    {" — "}
                    {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="w-5 h-5 text-muted" />
                <h3 className="text-sm font-semibold text-white">Free Plan</h3>
              </div>
              <p className="text-sm text-muted mb-4">
                You are currently on the Free plan. Upgrade to unlock premium AI tools and higher credit limits.
              </p>
              <Link href="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                View Plans <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Last Payment */}
          {recentPayment && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-3">Last Payment</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted">Amount</p>
                  <p className="text-lg font-bold text-white">${Number(recentPayment.amount || 0).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">Status</p>
                  <span className={`text-xs font-medium ${recentPayment.status === "completed" ? "text-[#22C55E]" : "text-[#F59E0B]"}`}>
                    {recentPayment.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Payment Methods</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#6D5EF5]/10 text-[#6D5EF5] border border-[#6D5EF5]/20 hover:bg-[#6D5EF5]/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Card
              </button>
            </div>

            {paymentMethods.length === 0 && !showAddForm ? (
              <div className="text-center py-8">
                <CreditCard className="w-10 h-10 text-[#A7B0C0]/30 mx-auto mb-3" />
                <p className="text-sm text-muted mb-1">No payment methods on file</p>
                <p className="text-xs text-[#A7B0C0]/60">Add a card to enable premium plan purchases.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = PAYMENT_ICONS[method.type] || CreditCard
                  return (
                    <div key={method.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#151C2E] border border-white/[0.06] flex items-center justify-center">
                          <Icon className="w-5 h-5 text-[#A7B0C0]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{method.name}</p>
                          <p className="text-xs text-[#A7B0C0]">
                            {method.brand || method.type}
                            {method.is_default && <span className="ml-2 text-[#22C55E]">• Default</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!method.is_default && (
                          <button
                            onClick={() => setDefaultPaymentMethod(method.id)}
                            className="text-xs text-[#6D5EF5] hover:underline"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => removePaymentMethod(method.id)}
                          className="p-1.5 rounded-lg text-[#A7B0C0] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Add Card Form */}
            {showAddForm && (
              <div className="mt-4 p-4 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-3">
                <h4 className="text-xs font-semibold text-white mb-2">Add Payment Card</h4>
                {addError && <p className="text-xs text-[#EF4444]">{addError}</p>}
                <div>
                  <label className="text-[10px] text-[#A7B0C0] mb-1 block">Cardholder Name</label>
                  <input
                    type="text"
                    value={newCard.name}
                    onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full h-9 px-3 rounded-lg bg-[#090B16] border border-white/[0.06] text-xs text-white placeholder-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#A7B0C0] mb-1 block">Card Number</label>
                  <input
                    type="text"
                    value={newCard.number}
                    onChange={(e) => setNewCard({ ...newCard, number: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                    placeholder="4242 4242 4242 4242"
                    maxLength={16}
                    className="w-full h-9 px-3 rounded-lg bg-[#090B16] border border-white/[0.06] text-xs text-white placeholder-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#A7B0C0] mb-1 block">Expiry</label>
                    <input
                      type="text"
                      value={newCard.expiry}
                      onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full h-9 px-3 rounded-lg bg-[#090B16] border border-white/[0.06] text-xs text-white placeholder-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A7B0C0] mb-1 block">CVC</label>
                    <input
                      type="text"
                      value={newCard.cvc}
                      onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      placeholder="123"
                      maxLength={4}
                      className="w-full h-9 px-3 rounded-lg bg-[#090B16] border border-white/[0.06] text-xs text-white placeholder-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 font-mono"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleAddCard}
                    disabled={adding}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6D5EF5] text-white text-xs font-medium hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    {adding ? "Adding..." : "Add Card"}
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setAddError("") }}
                    className="px-4 py-2 rounded-lg border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-[10px] text-[#A7B0C0]/60">
                  Test mode — card details are not sent to a real payment processor. Connect Stripe/PayPal in production.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function BillingPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>}>
      <BillingContent />
    </Suspense>
  )
}
