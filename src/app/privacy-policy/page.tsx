import type { Metadata } from "next"
import Link from "next/link"
import { Shield, Lock, Eye, Database, Mail, Globe, Share2, Cookie, Server, AlertCircle } from "lucide-react"
import { BackButton } from "@/components/shared/back-button"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Nextill AI collects, uses, protects, and manages your personal information. Our comprehensive privacy policy covers data collection, usage, sharing, and your rights.",
  openGraph: {
    title: "Privacy Policy — Nextill AI",
    description:
      "Learn how Nextill AI collects, uses, protects, and manages your personal information.",
    url: `${getSiteUrl()}/privacy-policy`,
  },
}

const sections = [
  {
    icon: Globe,
    number: "01",
    title: "Introduction",
    color: "from-violet-500 to-indigo-600",
    paragraphs: [
      "Nextill AI (\"we,\" \"our,\" or \"us\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share your personal information when you use our platform, website, and related services.",
      "By accessing or using Nextill AI, you acknowledge that you have read and understood this Privacy Policy. We encourage you to review this document periodically, as we may update it from time to time to reflect changes in our practices or applicable laws.",
      "This policy applies to all users of our platform, including visitors, registered users, and subscribers. We are dedicated to transparency about the data we collect and how it is used to provide and improve our services.",
    ],
  },
  {
    icon: Database,
    number: "02",
    title: "Information We Collect",
    color: "from-blue-500 to-cyan-500",
    paragraphs: [
      "We collect information you provide directly to us when you create an account, subscribe to a plan, or contact our support team. This includes your name, email address, billing information, and any content you generate or upload through our platform.",
      "Automatically collected data includes your IP address, browser type, operating system, device identifiers, and usage patterns such as pages visited, features used, and time spent on the platform. We use cookies and similar tracking technologies to gather this information.",
      "We may also collect information from third-party sources, such as payment processors for transaction verification and analytics providers to help us understand how our platform is used. All third-party data collection complies with applicable data protection regulations.",
    ],
  },
  {
    icon: Eye,
    number: "03",
    title: "How We Use Your Information",
    color: "from-emerald-500 to-green-500",
    paragraphs: [
      "We use the information we collect to provide, maintain, and improve our services, including processing your transactions, generating AI-powered content, and delivering keyword research results tailored to your needs.",
      "Your data helps us personalize your experience by remembering your preferences, customizing content recommendations, and optimizing the performance of our AI models. We also use aggregated and anonymized data to analyze trends and improve our platform.",
      "We may use your contact information to send you important account-related communications, product updates, security alerts, and promotional messages. You can opt out of promotional communications at any time through your account settings or by contacting us directly.",
    ],
  },
  {
    icon: Share2,
    number: "04",
    title: "Information Sharing",
    color: "from-pink-500 to-rose-500",
    paragraphs: [
      "We do not sell your personal information to third parties. We may share your information with trusted service providers who assist us in operating our platform, such as cloud hosting providers, payment processors, and analytics services.",
      "These third-party providers are contractually obligated to protect your data and use it only for the purposes we specify. We may also disclose your information when required by law, court order, or other legal process, or when we believe disclosure is necessary to protect our rights or the safety of our users.",
      "In the event of a merger, acquisition, or sale of assets, your personal information may be transferred as part of that transaction. We will notify you of any such change and any choices you may have regarding your information.",
    ],
  },
  {
    icon: Lock,
    number: "05",
    title: "Data Security",
    color: "from-amber-500 to-orange-500",
    paragraphs: [
      "We implement industry-standard security measures to protect your personal information, including encryption of data in transit and at rest, regular security audits, and strict access controls within our organization.",
      "Our platform uses TLS encryption for all data transmitted between your device and our servers. Sensitive information such as passwords and payment details are hashed and stored securely using best-in-class cryptographic practices.",
      "While we take every reasonable precaution to protect your data, no method of electronic storage or transmission is completely secure. We encourage you to use strong, unique passwords and enable two-factor authentication on your account for additional protection.",
    ],
  },
  {
    icon: Cookie,
    number: "06",
    title: "Cookies and Tracking",
    color: "from-teal-500 to-cyan-500",
    paragraphs: [
      "We use cookies and similar technologies to enhance your experience on our platform. Cookies help us remember your preferences, maintain your login session, and gather analytical data about how our platform is used.",
      "Essential cookies are required for the platform to function properly and cannot be disabled. Analytics and performance cookies help us understand user behavior and improve our services. Marketing cookies may be used to deliver relevant advertisements and measure campaign effectiveness.",
      "You can manage your cookie preferences through your browser settings. Please note that disabling certain cookies may affect the functionality of our platform. We respect \"Do Not Track\" signals and other browser-based privacy preferences.",
    ],
  },
  {
    icon: Server,
    number: "07",
    title: "Data Retention",
    color: "from-purple-500 to-violet-500",
    paragraphs: [
      "We retain your personal information for as long as your account is active or as needed to provide you with our services. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law.",
      "Some information may be retained in anonymized or aggregated form for analytical purposes after your account is deleted. This data cannot be used to identify you personally and may be retained indefinitely to help us improve our services.",
      "Content you generate using our AI tools is stored securely on our servers and can be accessed or deleted through your account dashboard at any time. We do not use your generated content to train our AI models without your explicit consent.",
    ],
  },
  {
    icon: AlertCircle,
    number: "08",
    title: "Your Rights",
    color: "from-red-500 to-pink-500",
    paragraphs: [
      "Depending on your jurisdiction, you may have rights regarding your personal information, including the right to access, correct, delete, or restrict the processing of your data. We honor these rights and provide tools within our platform to exercise them.",
      "To exercise any of these rights, you can contact our privacy team at the email address listed below. We will respond to your request within 30 days and may ask you to verify your identity before processing certain requests.",
      "If you are located in the European Economic Area, you have additional rights under the General Data Protection Regulation (GDPR), including the right to data portability and the right to lodge a complaint with a supervisory authority.",
    ],
  },
  {
    icon: Mail,
    number: "09",
    title: "Contact Us",
    color: "from-indigo-500 to-purple-500",
    paragraphs: [
      "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please do not hesitate to reach out to our privacy team. We are committed to resolving any issues promptly and transparently.",
      "You can contact us through our Contact page, or by emailing our dedicated privacy team. We aim to respond to all inquiries within 48 hours during business days.",
      "We value your trust and are dedicated to maintaining the highest standards of privacy and data protection across all aspects of our platform and services.",
    ],
  },
]

