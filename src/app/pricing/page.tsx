"use client"

import { useState, useEffect, useCallback } from "react"
import { Check, Loader2, Zap, Tag, X } from "lucide-react"
import Link from "next/link"

interface Plan {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_yearly: number
  credits: number
  features: string[]
  is_active: boolean
  is_popular: boolean
  badge: string | null
  max_projects: number
  max_documents: number
  max_article_length: number
  max_reports_per_month: number
  report_history_days: number
  exports: string[]
  support_level: string
  sort_order: number
}

interface WorkflowCost {
  workflow_slug: string
  credits_cost: number
}

const defaultCreditCosts: WorkflowCost[] = [
  { workflow_slug: "domain-intelligence", credits_cost: 2 },
  { workflow_slug: "post-generator", credits_cost: 10 },
  { workflow_slug: "plagiarism-checker", credits_cost: 4 },
]

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [couponCode, setCouponCode] = useState("")
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount: number; type: string; message: string } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [creditCosts, setCreditCosts] = useState<WorkflowCost[]>(defaultCreditCosts)

  const loadPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/public/plans")
      if (!res.ok) throw new Error("Failed to load")
      const json = await res.json()
      const data = Array.isArray(json) ? json : json.data || []
      setPlans(data
        .filter((p: Plan) => p.is_active !== false)
        .sort((a: Plan, b: Plan) => (a.sort_order ?? 99) - (b.sort_order ?? 99))
      )
    } catch { /* empty */ } finally {
      setLoading(false)
    }
  }, [])

  const loadCreditCosts = useCallback(async () => {
    try {
      const res = await fetch("/api/public/workflow-settings")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setCreditCosts(data.map((w: any) => ({
            workflow_slug: w.workflow_slug,
            credits_cost: w.credits_cost,
          })))
        }
      }
    } catch { /* use defaults */ }
  }, [])

  useEffect(() => { loadPlans(); loadCreditCosts() }, [loadPlans, loadCreditCosts])

  const validateCoupon = useCallback(async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponResult(null)
    try {
      const res = await fetch("/api/public/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), billing_cycle: billingCycle }),
      })
      const data = await res.json()
      setCouponResult({
        valid: data.valid || false,
        discount: data.discount || 0,
        type: data.type || "",
        message: data.message || "Invalid coupon",
      })
    } catch {
      setCouponResult({ valid: false, discount: 0, type: "", message: "Failed to validate coupon" })
    } finally {
      setCouponLoading(false)
    }
  }, [couponCode, billingCycle])

  const getDisplayPrice = (plan: Plan) => {
    return billingCycle === "yearly" ? plan.price_yearly : plan.price_monthly
  }

  const getMonthlyEquivalent = (plan: Plan) => {
    if (billingCycle === "yearly" && plan.price_yearly > 0) {
      return Math.round(plan.price_yearly / 12)
    }
    return plan.price_monthly
  }

  const getSavings = (plan: Plan) => {
    if (billingCycle !== "yearly" || plan.price_yearly === 0) return null
    const yearlyMonthly = Math.round(plan.price_yearly / 12)
    const savings = plan.price_monthly - yearlyMonthly
    return savings > 0 ? savings : null
  }

  const getDiscountedPrice = (plan: Plan) => {
    const price = getDisplayPrice(plan)
    if (!couponResult?.valid || price === 0) return price
    if (couponResult.type === "percentage") {
      return Math.round(price * (1 - couponResult.discount / 100) * 100) / 100
    } else if (couponResult.type === "fixed") {
      return Math.max(0, price - couponResult.discount)
    }
    return price
  }

  const getCreditCost = (slug: string) => {
    return creditCosts.find(c => c.workflow_slug === slug)?.credits_cost || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 pb-10 sm:pb-16 px-3 sm:px-4 flex items-start justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary-light" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-10 sm:pb-16 px-3 sm:px-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2 sm:mb-3">Simple, Transparent Pricing</h1>
          <p className="text-muted text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-2">
            Choose the plan that fits your needs. Upgrade or downgrade at any time.
          </p>
        </div>

        {/* Monthly/Yearly Toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${billingCycle === "monthly" ? "bg-[#6D5EF5] text-white shadow-lg shadow-[#6D5EF5]/20" : "text-[#A7B0C0] hover:text-white"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${billingCycle === "yearly" ? "bg-[#6D5EF5] text-white shadow-lg shadow-[#6D5EF5]/20" : "text-[#A7B0C0] hover:text-white"}`}
          >
            Yearly
            <span className="ml-1.5 text-[10px] font-bold text-emerald-400">Save 2 months</span>
          </button>
        </div>

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted text-sm">No plans available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-lg sm:max-w-none mx-auto">
            {plans.map((plan) => {
              const displayPrice = getDisplayPrice(plan)
              const monthlyEquiv = getMonthlyEquivalent(plan)
              const savings = getSavings(plan)
              const finalPrice = getDiscountedPrice(plan)
              const hasDiscount = couponResult?.valid && finalPrice !== displayPrice
              const isFree = displayPrice === 0

              return (
                <div key={plan.id} className={`relative glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 ${plan.is_popular ? "border-[#6D5EF5]/40 ring-1 ring-[#6D5EF5]/20" : ""}`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6D5EF5] text-white text-[9px] sm:text-[10px] font-bold px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                      {plan.badge}
                    </div>
                  )}

                  <h3 className="text-base sm:text-lg font-bold mb-1">{plan.name}</h3>

                  <div className="mb-3 sm:mb-4">
                    {hasDiscount ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg text-[#A7B0C0] line-through">${displayPrice}</span>
                        <span className="text-2xl sm:text-3xl font-bold text-emerald-400">${finalPrice}</span>
                        <span className="text-xs sm:text-sm text-muted">/{billingCycle === "yearly" ? "year" : "month"}</span>
                      </div>
                    ) : isFree ? (
                      <span className="text-2xl sm:text-3xl font-bold">Free</span>
                    ) : (
                      <div>
                        <span className="text-2xl sm:text-3xl font-bold">${displayPrice}</span>
                        <span className="text-xs sm:text-sm text-muted">/{billingCycle === "yearly" ? "year" : "month"}</span>
                        {billingCycle === "yearly" && monthlyEquiv > 0 && (
                          <span className="block text-[11px] text-emerald-400 mt-0.5">That&apos;s ${monthlyEquiv}/month</span>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-muted mb-3 sm:mb-4">{plan.credits.toLocaleString()} credits per month</p>

                  {/* CTA Button */}
                  {isFree ? (
                    <Link href="/signup">
                      <button className="w-full py-2.5 rounded-lg text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-white/[0.12] hover:bg-white/[0.04] transition-colors">
                        Get Started
                      </button>
                    </Link>
                  ) : (
                    <Link href={`/signup?plan=${plan.slug}&billing=${billingCycle}${couponResult?.valid ? `&coupon=${couponCode}` : ""}`}>
                      <button className={`w-full py-2.5 rounded-lg text-xs sm:text-sm font-semibold mb-4 sm:mb-6 transition-colors ${plan.is_popular ? "bg-[#6D5EF5] text-white hover:brightness-110 shadow-lg shadow-[#6D5EF5]/20" : "border border-white/[0.12] hover:bg-white/[0.04]"}`}>
                        Choose {plan.name}
                      </button>
                    </Link>
                  )}

                  {/* Features */}
                  <ul className="space-y-2 sm:space-y-2.5">
                    {plan.features.map((f: string) => (
                      <li key={f} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <Check className="w-3.5 h-3.5 text-[#6D5EF5] shrink-0 mt-0.5" />
                        <span className="text-[#A7B0C0]">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Limits */}
                  <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#A7B0C0]">Projects</span>
                      <span className="text-white font-medium">{plan.max_projects}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#A7B0C0]">Documents</span>
                      <span className="text-white font-medium">{plan.max_documents}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#A7B0C0]">Max article length</span>
                      <span className="text-white font-medium">{plan.max_article_length.toLocaleString()} words</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#A7B0C0]">Report history</span>
                      <span className="text-white font-medium">{plan.report_history_days >= 9999 ? "Unlimited" : `${plan.report_history_days} days`}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Coupon Section */}
        <div className="mt-10 sm:mt-12 max-w-md mx-auto">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-[#6D5EF5]" />
              <span className="text-sm font-medium text-white">Have a coupon?</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null) }}
                placeholder="Enter coupon code"
                className="flex-1 h-10 px-3 rounded-lg bg-[#090B16] border border-white/[0.06] text-sm text-white placeholder-[#A7B0C0] focus:outline-none focus:border-[#6D5EF5]/50 font-mono uppercase"
              />
              <button
                onClick={validateCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="h-10 px-4 rounded-lg bg-[#6D5EF5] text-white text-xs font-medium hover:brightness-110 transition-all disabled:opacity-50"
              >
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
        </div>

        {/* How Credits Work */}
        <div className="mt-12 sm:mt-16 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">How Credits Work</h2>
            <p className="text-muted text-sm">Each action costs credits. Credits reset monthly with your plan.</p>
          </div>
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-4 text-xs text-[#A7B0C0] font-medium uppercase">Action</th>
                  <th className="text-right p-4 text-xs text-[#A7B0C0] font-medium uppercase">Credits</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/[0.03]">
                  <td className="p-4 text-white text-xs sm:text-sm">Domain Intelligence — basic/local</td>
                  <td className="p-4 text-right"><span className="inline-flex items-center gap-1 text-xs font-medium text-[#6D5EF5]"><Zap className="w-3 h-3" />{getCreditCost("domain-intelligence")}</span></td>
                </tr>
                <tr className="border-b border-white/[0.03]">
                  <td className="p-4 text-white text-xs sm:text-sm">Post Generator — 1,000 words</td>
                  <td className="p-4 text-right"><span className="inline-flex items-center gap-1 text-xs font-medium text-[#6D5EF5]"><Zap className="w-3 h-3" />5</span></td>
                </tr>
                <tr className="border-b border-white/[0.03]">
                  <td className="p-4 text-white text-xs sm:text-sm">Post Generator — 2,000 words</td>
                  <td className="p-4 text-right"><span className="inline-flex items-center gap-1 text-xs font-medium text-[#6D5EF5]"><Zap className="w-3 h-3" />8</span></td>
                </tr>
                <tr className="border-b border-white/[0.03]">
                  <td className="p-4 text-white text-xs sm:text-sm">Post Generator — 5,000 words</td>
                  <td className="p-4 text-right"><span className="inline-flex items-center gap-1 text-xs font-medium text-[#6D5EF5]"><Zap className="w-3 h-3" />20</span></td>
                </tr>
                <tr className="border-b border-white/[0.03]">
                  <td className="p-4 text-white text-xs sm:text-sm">Plagiarism & Authenticity check</td>
                  <td className="p-4 text-right"><span className="inline-flex items-center gap-1 text-xs font-medium text-[#6D5EF5]"><Zap className="w-3 h-3" />{getCreditCost("plagiarism-checker")}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-center text-xs text-[#A7B0C0] mt-4">Credit costs are configured by the admin and may vary.</p>
        </div>
      </div>
    </div>
  )
}
