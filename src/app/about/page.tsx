import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles, Search, FileText, Shield, Zap, Users, Award } from "lucide-react"
import { BackButton } from "@/components/shared/back-button"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Nextill AI — the all-in-one platform for AI-powered SEO content creation, keyword research, and plagiarism detection. Our mission is to democratize premium AI tools for creators of all sizes.",
  openGraph: {
    title: "About Nextill AI — AI-Powered SEO & Content Platform",
    description:
      "Learn about Nextill AI and our mission to democratize premium AI content tools for creators and businesses.",
    url: `${getSiteUrl()}/about`,
  },
}

const features = [
  {
    icon: Search,
    title: "Keyword Intelligence",
    desc: "Discover high-value keywords with real-time volume, difficulty scoring, and SERP feature analysis powered by AI.",
    color: "from-violet-500 to-indigo-600",
  },
  {
    icon: FileText,
    title: "Post Generator",
    desc: "Generate fully SEO-optimized blog posts in one click — complete with titles, meta descriptions, FAQ schema, and internal links.",
    color: "from-blue-500 to-purple-600",
  },
  {
    icon: Shield,
    title: "Plagiarism Checker",
    desc: "Verify content originality against billions of web sources with detailed similarity reports and source URL detection.",
    color: "from-emerald-500 to-green-600",
  },
]

const stats = [
  { icon: Zap, value: "AI-Powered", label: "Content Generation" },
  { icon: FileText, value: "SEO-First", label: "Optimized Output" },
  { icon: Users, value: "Multi-User", label: "Workspace Support" },
  { icon: Award, value: "99.9%", label: "Platform Uptime" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicHeader />

      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto mb-8">
          <BackButton fallback="/" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[140px]" />
          <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-6 shadow-lg shadow-primary/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            About <span className="gradient-primary-text">Nextill AI</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
            The all-in-one platform for AI-powered SEO content creation, keyword research, and plagiarism detection.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-8 sm:p-10">
            <p className="text-muted leading-relaxed text-base">
              Nextill AI is a premium suite of AI-powered content tools designed to help marketers, SEO professionals, and content creators produce high-quality, search-optimized content at scale.
            </p>
            <p className="text-muted leading-relaxed text-base mt-4">
              Our platform combines advanced language models with proven SEO methodologies to deliver content that ranks. From keyword discovery to full article generation and plagiarism verification, Nextill AI streamlines your entire content workflow.
            </p>
            <h2 className="text-xl font-bold mt-8 mb-3">Our Mission</h2>
            <p className="text-muted leading-relaxed text-base">
              To democratize access to premium AI content tools, making enterprise-grade SEO capabilities available to creators and businesses of all sizes.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">Powerful Features</h2>
            <p className="text-muted mt-2 max-w-xl mx-auto">
              Everything you need to research, create, and verify content — all in one platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="glass-card rounded-2xl p-6 h-full flex flex-col group hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted flex-1 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="glass-card rounded-2xl p-6 text-center">
                  <Icon className="w-6 h-6 text-primary-light mx-auto mb-3" />
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted mt-1">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

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

      <PublicFooter />
    </div>
  )
}
