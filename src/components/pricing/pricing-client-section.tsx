"use client"

import { useState, useCallback } from "react"
import { Loader2, Zap, Tag, Check, X } from "lucide-react"
import { PricingCard } from "@/components/pricing/pricing-card"
import type { PlanData } from "@/lib/data/plans"

interface WorkflowCost {
  workflow_slug: string
  credits_cost: number
}

interface Props {
  initialPlans: PlanData[]
  initialCreditCosts: WorkflowCost[]
}

export function PricingClientSection({ initialPlans, initialCreditCosts }: Props) {
  const [plans] = useState(initialPlans)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [couponCode, setCouponCode] = useState("")
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount: number; type: string; message: string } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [creditCosts] = useState(initialCreditCosts)

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

  const getCreditCost = (slug: string) => {
    return creditCosts.find(c => c.workflow_slug === slug)?.credits_cost || 0
  }

  return (
    <>
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

      {/* Plans Grid — rendered server-side via initialPlans, interactive via client state */}
      {plans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted text-sm">No plans available at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-lg sm:max-w-none mx-auto">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              couponResult={couponResult}
              couponCode={couponCode}
            />
          ))}
        </div>
      )}

      {/* Coupon Section — only when plans loaded */}
      {plans.length > 0 && (
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
      )}

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
    </>
  )
}
