import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles, FileText, CheckCircle, CreditCard, AlertTriangle, Mail, Scale, Shield, Users, Ban, RefreshCw, Copyright } from "lucide-react"
import { BackButton } from "@/components/shared/back-button"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms and conditions that govern your use of the Nextill AI platform, including account registration, credits, billing, content ownership, and user responsibilities.",
  openGraph: {
    title: "Terms of Service — Nextill AI",
    description:
      "Read the terms and conditions that govern your use of the Nextill AI platform.",
    url: "https://nextill.ai/terms",
  },
}

const sections = [
  {
    icon: CheckCircle,
    number: "01",
    title: "Acceptance of Terms",
    color: "from-emerald-500 to-green-500",
    paragraphs: [
      "By accessing or using Nextill AI (the \"Service\"), you agree to be bound by these Terms of Service (\"Terms\"). If you do not agree to all of these Terms, you may not access or use the Service. Your continued use of the Service constitutes ongoing acceptance of these Terms.",
      "We reserve the right to update or modify these Terms at any time without prior notice. Changes become effective immediately upon posting to this page. It is your responsibility to review these Terms periodically. Your continued use of the Service after changes are posted constitutes acceptance of the revised Terms.",
      "These Terms constitute the entire agreement between you and Nextill AI regarding the use of the Service and supersede any prior agreements or understandings. If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.",
    ],
  },
  {
    icon: Sparkles,
    number: "02",
    title: "Description of Service",
    color: "from-violet-500 to-indigo-600",
    paragraphs: [
      "Nextill AI provides an AI-powered platform for SEO content creation, keyword research, post generation, and plagiarism detection. The Service includes web-based tools, APIs, and associated features designed to help marketers and content creators produce high-quality, search-optimized content.",
      "We reserve the right to modify, suspend, or discontinue any feature of the Service at any time, with or without notice. We will make reasonable efforts to notify users of significant changes, but we are not liable for any loss or inconvenience caused by modifications to the Service.",
      "The Service is provided \"as is\" and \"as available\" without warranties of any kind, either express or implied. While we strive to maintain high uptime and reliability, we do not guarantee uninterrupted access and are not responsible for any downtime or service disruptions.",
    ],
  },
  {
    icon: Users,
    number: "03",
    title: "Account Registration",
    color: "from-blue-500 to-cyan-500",
    paragraphs: [
      "To access certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to keep your account information up to date. You are responsible for safeguarding your account credentials and for all activities that occur under your account.",
      "You must be at least 18 years of age to create an account and use the Service. By creating an account, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.",
      "You agree to notify us immediately of any unauthorized use of your account or any other breach of security. We are not liable for any loss or damage arising from unauthorized use of your account resulting from your failure to maintain the confidentiality of your login credentials.",
    ],
  },
  {
    icon: CreditCard,
    number: "04",
    title: "Credits, Billing, and Payments",
    color: "from-amber-500 to-orange-500",
    paragraphs: [
      "The Service operates on a credit-based system. Credits are purchased through our platform and are consumed when you generate content, run keyword analyses, or perform plagiarism checks. Different actions may consume different amounts of credits depending on the complexity of the operation.",
      "Credits are non-transferable and non-refundable unless otherwise specified in our refund policy. Unused credits may expire according to the terms of your subscription plan. We reserve the right to adjust credit pricing with reasonable advance notice to active subscribers.",
      "All payments are processed through our third-party payment processors. You agree to provide accurate and complete payment information and authorize us to charge the applicable fees to your designated payment method. Failed or overdue payments may result in suspension or termination of your account.",
    ],
  },
  {
    icon: AlertTriangle,
    number: "05",
    title: "User Responsibilities and Conduct",
    color: "from-red-500 to-pink-500",
    paragraphs: [
      "You are solely responsible for all content you create, generate, or publish using the Service. You agree to use the Service only for lawful purposes and in compliance with all applicable laws, regulations, and these Terms.",
      "You agree not to use the Service to create, distribute, or publish content that is illegal, harmful, fraudulent, defamatory, obscene, or otherwise objectionable. You must not use the Service to infringe upon the intellectual property rights of any third party, including copyrights, trademarks, or trade secrets.",
      "You agree not to attempt to reverse engineer, decompile, or otherwise extract the underlying technology or AI models used by the Service. Automated access, scraping, or abuse of the Service through bots or scripts is strictly prohibited without prior written authorization.",
    ],
  },
  {
    icon: Copyright,
    number: "06",
    title: "Intellectual Property",
    color: "from-indigo-500 to-purple-500",
    paragraphs: [
      "Content you generate using the Service is owned by you, subject to the limitations outlined in these Terms. You may use, modify, and publish AI-generated content as you see fit, provided that it does not violate any applicable laws or third-party rights.",
      "The Service itself, including its design, code, AI models, algorithms, and all related technology, is the intellectual property of Nextill AI and is protected by copyright, trademark, and other laws. No rights are granted to you to use, copy, or distribute any part of the Service beyond what is expressly permitted in these Terms.",
      "We respect the intellectual property rights of others and expect our users to do the same. If you believe that content generated through the Service infringes upon your copyright or other intellectual property rights, please contact us with the relevant details so we can investigate promptly.",
    ],
  },
  {
    icon: Ban,
    number: "07",
    title: "Termination and Suspension",
    color: "from-rose-500 to-red-500",
    paragraphs: [
      "We reserve the right to suspend or terminate your account at any time, with or without cause, and with or without notice. Grounds for termination may include, but are not limited to, violation of these Terms, fraudulent or abusive activity, non-payment of fees, or conduct that is harmful to other users or the Service.",
      "Upon termination, your right to access and use the Service ceases immediately. We may retain certain data for legal, analytical, or administrative purposes as outlined in our Privacy Policy. Any outstanding credits or subscription benefits are forfeited upon termination for cause.",
      "You may terminate your account at any time by contacting our support team or through your account settings. Upon voluntary termination, your data will be processed and deleted in accordance with our Privacy Policy and applicable retention periods.",
    ],
  },
  {
    icon: Scale,
    number: "08",
    title: "Limitation of Liability",
    color: "from-teal-500 to-cyan-500",
    paragraphs: [
      "To the maximum extent permitted by applicable law, Nextill AI and its officers, directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the Service, including but not limited to loss of profits, data, or business opportunities.",
      "Our total aggregate liability for any claims arising from or related to the Service shall not exceed the amount you paid to us during the twelve (12) months immediately preceding the event giving rise to the liability. This limitation applies regardless of the legal theory underlying the claim.",
      "The Service is provided for informational and content creation purposes. You are responsible for independently verifying the accuracy and suitability of any content generated by the Service before publication or commercial use. We do not guarantee specific SEO results, rankings, or outcomes from using our tools.",
    ],
  },
  {
    icon: RefreshCw,
    number: "09",
    title: "Modifications to Service",
    color: "from-violet-500 to-purple-500",
    paragraphs: [
      "We are constantly evolving and improving our Service. We may add, modify, or remove features, change pricing, or update functionality at any time. We will make reasonable efforts to provide advance notice of significant changes that may affect your use of the Service.",
      "Major feature changes or discontinuation of core functionality will be communicated via email or platform notification at least 30 days in advance when possible. We may also post updates on our website or within the platform dashboard.",
      "We appreciate your understanding as we work to improve the Service. Your feedback is valuable and helps us prioritize the features and improvements that matter most to our users.",
    ],
  },
  {
    icon: Shield,
    number: "10",
    title: "Governing Law and Disputes",
    color: "from-blue-500 to-indigo-600",
    paragraphs: [
      "These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any dispute arising from or relating to these Terms or your use of the Service shall be resolved through good-faith negotiation first.",
      "If a dispute cannot be resolved through negotiation within 30 days, either party may pursue resolution through binding arbitration or applicable judicial proceedings, depending on the nature and jurisdiction of the dispute.",
      "We encourage you to contact us first if you have a concern or complaint. Our support team is available to help resolve issues quickly and fairly, and we are committed to maintaining a positive relationship with all of our users.",
    ],
  },
  {
    icon: Mail,
    number: "11",
    title: "Contact Information",
    color: "from-pink-500 to-rose-500",
    paragraphs: [
      "If you have any questions, concerns, or feedback about these Terms of Service, please reach out to our support team. We are committed to responding to your inquiries promptly and addressing any issues you may have.",
      "You can contact us through our Contact page, or by emailing our support team directly. We aim to respond to all inquiries within 48 hours during regular business days.",
      "Thank you for choosing Nextill AI. We value your trust and are dedicated to providing you with a reliable, secure, and powerful content creation platform.",
    ],
  },
]

