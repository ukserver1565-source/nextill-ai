"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Zap } from "lucide-react"
import { BackButton } from "@/components/shared/back-button"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { PricingCard } from "@/components/pricing/pricing-card"

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

const FALLBACK_PLANS: Plan[] = [
  {
    id: "fallback-free", name: "Free", slug: "free",
    price_monthly: 0, price_yearly: 0, credits: 100, is_active: true,
    is_popular: false, badge: null, sort_order: 0, support_level: "community",
    exports: ["txt"], max_projects: 1, max_documents: 10, max_article_length: 1500,
    max_reports_per_month: 1, report_history_days: 7,
    features: ["1 Domain Intelligence check/day", "1 Post Generator test/day", "1 Plagiarism check/day", "1 project", "10 documents"],
  },
  {
    id: "fallback-starter", name: "Starter", slug: "starter",
    price_monthly: 19, price_yearly: 190, credits: 2000, is_active: true,
    is_popular: false, badge: null, sort_order: 1, support_level: "email",
    exports: ["txt", "markdown"], max_projects: 5, max_documents: 50, max_article_length: 2000,
    max_reports_per_month: 20, report_history_days: 30,
    features: ["Domain Intelligence — basic analysis", "Post Generator — up to 2,000 words", "SEO title, meta, FAQ, schema", "5 projects", "50 documents", "Email support"],
  },
  {
    id: "fallback-pro", name: "Pro", slug: "pro",
    price_monthly: 49, price_yearly: 490, credits: 7500, is_active: true,
    is_popular: true, badge: "MOST POPULAR", sort_order: 2, support_level: "priority",
    exports: ["pdf", "csv", "txt", "markdown"], max_projects: 25, max_documents: 500, max_article_length: 5000,
    max_reports_per_month: 100, report_history_days: 365,
    features: ["Everything in Starter", "Domain Intelligence — full live metrics", "Competitor & backlink analysis", "Post Generator — up to 5,000 words", "25 projects", "500 documents", "Priority email support"],
  },
  {
    id: "fallback-business", name: "Business", slug: "business",
    price_monthly: 99, price_yearly: 990, credits: 20000, is_active: true,
    is_popular: false, badge: null, sort_order: 3, support_level: "priority",
    exports: ["pdf", "csv", "txt", "markdown"], max_projects: 100, max_documents: 5000, max_article_length: 10000,
    max_reports_per_month: 500, report_history_days: 9999,
    features: ["Everything in Pro", "Post Generator — up to 10,000 words", "100 projects", "5,000 documents", "Unlimited report history", "Priority support"],
  },
]

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [couponCode, _setCouponCode] = useState("")
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount: number; type: string; message: string } | null>(null)
  const [_couponLoading, setCouponLoading] = useState(false)
  const [creditCosts, setCreditCosts] = useState<WorkflowCost[]>(defaultCreditCosts)

  const loadPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/public/plans")
      const json = await res.json()
      if (Array.isArray(json) && json.length > 0) {
        setPlans(json
          .filter((p: Plan) => p.is_active !== false)
          .sort((a: Plan, b: Plan) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.price_monthly ?? 99) - (b.price_monthly ?? 99))
        )
      } else {
        setPlans(FALLBACK_PLANS)
      }
    } catch {
      setPlans(FALLBACK_PLANS)
    } finally {
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

  const _validateCoupon = useCallback(async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <PublicHeader />
        <div className="pt-20 sm:pt-24 pb-10 sm:pb-16 px-3 sm:px-4 flex items-start justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary-light" />
        </div>
        <PublicFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicHeader />
      <div className="pt-10 sm:pt-12 pb-10 sm:pb-16 px-3 sm:px-4">
        <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6">
          <BackButton fallback="/" />
        </div>
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
      <PublicFooter />
    </div>
  )
}
