import Link from "next/link"
import { Search, FileText, Shield, Sparkles, Check, ChevronRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    icon: Search,
    title: "Keyword Intelligence",
    desc: "Discover high-value keywords with real-time volume, difficulty scoring, and SERP feature analysis powered by AI.",
    points: ["Search volume & trends", "Keyword difficulty scoring", "SERP feature analysis", "Competitor keyword gaps", "Export to CSV"],
    color: "from-violet-500 to-indigo-600",
    slug: "keyword-intelligence",
  },
  {
    icon: FileText,
    title: "Post Generator",
    desc: "Generate fully SEO-optimized blog posts in one click — complete with titles, meta descriptions, FAQ schema, and internal links.",
    points: ["Full article generation", "SEO title & meta", "FAQ & schema markup", "Multiple content types", "Readability scoring"],
    color: "from-blue-500 to-purple-600",
    slug: "post-generator",
  },
  {
    icon: Shield,
    title: "Plagiarism Checker",
    desc: "Verify content originality against billions of web sources with detailed similarity reports and source URL detection.",
    points: ["Web-wide comparison", "Similarity scoring", "Source URL detection", "Downloadable reports", "Real-time scanning"],
    color: "from-emerald-500 to-green-600",
    slug: "plagiarism-checker",
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="glass-topbar sticky top-0 z-50 h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="gradient-primary-text">Nextill AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <span className="text-sm text-muted hover:text-white transition-colors">Sign In</span>
            </Link>
            <Link href="/signup">
              <span className="text-sm px-4 py-2 rounded-lg gradient-primary text-white font-medium">Get Started</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[140px]" />
          <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge variant="info" className="mb-6 px-4 py-1.5 text-sm">
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            3 Premium AI Workflows
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Powerful <span className="gradient-primary-text">AI Tools</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
            Everything you need to research, create, and verify content that ranks — powered by advanced AI.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="glass-card rounded-2xl p-6 sm:p-8 h-full flex flex-col group hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="success" size="sm" showDot>
                      Live
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold group-hover:gradient-primary-text transition-all duration-300">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted mt-2 flex-1 leading-relaxed">{f.desc}</p>
                  <ul className="mt-4 space-y-2">
                    {f.points.map((p) => (
                      <li key={p} className="text-xs text-muted flex items-center gap-2">
                        <Check className="w-3 h-3 text-primary-light shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-4 border-t border-border">
                    <Link
                      href={`/${f.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm text-primary-light font-medium hover:gap-2.5 transition-all"
                    >
                      Open Tool <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
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
              <h2 className="text-2xl sm:text-3xl font-bold">Ready to Transform Your Workflow?</h2>
              <p className="text-muted mt-3 max-w-lg mx-auto">
                Start for free with 100 AI credits. No credit card required.
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

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold gradient-primary-text">Nextill AI</span>
            </Link>
            <p className="text-xs text-muted">
              &copy; {new Date().getFullYear()} Nextill AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
