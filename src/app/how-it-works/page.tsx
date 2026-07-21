import type { Metadata } from "next"
import Link from "next/link"
import { getSiteUrl } from "@/lib/site-url"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { BackButton } from "@/components/shared/back-button"
import { Search, FileText, Shield, ArrowRight, Check, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how Nextill AI works in 3 simple steps. Research keywords, generate SEO-optimized content, and verify originality with AI-powered workflows.",
  openGraph: {
    title: "How It Works — Nextill AI",
    description: "3 simple steps to AI-powered SEO content creation.",
    url: `${getSiteUrl()}/how-it-works`,
  },
}

const steps = [
  {
    number: "01",
    title: "Research & Discover",
    description: "Enter your topic or domain and our AI analyzes search volume, difficulty, trends, and competitor data to find the best keywords and content opportunities.",
    icon: Search,
    color: "from-violet-500 to-indigo-600",
    details: [
      "AI-powered keyword analysis",
      "Search volume & difficulty scores",
      "Trend data and SERP analysis",
      "Competitor keyword gaps",
    ],
  },
  {
    number: "02",
    title: "Generate & Optimize",
    description: "Our AI writes a full, SEO-optimized blog post — complete with title, meta description, FAQ section, internal links, and structured content.",
    icon: FileText,
    color: "from-blue-500 to-purple-600",
    details: [
      "Full article generation in seconds",
      "SEO-optimized titles and meta tags",
      "FAQ schema markup included",
      "Internal linking suggestions",
    ],
  },
  {
    number: "03",
    title: "Verify & Publish",
    description: "Check your content for originality against billions of web sources. Ensure it's unique and safe to publish with our plagiarism and AI detection tools.",
    icon: Shield,
    color: "from-emerald-500 to-green-600",
    details: [
      "Plagiarism detection",
      "AI content detection",
      "Similarity scoring",
      "Source URL verification",
    ],
  },
]

export default function HowItWorksPage() {
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
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            How <span className="gradient-primary-text">Nextill AI</span> Works
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
            Create SEO-optimized content in 3 simple steps. No coding, no design skills needed.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-16">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.number} className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-center`}>
                <div className="flex-1">
                  <div className="text-6xl font-bold gradient-primary-text opacity-30 mb-2">{step.number}</div>
                  <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
                  <p className="text-muted leading-relaxed mb-6">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map(d => (
                      <li key={d} className="flex items-center gap-2 text-sm text-muted">
                        <Check className="w-4 h-4 text-[#22C55E] shrink-0" /> {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-shrink-0">
                  <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl`}>
                    <Icon className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Get Started?</h2>
              <p className="text-muted mt-3 max-w-lg mx-auto">
                Join thousands of creators using Nextill AI to work smarter, create faster, and rank higher.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="inline-flex items-center justify-center px-8 py-3 rounded-xl gradient-primary text-white font-semibold text-base hover:opacity-90 transition-all">
                  Start Free <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link href="/tools" className="inline-flex items-center justify-center px-8 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white font-semibold text-base hover:bg-white/[0.06] transition-all">
                  Explore Tools
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
