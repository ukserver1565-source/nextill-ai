import type { Metadata } from "next"
import Link from "next/link"
import { RotateCcw, Clock, AlertCircle, CheckCircle, Mail, FileText } from "lucide-react"
import { BackButton } from "@/components/shared/back-button"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Learn about Nextill AI's refund and return policy, including our 7-day money-back guarantee, eligibility criteria, and how to request a refund.",
  openGraph: {
    title: "Refund Policy — Nextill AI",
    description:
      "Learn about Nextill AI's refund and return policy, including our 7-day money-back guarantee.",
    url: `${getSiteUrl()}/refund-policy`,
  },
}

const sections = [
  {
    icon: FileText,
    number: "01",
    title: "Overview",
    color: "from-violet-500 to-indigo-600",
    paragraphs: [
      "At Nextill AI, customer satisfaction is our top priority. This Refund Policy explains the terms and conditions under which refunds may be issued for purchases made on our platform.",
      "All products and services offered by Nextill AI are digital services delivered as Software-as-a-Service (SaaS) subscriptions. There are no physical goods involved in any transaction.",
      "By purchasing a subscription or credits on our platform, you acknowledge that you have read and understood this Refund Policy. We encourage you to review this document carefully before making a purchase.",
    ],
  },
  {
    icon: CheckCircle,
    number: "02",
    title: "7-Day Money-Back Guarantee",
    color: "from-emerald-500 to-green-500",
    paragraphs: [
      "We offer a 7-day money-back guarantee from the date of your initial purchase. If you are not satisfied with our services within the first 7 days, you may request a full refund.",
      "The 7-day period begins on the date your payment is confirmed and processed. Weekend days and public holidays are included in the 7-day calculation.",
      "This guarantee applies to all subscription plans, including monthly and yearly billing cycles. The guarantee is limited to one refund per user account.",
    ],
  },
  {
    icon: RotateCcw,
    number: "03",
    title: "Refund Request Process",
    color: "from-blue-500 to-cyan-500",
    paragraphs: [
      "To request a refund, you must contact our support team by sending an email to support@nextill.ai. Please include your account email address, order details, and the reason for your refund request.",
      "Our support team will acknowledge your refund request within 48 business hours. We may ask for additional information to verify your identity and process the refund.",
      "Once your refund request is approved, the refund will be initiated to your original payment method. You will receive an email confirmation once the refund has been processed.",
    ],
  },
  {
    icon: CheckCircle,
    number: "04",
    title: "What Qualifies for a Refund",
    color: "from-emerald-500 to-green-600",
    paragraphs: [
      "Technical issues preventing you from using the platform that cannot be resolved by our support team within a reasonable time.",
      "Billing errors, such as duplicate charges, incorrect subscription amounts, or unauthorized charges on your account.",
      "Services that were purchased but not delivered due to a system error on our end.",
      "Failure to provide access to the purchased service within the expected delivery timeframe without a valid explanation.",
    ],
  },
  {
    icon: AlertCircle,
    number: "05",
    title: "What Does Not Qualify for a Refund",
    color: "from-red-500 to-pink-500",
    paragraphs: [
      "Change of mind after using the service, including dissatisfaction with AI-generated content quality or keyword research results.",
      "Requests made after the 7-day money-back guarantee period has expired.",
      "Account misuse or violation of our Terms of Service, including sharing account credentials or using the platform for prohibited activities.",
      "Partial usage of credits within a subscription period — credits consumed during the subscription are non-refundable unless a full refund is issued within the guarantee period.",
      "Disputes arising from third-party payment processor fees or currency conversion charges that are outside our control.",
    ],
  },
  {
    icon: Clock,
    number: "06",
    title: "Refund Processing Time",
    color: "from-amber-500 to-orange-500",
    paragraphs: [
      "Refunds are typically processed within 5 to 10 business days from the date of approval. The actual time it takes for the refund to appear on your statement depends on your payment method and financial institution.",
      "Credit card refunds may take 1-2 billing cycles to appear on your statement. PayPal and other digital wallet refunds are usually processed faster.",
      "If you have not received your refund after 10 business days, please contact your bank or payment provider first, then reach out to our support team for assistance.",
    ],
  },
  {
    icon: Mail,
    number: "07",
    title: "Contact Us",
    color: "from-indigo-500 to-purple-500",
    paragraphs: [
      "If you have any questions about this Refund Policy or need assistance with a refund request, please contact our support team at support@nextill.ai.",
      "We are committed to resolving all refund-related inquiries promptly and fairly. Our team will work with you to address any concerns regarding your purchase.",
      "Nextill AI reserves the right to update this Refund Policy at any time. Changes will be posted on this page with an updated revision date. We recommend reviewing this policy periodically.",
    ],
  },
]

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[140px]" />
          <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-6 shadow-lg shadow-primary/30">
            <RotateCcw className="w-8 h-8 text-foreground" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Refund <span className="gradient-primary-text">Policy</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
            We stand behind our service. Learn about our 7-day money-back guarantee and refund process.
          </p>
          <p className="text-muted text-sm mt-3">Last updated: July 2026</p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="liquid-glass-card rounded-2xl p-8 sm:p-10">
            <p className="text-muted leading-relaxed text-base">
              Nextill AI offers a 7-day money-back guarantee on all subscription purchases. All products sold on our platform are digital services (SaaS subscriptions) — no physical goods are shipped. If you are not satisfied with our service within the first 7 days of purchase, we will issue a full refund.
            </p>
            <h2 className="text-xl font-bold mt-8 mb-3">Our Promise</h2>
            <p className="text-muted leading-relaxed text-base">
              We are a company registered in Pakistan, operated by Nextill AI from Faisalabad, Punjab. We are committed to fair and transparent refund practices in compliance with applicable consumer protection laws and our payment processing partner requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Sections */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">Refund <span className="gradient-primary-text">Details</span></h2>
            <p className="text-muted mt-2 max-w-xl mx-auto">
              Everything you need to know about our refund and return policy.
            </p>
          </div>
          <div className="space-y-6">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <div key={section.number} className="liquid-glass-card rounded-2xl p-6 sm:p-8 group hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg shrink-0`}>
                      <Icon className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted uppercase tracking-wider">Section {section.number}</span>
                      <h2 className="text-lg font-bold">{section.title}</h2>
                    </div>
                  </div>
                  <div className="space-y-3 ml-0 sm:ml-16">
                    {section.paragraphs.map((p, i) => (
                      <p key={i} className="text-sm text-muted leading-relaxed">{p}</p>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Back Button */}
      <section className="px-4 pb-8">
        <div className="max-w-4xl mx-auto text-center">
          <BackButton fallback="/" label="Back to Home" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="liquid-glass-card rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/20 blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-secondary/15 blur-[80px]" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold">Need Help With a Refund?</h2>
              <p className="text-muted mt-3 max-w-lg mx-auto">
                Contact our support team and we will assist you with your refund request promptly.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="mailto:support@nextill.ai" className="inline-flex items-center justify-center px-8 py-3 rounded-xl gradient-primary text-foreground font-semibold text-base hover:opacity-90 transition-all">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Link>
                <Link href="/signup" className="inline-flex items-center justify-center px-8 py-3 rounded-xl border border-border bg-card/30 text-foreground font-semibold text-base hover:bg-white/[0.06] transition-all">
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  )
}
