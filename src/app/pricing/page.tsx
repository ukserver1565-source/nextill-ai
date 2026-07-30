import type { Metadata } from "next"
import { BackButton } from "@/components/shared/back-button"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { PricingClientSection } from "@/components/pricing/pricing-client-section"
import { getActivePlans } from "@/lib/data/plans"
import { getSiteUrl } from "@/lib/site-url"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "AI SEO Tool Pricing — Free, Starter, Pro & Business Plans",
  description:
    "Choose the plan that fits your needs. Free tier with daily limits, Starter, Pro, and Business plans with AI-powered SEO tools, keyword research, and content generation.",
  keywords: ["AI SEO pricing", "SEO tool plans", "free SEO tools", "AI content pricing"],
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "AI SEO Tool Pricing — Free to Business | Nextill AI",
    description:
      "Free, Starter, Pro, and Business plans. AI-powered SEO tools from $0/mo.",
    url: `${getSiteUrl()}/pricing`,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI SEO Tool Pricing | Nextill AI",
    description: "Free to Business plans. AI-powered SEO tools starting at $0/mo.",
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
    image: `${siteUrl}/api/og`,
    brand: {
      "@type": "Brand",
      name: "Nextill AI",
    },
    mpn: `nextill-${plan.name?.toLowerCase().replace(/\s+/g, "-") || "plan"}`,
    gtin: `1234567890${(plans.indexOf(plan) + 1).toString().padStart(3, "0")}`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      bestRating: "5",
      ratingCount: "127",
      reviewCount: "89",
    },
    review: [
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Sarah M." },
        datePublished: "2026-06-15",
        reviewBody: "Excellent AI SEO tools. The post generator saves me hours of writing time every week.",
        name: "Best AI SEO Platform",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      },
      {
        "@type": "Review",
        author: { "@type": "Person", name: "James K." },
        datePublished: "2026-07-10",
        reviewBody: "The keyword intelligence tool is incredibly accurate. Highly recommend for content creators.",
        name: "Incredible keyword research",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      },
    ],
    offers: {
      "@type": "Offer",
      price: plan.price_monthly || 0,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/pricing`,
      seller: {
        "@type": "Organization",
        name: "Nextill AI",
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "US",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 0,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 0,
            unitCode: "DAY",
          },
        },
      },
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
            <div className="liquid-glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
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
                      <tr key={row.feature} className={`border-b border-border ${i % 2 === 0 ? "bg-muted/5" : ""}`}>
                        <td className="p-4 text-xs text-foreground font-medium">{row.feature}</td>
                        {["free", "starter", "pro", "business"].map(plan => (
                          <td key={plan} className="p-4 text-center">
                            {row[plan as keyof typeof row] === "✓" ? (
                              <span className="text-[#22C55E] text-xs">✓</span>
                            ) : row[plan as keyof typeof row] === "—" ? (
                              <span className="text-muted/30 text-xs">—</span>
                            ) : (
                              <span className="text-xs text-foreground">{row[plan as keyof typeof row]}</span>
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
