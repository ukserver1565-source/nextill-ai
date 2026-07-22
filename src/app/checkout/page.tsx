"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, Check, Tag, X, CreditCard, Shield, ArrowLeft, Wallet, Smartphone, Building, Coins, Globe, Lock, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth/AuthProvider"

interface Plan {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_yearly: number
  credits: number
  features: string[]
  is_active: boolean
}

const FALLBACK_PLANS: Plan[] = [
  { id: "fb-free", name: "Free", slug: "free", price_monthly: 0, price_yearly: 0, credits: 100, is_active: true, features: ["1 Domain Intelligence check/day", "1 Post Generator test/day", "1 Plagiarism check/day", "1 project", "10 documents"] },
  { id: "fb-starter", name: "Starter", slug: "starter", price_monthly: 19, price_yearly: 190, credits: 2000, is_active: true, features: ["Domain Intelligence — basic analysis", "Post Generator — up to 2,000 words", "5 projects", "50 documents", "Email support"] },
  { id: "fb-pro", name: "Pro", slug: "pro", price_monthly: 49, price_yearly: 490, credits: 7500, is_active: true, features: ["Everything in Starter", "Domain Intelligence — full live metrics", "Post Generator — up to 5,000 words", "25 projects", "500 documents", "Priority email support"] },
  { id: "fb-business", name: "Business", slug: "business", price_monthly: 99, price_yearly: 990, credits: 20000, is_active: true, features: ["Everything in Pro", "Post Generator — up to 10,000 words", "100 projects", "5,000 documents", "Unlimited report history", "Priority support"] },
]

interface PublicPaymentMethod {
  id: string
  name: string
  icon: string
  type: string
  description: string
  sort_order: number
}

const CHECKOUT_ICON_MAP: Record<string, any> = {
  "credit-card": CreditCard, "wallet": Wallet, "smartphone": Smartphone,
  "building": Building, "coins": Coins, "globe": Globe,
}

function getCheckoutIcon(icon: string) { return CHECKOUT_ICON_MAP[icon] || CreditCard }