export default function PrivacyPolicyPage() {
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
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Privacy <span className="gradient-primary-text">Policy</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
            Your privacy matters to us. Learn how Nextill AI collects, uses, protects, and manages your personal information.
          </p>
          <p className="text-muted text-sm mt-3">Last updated: July 2026</p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-8 sm:p-10">
            <p className="text-muted leading-relaxed text-base">
              At Nextill AI, we take your privacy seriously. This Privacy Policy describes how we handle the information we collect when you use our AI-powered SEO content platform, including keyword research, post generation, and plagiarism checking tools.
            </p>
            <p className="text-muted leading-relaxed text-base mt-4">
              We believe in transparency and want you to understand exactly what data we collect and why. Our platform is designed with privacy in mind, and we work continuously to ensure your information remains secure and is only used to deliver and improve the services you rely on.
            </p>
            <h2 className="text-xl font-bold mt-8 mb-3">Our Commitment</h2>
            <p className="text-muted leading-relaxed text-base">
              We are committed to complying with applicable data protection laws, including the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other relevant regulations. If you have any questions about this policy, our team is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Sections */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">Detailed <span className="gradient-primary-text">Policy</span> Sections</h2>
            <p className="text-muted mt-2 max-w-xl mx-auto">
              A comprehensive breakdown of how we handle your data across every aspect of our platform.
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
              <h2 className="text-2xl sm:text-3xl font-bold">Have Questions About Your Privacy?</h2>
              <p className="text-muted mt-3 max-w-lg mx-auto">
                Our team is ready to help. Reach out if you have any concerns about how your data is handled.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="inline-flex items-center justify-center px-8 py-3 rounded-xl gradient-primary text-white font-semibold text-base hover:opacity-90 transition-all">
                  Contact Us
                </Link>
                <Link href="/signup" className="inline-flex items-center justify-center px-8 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white font-semibold text-base hover:bg-white/[0.06] transition-all">
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
