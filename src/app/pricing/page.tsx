"use client"

import { useState, useEffect } from "react"
import { Check, Loader2 } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/plans")
        if (!res.ok) throw new Error("Failed to load")
        const json = await res.json()
        const data = Array.isArray(json) ? json : json.data || []
        setPlans(data.filter((p: any) => p.active !== false).sort((a: any, b: any) => (a.sort_order ?? 99) - (b.sort_order ?? 99)))
      } catch { /* use empty */ } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2 sm:mb-3">Simple, Transparent Pricing</h1>
          <p className="text-muted text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-2">
            Choose the plan that fits your needs. Upgrade or downgrade at any time.
          </p>
        </div>
        {plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted text-sm">No plans available at this time. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-lg sm:max-w-none mx-auto">
            {plans.map((plan: any) => {
              const price = plan.monthly_price || plan.price || 0
              const credits = plan.credits || 0
              const features = plan.features || []
              return (
                <div key={plan.id || plan.name} className={`relative glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 ${plan.popular ? "border-primary-light/40 ring-1 ring-primary-light/20" : ""}`}>
                  {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-light text-black text-[9px] sm:text-[10px] font-bold px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">Most Popular</div>}
                  <h3 className="text-base sm:text-lg font-bold mb-1">{plan.name}</h3>
                  <div className="mb-3 sm:mb-4">
                    <span className="text-2xl sm:text-3xl font-bold">${price}</span>
                    <span className="text-xs sm:text-sm text-muted">/month</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted mb-3 sm:mb-4">{credits.toLocaleString()} credits per month</p>
                  <Link href={price === 0 ? "/signup" : "/dashboard/billing"}>
                    <button className={`w-full py-2 rounded-lg text-xs sm:text-sm font-semibold mb-4 sm:mb-6 ${plan.popular ? "bg-primary-light text-black hover:bg-primary-light/90" : "border border-muted/30 hover:bg-muted/10"} transition-colors`}>
                      {price === 0 ? "Get Started" : "Subscribe"}
                    </button>
                  </Link>
                  <ul className="space-y-2 sm:space-y-2.5">
                    {features.map((f: string) => (
                      <li key={f} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary-light shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