function CheckoutContent() {
  const searchParams = useSearchParams()
  const planSlug = searchParams.get("plan") || "pro"
  const billingParam = searchParams.get("billing") || "monthly"
  const couponParam = searchParams.get("coupon") || ""

  const { profile } = useAuth()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [billing, setBilling] = useState<"monthly" | "yearly">(billingParam as "monthly" | "yearly")
  const [couponCode, setCouponCode] = useState(couponParam)
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount: number; type: string; message: string } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [paymentMethods, setPaymentMethods] = useState<PublicPaymentMethod[]>([])
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  // Step: "review" = original checkout, "payment" = card details form
  const [step, setStep] = useState<"review" | "payment">("review")
  // Card details
  const [cardName, setCardName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCVV, setCardCVV] = useState("")

  useEffect(() => {
    fetch("/api/public/plans")
      .then(r => r.json())
      .then(data => {
        const plans = (Array.isArray(data) && data.length > 0) ? data : FALLBACK_PLANS
        const found = plans.find((p: any) => p.slug === planSlug || p.name?.toLowerCase() === planSlug)
        if (found) setPlan(found)
      })
      .catch(() => { const found = FALLBACK_PLANS.find(p => p.slug === planSlug); if (found) setPlan(found) })
      .finally(() => setLoading(false))
  }, [planSlug])

  useEffect(() => {
    fetch("/api/public/payment-methods")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPaymentMethods(data)
          if (data.length > 0 && !selectedPaymentId) setSelectedPaymentId(data[0].id)
        }
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validateCoupon = useCallback(async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true); setCouponResult(null)
    try {
      const res = await fetch("/api/public/coupons/validate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), billing_cycle: billing, plan_slug: plan?.slug }),
      })
      const data = await res.json()
      setCouponResult({ valid: data.valid || false, discount: data.discount || 0, type: data.type || "", message: data.message || "Invalid coupon" })
    } catch { setCouponResult({ valid: false, discount: 0, type: "", message: "Failed to validate coupon" }) }
    finally { setCouponLoading(false) }
  }, [couponCode, billing, plan])

  const getPrice = () => plan ? (billing === "yearly" ? plan.price_yearly : plan.price_monthly) : 0
  const getFinalPrice = () => {
    const price = getPrice()
    if (!couponResult?.valid || price === 0) return price
    if (couponResult.type === "percentage") return Math.round(price * (1 - couponResult.discount / 100) * 100) / 100
    if (couponResult.type === "fixed") return Math.max(0, price - couponResult.discount)
    return price
  }

  const handleCheckout = async () => {
    setProcessing(true); setError("")
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_slug: plan?.slug, billing_cycle: billing, coupon_code: couponResult?.valid ? couponCode : undefined, payment_method_id: selectedPaymentId || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Checkout failed."); return }
      if (data.checkout_url) { window.location.href = data.checkout_url }
      else if (data.success) { window.location.href = "/dashboard" }
      else { setError(data.error || "Payment not configured.") }
    } catch { setError("Payment processing unavailable.") }
    finally { setProcessing(false) }
  }

  const formatCardNumber = (val: string) => val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()
  const formatExpiry = (val: string) => {
    const d = val.replace(/\D/g, "").slice(0, 4)
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d
  }

  const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentId)
  const price = getPrice()
  const finalPrice = getFinalPrice()
  const isFree = price === 0
  const discountAmount = price - finalPrice

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-6 h-6 animate-spin text-[#6D5EF5]" />
    </div>
  )

  if (!plan) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-sm text-muted mb-4">Plan not found</p>
        <Link href="/pricing" className="text-sm text-[#6D5EF5] hover:underline">View Plans</Link>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════
  // STEP 2: PAYMENT DETAILS (shown after clicking Proceed to Payment)
  // ════════════════════════════════════════════════════════════
  if (step === "payment" && !isFree) {
    return (
      <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-10 sm:pb-16 px-3 sm:px-4">
        <div className="w-full max-w-2xl mx-auto">
          <button onClick={() => { setStep("review"); setError("") }} className="inline-flex items-center gap-2 text-sm text-[#A7B0C0] hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Checkout
          </button>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Payment Details</h1>
          <p className="text-muted text-sm mb-6">Enter your payment information to complete the purchase.</p>

          {/* Payment Method Info */}
          {selectedMethod && (
            <div className="glass-card rounded-2xl p-5 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6D5EF5]/10 flex items-center justify-center">
                {(() => { const I = getCheckoutIcon(selectedMethod.icon); return <I className="w-5 h-5 text-[#6D5EF5]" /> })()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{selectedMethod.name}</p>
                <p className="text-[11px] text-[#A7B0C0]">{selectedMethod.description}</p>
              </div>
            </div>
          )}

          {/* Card Details Form */}
          <div className="glass-card rounded-2xl p-5 mb-4">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#22C55E]" /> Card Information
            </h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#A7B0C0]">Cardholder Name</label>
                <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="John Smith"
                  className="w-full h-11 px-4 rounded-lg bg-[#090B16] border border-white/[0.06] text-sm text-white placeholder-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#A7B0C0]">Card Number</label>
                <input value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19}
                  className="w-full h-11 px-4 rounded-lg bg-[#090B16] border border-white/[0.06] text-sm text-white font-mono placeholder-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-[#A7B0C0]">Expiry Date</label>
                  <input value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" maxLength={5}
                    className="w-full h-11 px-4 rounded-lg bg-[#090B16] border border-white/[0.06] text-sm text-white font-mono placeholder-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-[#A7B0C0]">CVV</label>
                  <input value={cardCVV} onChange={e => setCardCVV(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" maxLength={4} type="password"
                    className="w-full h-11 px-4 rounded-lg bg-[#090B16] border border-white/[0.06] text-sm text-white font-mono placeholder-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="glass-card rounded-2xl p-5 mb-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#6D5EF5]" /> Order Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#A7B0C0]">Plan</span>
                <span className="text-sm font-medium text-white">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#A7B0C0]">Billing</span>
                <span className="text-sm text-white capitalize">{billing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#A7B0C0]">Credits</span>
                <span className="text-sm text-white">{plan.credits.toLocaleString()}/month</span>
              </div>
              {couponResult?.valid && (
                <div className="flex justify-between">
                  <span className="text-sm text-[#A7B0C0]">Discount ({couponResult.type === "percentage" ? `${couponResult.discount}%` : `$${couponResult.discount}`})</span>
                  <span className="text-sm font-medium text-emerald-400">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-white/[0.06]">
                <span className="text-sm font-semibold text-white">Total</span>
                <span className="text-xl font-bold text-white">
                  ${finalPrice}
                  <span className="text-xs font-normal text-[#A7B0C0]">/{billing === "yearly" ? "year" : "month"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 mb-4">
              <p className="text-sm text-[#EF4444]">{error}</p>
            </div>
          )}

          {/* Confirm Payment */}
          <button onClick={handleCheckout} disabled={processing}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6D5EF5] to-[#4CC9F0] text-white font-medium flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-[#6D5EF5]/20">
            {processing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
              <><Lock className="w-4 h-4" /> Confirm Payment — ${finalPrice}</>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-[#A7B0C0]/60">
            <Shield className="w-3 h-3" />
            <span>Secure checkout · Your payment info is encrypted</span>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // STEP 1: REVIEW (original checkout design)
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-10 sm:pb-16 px-3 sm:px-4">
      <div className="w-full max-w-2xl mx-auto">
        <Link href="/pricing" className="inline-flex items-center gap-2 text-sm text-[#A7B0C0] hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Pricing
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Checkout</h1>
        <p className="text-muted text-sm mb-8">Complete your purchase to activate your plan.</p>

        {/* Plan Summary */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">{plan.name} Plan</h2>

          {/* Billing Toggle */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setBilling("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billing === "monthly" ? "bg-[#6D5EF5] text-white" : "text-[#A7B0C0] hover:text-white"}`}>
              Monthly
            </button>
            <button onClick={() => setBilling("yearly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billing === "yearly" ? "bg-[#6D5EF5] text-white" : "text-[#A7B0C0] hover:text-white"}`}>
              Yearly
              <span className="ml-1.5 text-[10px] font-bold text-emerald-400">Save 2 months</span>
            </button>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            {couponResult?.valid && finalPrice !== price ? (
              <>
                <span className="text-lg text-[#A7B0C0] line-through">${price}</span>
                <span className="text-3xl font-bold text-emerald-400">${finalPrice}</span>
              </>
            ) : (
              <span className="text-3xl font-bold">{isFree ? "Free" : `$${price}`}</span>
            )}
            {!isFree && <span className="text-sm text-muted">/{billing === "yearly" ? "year" : "month"}</span>}
          </div>

          <p className="text-sm text-muted mb-4">{plan.credits.toLocaleString()} credits per month</p>

          {/* Features */}
          <ul className="space-y-2">
            {plan.features.slice(0, 6).map((f: string) => (
              <li key={f} className="text-xs text-muted flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#6D5EF5] shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Coupon */}
        {!isFree && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-[#6D5EF5]" />
              <span className="text-sm font-medium">Have a coupon?</span>
            </div>
            <div className="flex gap-2">
              <input type="text" value={couponCode}
                onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null) }}
                placeholder="Enter coupon code"
                className="flex-1 h-10 px-3 rounded-lg bg-[#090B16] border border-white/[0.06] text-sm text-white placeholder-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 font-mono uppercase" />
              <button onClick={validateCoupon} disabled={couponLoading || !couponCode.trim()}
                className="h-10 px-4 rounded-lg bg-[#6D5EF5] text-white text-xs font-medium hover:brightness-110 transition-all disabled:opacity-50">
                {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
              </button>
            </div>
            {couponResult && (
              <div className={`mt-3 flex items-center gap-2 text-xs ${couponResult.valid ? "text-emerald-400" : "text-[#EF4444]"}`}>
                {couponResult.valid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                {couponResult.message}
              </div>
            )}
          </div>
        )}

        {/* Payment Method Selection (radio buttons — original style) */}
        {paymentMethods.length > 0 && !isFree && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#6D5EF5]" />
              Select Payment Method
            </h3>
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const IconComponent = getCheckoutIcon(method.icon)
                const isSelected = selectedPaymentId === method.id
                return (
                  <button key={method.id} onClick={() => setSelectedPaymentId(method.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      isSelected ? "bg-[#6D5EF5]/10 border-[#6D5EF5]/40" : "bg-[#090B16] border-white/[0.06] hover:border-white/[0.12]"
                    }`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-[#6D5EF5]/20" : "bg-white/[0.04]"}`}>
                      <IconComponent className={`w-4 h-4 ${isSelected ? "text-[#6D5EF5]" : "text-[#A7B0C0]"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isSelected ? "text-white" : "text-[#A7B0C0]"}`}>{method.name}</p>
                      <p className="text-[11px] text-[#A7B0C0]/70 truncate">{method.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-[#6D5EF5] bg-[#6D5EF5]" : "border-white/20"}`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-[#EF4444]">{error}</p>
          </div>
        )}

        {/* Current Plan Notice */}
        {profile?.plan === plan.slug && (
          <div className="bg-[#6D5EF5]/10 border border-[#6D5EF5]/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-[#6D5EF5]">You are currently on the {plan.name} plan.</p>
          </div>
        )}

        {/* Proceed to Payment Button */}
        <button onClick={() => { setStep("payment"); setError("") }}
          disabled={isFree || (!isFree && paymentMethods.length > 0 && !selectedPaymentId)}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6D5EF5] to-[#4CC9F0] text-white font-medium flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50">
          {isFree ? (
            "Get Started Free"
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Proceed to Payment
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-[#A7B0C0]/60">
          <Shield className="w-3 h-3" />
          <span>Secure checkout powered by your payment provider</span>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-6 h-6 animate-spin text-[#6D5EF5]" /></div>}>
      <CheckoutContent />
    </Suspense>
  )
}