export default function TermsPage() {
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
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Terms of <span className="gradient-primary-text">Service</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
            The rules and guidelines that govern your use of the Nextill AI platform and its services.
          </p>
          <p className="text-muted text-sm mt-3">Last updated: July 2026</p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-8 sm:p-10">
            <p className="text-muted leading-relaxed text-base">
              These Terms of Service (\"Terms\") govern your access to and use of the Nextill AI platform, including all tools, features, and services provided through our website and APIs. Please read these Terms carefully before using our platform.
            </p>
            <p className="text-muted leading-relaxed text-base mt-4">
              By creating an account or using any part of the Nextill AI platform, you enter into a binding agreement with us. These Terms are designed to protect both you and Nextill AI, ensuring a safe, fair, and reliable experience for all users of our platform.
            </p>
            <h2 className="text-xl font-bold mt-8 mb-3">Agreement Summary</h2>
            <p className="text-muted leading-relaxed text-base">
              In short, you agree to use our platform responsibly, respect intellectual property, maintain the security of your account, and comply with applicable laws. In return, we provide you with powerful AI-driven tools to enhance your content creation and SEO workflows.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Sections */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">Full Terms <span className="gradient-primary-text">Breakdown</span></h2>
            <p className="text-muted mt-2 max-w-xl mx-auto">
              A complete overview of the terms and conditions that apply to every user of the platform.
            </p>
          </div>
          <div className="space-y-6">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <div key={section.number} className="glass-card rounded-2xl p-6 sm:p-8 group hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
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
          <div className="glass-card rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/20 blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-secondary/15 blur-[80px]" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold">Ready to Get Started?</h2>
              <p className="text-muted mt-3 max-w-lg mx-auto">
                Join thousands of creators using Nextill AI to work smarter, create faster, and rank higher.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="inline-flex items-center justify-center px-8 py-3 rounded-xl gradient-primary text-white font-semibold text-base hover:opacity-90 transition-all">
                  Start Free
                </Link>
                <Link href="/pricing" className="inline-flex items-center justify-center px-8 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white font-semibold text-base hover:bg-white/[0.06] transition-all">
                  View Pricing
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
