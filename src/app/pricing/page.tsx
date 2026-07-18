import type { Metadata } from "next"
import { BackButton } from "@/components/shared/back-button"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { PricingClientSection } from "@/components/pricing/pricing-client-section"
import { getActivePlans } from "@/lib/data/plans"
import { getSiteUrl } from "@/lib/site-url"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Choose the plan that fits your needs. Free, Starter, Pro, and Business plans with AI-powered SEO tools, keyword research, post generation, and plagiarism checking.",
  openGraph: {
    title: "Pricing — Nextill AI",
    description:
      "Choose the plan that fits your needs. Free, Starter, Pro, and Business plans with AI-powered SEO tools.",
    url: `${getSiteUrl()}/pricing`,
  },
}

const DEFAULT_CREDIT_COSTS = [
  { workflow_slug: "domain-intelligence", credits_cost: 2 },
  { workflow_slug: "post-generator", credits_cost: 10 },
  { workflow_slug: "plagiarism-checker", credits_cost: 4 },
]

export default async function PricingPage() {
  const plans = await getActivePlans()

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

          {/* Client-side interactive section: toggle, cards, coupon, credits table */}
          <PricingClientSection
            initialPlans={plans}
            initialCreditCosts={DEFAULT_CREDIT_COSTS}
          />
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
