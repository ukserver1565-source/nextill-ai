import type { Metadata } from "next"
import Link from "next/link"
import { Truck, CreditCard, Globe, Clock, Wrench, Shield, Mail, Server } from "lucide-react"
import { BackButton } from "@/components/shared/back-button"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Service & Delivery Policy",
  description:
    "Learn how Nextill AI delivers its digital SaaS services, including instant access, subscription details, uptime commitments, and technical support.",
  alternates: { canonical: "/service-policy" },
  openGraph: {
    title: "Service & Delivery Policy — Nextill AI",
    description:
      "Learn how Nextill AI delivers its digital SaaS services, including instant access, subscription details, and uptime commitments.",
    url: `${getSiteUrl()}/service-policy`,
  },
}

const sections = [
  {
    icon: Truck,
    number: "01",
    title: "Service Overview",
    color: "from-violet-500 to-indigo-600",
    paragraphs: [
      "Nextill AI is a digital-only platform. All products and services are delivered as Software-as-a-Service (SaaS) subscriptions. No physical goods are shipped, delivered, or exchanged.",
      "Our services are provided entirely online through our web platform at adultpulse.co.uk. An active internet connection is required to access and use all features of the platform.",
      "By purchasing a subscription or credit package, you are purchasing access to our AI-powered tools and platform features. All deliveries are digital and immediate upon successful payment confirmation.",
    ],
  },
  {
    icon: CreditCard,
    number: "02",
    title: "Payment & Instant Access",
    color: "from-blue-500 to-cyan-500",
    paragraphs: [
      "Upon successful payment confirmation, your subscription or credit balance is activated immediately. You will receive access to the purchased features without any additional steps.",
      "Credits purchased are delivered instantly to your user account. You can begin using your allocated credits as soon as the payment is confirmed by our payment processor.",
      "If there is any delay in activation due to a technical issue, our support team will resolve it promptly. In most cases, any delay is resolved within minutes.",
    ],
  },
  {
    icon: Globe,
    number: "03",
    title: "What's Included in Your Subscription",
    color: "from-emerald-500 to-green-500",
    paragraphs: [
      "Your Nextill AI subscription includes access to our complete suite of AI-powered tools: Keyword Intelligence (domain research), Post Generator (AI content creation), and Plagiarism & Authenticity Checker.",
      "Each subscription plan includes a monthly allocation of AI credits that can be used across any of the three workflows. Unused credits do not roll over to the next billing period.",
      "All features are accessible through our web platform at adultpulse.co.uk. There are no additional software downloads or physical materials required to use our services.",
    ],
  },
  {
    icon: Clock,
    number: "04",
    title: "Service Availability",
    color: "from-amber-500 to-orange-500",
    paragraphs: [
      "Our platform is available 24 hours a day, 7 days a week, 365 days a year. You can access your account and use our tools at any time from any device with an internet connection.",
      "We strive to maintain maximum uptime for our services. Our target uptime is 99.9% measured on a monthly basis. Scheduled maintenance windows will be communicated in advance via email and platform notifications.",
      "In the event of unplanned downtime, we will work to restore service as quickly as possible and will post status updates on our platform.",
    ],
  },
  {
    icon: Wrench,
    number: "05",
    title: "Technical Support",
    color: "from-pink-500 to-rose-500",
    paragraphs: [
      "Technical support is available to all users via email at support@adultpulse.co.uk. Our support team aims to respond to all inquiries within 24 to 48 business hours.",
      "Support covers platform functionality issues, billing inquiries, account access problems, and general questions about using our tools. We do not provide on-site or phone support.",
      "For urgent issues affecting your ability to use the platform, please include \"URGENT\" in your email subject line and provide as much detail as possible about the issue, including your account email and a description of the problem.",
    ],
  },
  {
    icon: Server,
    number: "06",
    title: "Service Interruptions & Maintenance",
    color: "from-purple-500 to-violet-500",
    paragraphs: [
      "We periodically perform scheduled maintenance to improve platform performance, security, and reliability. Maintenance windows are typically scheduled during off-peak hours and communicated at least 48 hours in advance.",
      "Unplanned service interruptions may occur due to infrastructure issues, third-party service outages, or force majeure events. We will notify affected users as soon as possible when such events occur.",
      "During service interruptions, no credits will be consumed. Any credits that would have been used during a confirmed platform outage will be restored to your account.",
    ],
  },
  {
    icon: Shield,
    number: "07",
    title: "Terms of Service Delivery",
    color: "from-teal-500 to-cyan-500",
    paragraphs: [
      "All services are delivered on a subscription basis. Monthly subscriptions are renewed automatically on the same date each month. Yearly subscriptions are renewed annually.",
      "You may cancel your subscription at any time through your account dashboard. Cancellation takes effect at the end of the current billing period — no partial refunds are issued for unused time within the current period, except as covered by our 7-day money-back guarantee.",
      "We reserve the right to modify, suspend, or discontinue any feature of the platform with reasonable notice. In the event of a service discontinuation, affected subscribers will be notified and provided with alternative options or refunds as appropriate.",
    ],
  },
]

export default function ServicePolicyPage() {
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
            <Truck className="w-8 h-8 text-foreground" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Service & Delivery <span className="gradient-primary-text">Policy</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about how our digital services are delivered, accessed, and supported.
          </p>
          <p className="text-muted text-sm mt-3">Last updated: July 2026</p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="liquid-glass-card rounded-2xl p-8 sm:p-10">
            <p className="text-muted leading-relaxed text-base">
              Nextill AI provides all services as digital SaaS products delivered entirely online. There are no physical products shipped or delivered. All purchases result in instant digital access to our AI-powered platform.
            </p>
            <h2 className="text-xl font-bold mt-8 mb-3">Digital-First Delivery</h2>
            <p className="text-muted leading-relaxed text-base">
              Our platform at adultpulse.co.uk is the sole delivery method for all services. From the moment your payment is confirmed, you have full access to your subscription features and credits. This policy outlines the complete terms of service delivery, availability, and support.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Sections */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">Delivery <span className="gradient-primary-text">Details</span></h2>
            <p className="text-muted mt-2 max-w-xl mx-auto">
              A comprehensive breakdown of our service delivery, availability, and support terms.
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
              <h2 className="text-2xl sm:text-3xl font-bold">Questions About Our Service?</h2>
              <p className="text-muted mt-3 max-w-lg mx-auto">
                Our team is ready to help. Reach out if you have any questions about service delivery or support.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="mailto:support@adultpulse.co.uk" className="inline-flex items-center justify-center px-8 py-3 rounded-xl gradient-primary text-foreground font-semibold text-base hover:opacity-90 transition-all">
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
