"use client"

import { Check } from "lucide-react"
import Link from "next/link"

export interface PricingPlan {
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

interface PricingCardProps {
  plan: PricingPlan
  billingCycle: "monthly" | "yearly"
  couponResult?: { valid: boolean; discount: number; type: string } | null
  couponCode?: string
  isLoggedIn?: boolean
}

function formatLimit(value: number, suffix?: string) {
  if (value >= 9999) return "Unlimited"
  const formatted = value.toLocaleString()
  return suffix ? `${formatted} ${suffix}` : formatted
}

function getDisplayPrice(plan: PricingPlan, billingCycle: "monthly" | "yearly") {
  return billingCycle === "yearly" ? plan.price_yearly : plan.price_monthly
}

function getMonthlyEquivalent(plan: PricingPlan) {
  if (plan.price_yearly > 0) {
    return Math.round(plan.price_yearly / 12)
  }
  return plan.price_monthly
}

function getDiscountedPrice(plan: PricingPlan, billingCycle: "monthly" | "yearly", couponResult?: { valid: boolean; discount: number; type: string } | null) {
  const price = getDisplayPrice(plan, billingCycle)
  if (!couponResult?.valid || price === 0) return price
  if (couponResult.type === "percentage") {
    return Math.round(price * (1 - couponResult.discount / 100) * 100) / 100
  } else if (couponResult.type === "fixed") {
    return Math.max(0, price - couponResult.discount)
  }
  return price
}

export function PricingCard({ plan, billingCycle, couponResult, couponCode, isLoggedIn }: PricingCardProps) {
  const displayPrice = getDisplayPrice(plan, billingCycle)
  const monthlyEquiv = getMonthlyEquivalent(plan)
  const finalPrice = getDiscountedPrice(plan, billingCycle, couponResult)
  const hasDiscount = couponResult?.valid && finalPrice !== displayPrice
  const isFree = displayPrice === 0

  const checkoutUrl = `/checkout?plan=${plan.slug}&billing=${billingCycle}${couponResult?.valid && couponCode ? `&coupon=${couponCode}` : ""}`
  const ctaHref = isLoggedIn ? checkoutUrl : `/signup?redirect=${encodeURIComponent(checkoutUrl)}`

  return (
    <div className={`relative liquid-glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all duration-300 ${plan.is_popular ? "border-primary/40 ring-1 ring-primary/20 shadow-lg shadow-primary/10 bg-card/90 hover:scale-[1.02]" : "hover:border-border"}`}>
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-bold px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
          {plan.badge}
        </div>
      )}

      <h3 className="text-base sm:text-lg font-bold mb-1">{plan.name}</h3>

      <div className="mb-3 sm:mb-4">
        {hasDiscount ? (
          <div className="flex items-baseline gap-2">
            <span className="text-lg text-muted line-through">${displayPrice}</span>
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
          <button className="w-full py-2.5 rounded-lg text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-border hover:bg-card transition-colors">
            Get Started
          </button>
        </Link>
      ) : (
        <Link href={ctaHref}>
          <button className={`w-full py-2.5 rounded-lg text-xs sm:text-sm font-semibold mb-4 sm:mb-6 transition-colors ${plan.is_popular ? "bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20" : "border border-border hover:bg-card"}`}>
            Choose {plan.name}
          </button>
        </Link>
      )}

      {/* Features */}
      <ul className="space-y-2 sm:space-y-2.5">
        {plan.features.map((f: string) => (
          <li key={f} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <span className="text-muted">{f}</span>
          </li>
        ))}
      </ul>

      {/* Limits */}
      <div className="mt-4 pt-4 border-t border-border space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-muted">Projects</span>
          <span className="text-foreground font-medium">{formatLimit(plan.max_projects)}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted">Documents</span>
          <span className="text-foreground font-medium">{formatLimit(plan.max_documents)}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted">Max article length</span>
          <span className="text-foreground font-medium">{formatLimit(plan.max_article_length, "words")}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted">Report history</span>
          <span className="text-foreground font-medium">{plan.report_history_days >= 9999 ? "Unlimited" : `${plan.report_history_days} days`}</span>
        </div>
      </div>
    </div>
  )
}

export { formatLimit, getDisplayPrice, getMonthlyEquivalent, getDiscountedPrice }
