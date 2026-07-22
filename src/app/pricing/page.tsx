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
  const siteUrl = getSiteUrl()

  // Product JSON-LD for pricing rich snippets
  const productSchema = plans.map(plan => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Nextill AI — ${plan.name} Plan`,
    description: `AI-powered SEO tools plan with ${plan.credits} credits per month.`,
    offers: {
      "@type": "Offer",
      price: plan.price_monthly || 0,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/pricing`,
    },
  }))

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
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

          {/* Feature Comparison Table */}
          <div className="mt-16">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-8">Feature Comparison</h2>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left p-4 text-xs font-medium text-muted">Feature</th>
                      <th className="text-center p-4 text-xs font-medium text-muted">Free</th>
                      <th className="text-center p-4 text-xs font-medium text-primary">Starter</th>
                      <th className="text-center p-4 text-xs font-medium text-primary">Pro</th>
                      <th className="text-center p-4 text-xs font-medium text-primary">Business</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Monthly Credits", free: "100", starter: "1,000", pro: "5,000", business: "25,000" },
                      { feature: "Keyword Research", free: "3/day", starter: "✓", pro: "✓", business: "✓" },
                      { feature: "Post Generator", free: "3/day", starter: "✓", pro: "✓", business: "✓" },
                      { feature: "Plagiarism Checker", free: "3/day", starter: "✓", pro: "✓", business: "✓" },
                      { feature: "Save Documents", free: "—", starter: "✓", pro: "✓", business: "✓" },
                      { feature: "Priority Support", free: "—", starter: "—", pro: "✓", business: "✓" },
                      { feature: "API Access", free: "—", starter: "—", pro: "✓", business: "✓" },
                      { feature: "Custom Branding", free: "—", starter: "—", pro: "—", business: "✓" },
                      { feature: "Team Members", free: "—", starter: "—", pro: "—", business: "Up to 10" },
                      { feature: "Dedicated Account Manager", free: "—", starter: "—", pro: "—", business: "✓" },
                    ].map((row, i) => (
                      <tr key={row.feature} className={`border-b border-white/[0.06] ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                        <td className="p-4 text-xs text-white font-medium">{row.feature}</td>
                        {["free", "starter", "pro", "business"].map(plan => (
                          <td key={plan} className="p-4 text-center">
                            {row[plan as keyof typeof row] === "✓" ? (
                              <span className="text-[#22C55E] text-xs">✓</span>
                            ) : row[plan as keyof typeof row] === "—" ? (
                              <span className="text-muted/30 text-xs">—</span>
                            ) : (
                              <span className="text-xs text-white">{row[plan as keyof typeof row]}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
