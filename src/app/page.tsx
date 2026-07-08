import Link from "next/link"
import { Sparkles, PenSquare, UserCheck, SearchCheck, FileSearch, Search, Zap, BarChart3, ArrowRight, Star, Shield, Check, ChevronRight, Globe, Clock, Award, Layers, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  { icon: PenSquare, label: "AI Writer", desc: "Generate high-quality, SEO-optimized content from any topic", color: "from-blue-500 to-purple-600", slug: "ai-writer" },
  { icon: UserCheck, label: "AI Humanizer", desc: "Make AI-generated text sound naturally human", color: "from-emerald-500 to-teal-600", slug: "ai-humanizer" },
  { icon: SearchCheck, label: "AI Detector", desc: "Detect AI-generated content with sentence-level analysis", color: "from-amber-500 to-orange-600", slug: "ai-detector" },
  { icon: FileSearch, label: "Plagiarism Checker", desc: "Check content originality against web sources", color: "from-red-500 to-pink-600", slug: "plagiarism-checker" },
  { icon: Search, label: "Keyword Research", desc: "Find high-value keywords with volume and difficulty data", color: "from-violet-500 to-indigo-600", slug: "keyword-research" },
  { icon: BarChart3, label: "Website Audit", desc: "Analyze your site for SEO and performance issues", color: "from-cyan-500 to-blue-600", slug: "website-audit" },
  { icon: Globe, label: "Rank Tracker", desc: "Track keyword positions across search engines", color: "from-green-500 to-emerald-600", slug: "rank-tracker" },
  { icon: Shield, label: "Backlink Checker", desc: "Analyze backlink profiles for any domain", color: "from-purple-500 to-pink-600", slug: "backlink-checker" },
  { icon: Layers, label: "Schema Generator", desc: "Generate JSON-LD structured data for rich snippets", color: "from-indigo-500 to-blue-600", slug: "schema-generator" },
  { icon: Award, label: "SEO Title Generator", desc: "Create click-worthy, optimized title tags", color: "from-orange-500 to-red-600", slug: "seo-title-generator" },
]

const allTools = [
  { name: "AI Writer", slug: "ai-writer", category: "Writing" },
  { name: "AI Humanizer", slug: "ai-humanizer", category: "Writing" },
  { name: "AI Detector", slug: "ai-detector", category: "Research" },
  { name: "Plagiarism Checker", slug: "plagiarism-checker", category: "Research" },
  { name: "SEO Title Generator", slug: "seo-title-generator", category: "SEO" },
  { name: "Meta Description Generator", slug: "meta-description-generator", category: "SEO" },
  { name: "Keyword Research", slug: "keyword-research", category: "Research" },
  { name: "Website Audit", slug: "website-audit", category: "Technical" },
  { name: "Rank Tracker", slug: "rank-tracker", category: "SEO" },
  { name: "Backlink Checker", slug: "backlink-checker", category: "SEO" },
  { name: "Schema Generator", slug: "schema-generator", category: "Technical" },
  { name: "Sitemap Generator", slug: "sitemap-generator", category: "Technical" },
  { name: "Robots.txt Generator", slug: "robots-txt-generator", category: "Technical" },
  { name: "Internal Link Builder", slug: "internal-link-generator", category: "SEO" },
  { name: "Content Brief Generator", slug: "content-brief", category: "Content" },
  { name: "Topical Map Generator", slug: "topical-map", category: "SEO" },
  { name: "FAQ Generator", slug: "faq-generator", category: "Content" },
  { name: "Article Rewriter", slug: "article-rewriter", category: "Writing" },
  { name: "Grammar Checker", slug: "grammar-checker", category: "Writing" },
  { name: "Text Summarizer", slug: "summarizer", category: "Writing" },
  { name: "Translator", slug: "translator", category: "Writing" },
]

const plans = [
  {
    name: "Free", price: "$0", period: "/month", features: ["100 AI credits", "Basic AI Writer", "Plagiarism Checker (5/day)", "Grammar Checker", "3 projects"],
  },
  {
    name: "Pro", price: "$29", period: "/month", features: ["2,000 AI credits", "All AI tools", "Unlimited checks", "Priority support", "10 projects"],
    popular: true,
  },
  {
    name: "Enterprise", price: "$99", period: "/month", features: ["10,000 AI credits", "Team collaboration", "Custom AI models", "Dedicated support", "Unlimited projects"],
  },
]

const faqs = [
  { q: "What is Nextill AI?", a: "Nextill AI is an all-in-one AI platform offering tools for content writing, SEO optimization, AI detection, and more." },
  { q: "Can I use tools without signing up?", a: "Yes! Most tools are available for guest use with daily limits. Sign up for unlimited access." },
  { q: "How do credits work?", a: "Each tool usage costs a certain number of credits based on complexity. Free users start with 100 credits." },
  { q: "Can I save my work?", a: "Logged-in users can save documents and track history. Guest usage is not saved." },
  { q: "Is my data secure?", a: "Yes, we use encryption and never share your data. API keys are stored securely." },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold truncate">Nextill<span className="text-primary-light"> AI</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-xs lg:text-sm">
            <Link href="/tools" className="text-muted hover:text-foreground transition-colors">Explore Tools</Link>
            <Link href="/pricing" className="text-muted hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/contact" className="text-muted hover:text-foreground transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/login"><Button variant="ghost" size="sm" className="text-xs sm:text-sm">Sign In</Button></Link>
            <Link href="/signup"><Button variant="gradient" size="sm" className="text-xs sm:text-sm">Get Started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 pt-16 sm:pt-20 lg:pt-24 pb-10 sm:pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] sm:text-xs text-primary-light mb-4 sm:mb-6">
          <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> 21 AI-Powered SEO & Writing Tools
        </div>
        <h1 className="h-responsive-lg font-bold tracking-tight max-w-4xl mx-auto leading-tight">
          The Future of{" "}
          <span className="gradient-primary-text">AI Productivity</span>
        </h1>
        <p className="text-muted text-sm sm:text-base lg:text-lg mt-3 sm:mt-4 max-w-xl mx-auto px-2">
          Create content faster. Optimize smarter. Grow with AI-powered SEO tools.
        </p>
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center px-4">
          <Link href="/signup" className="w-full sm:w-auto"><Button variant="gradient" size="lg" className="w-full sm:w-auto">Start Free <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
          <Link href="/tools" className="w-full sm:w-auto"><Button variant="outline" size="lg" className="w-full sm:w-auto">Explore All Tools</Button></Link>
        </div>
        <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-3xl mx-auto px-2">
          {[
            { icon: Zap, label: "21 AI Tools", desc: "Writing, SEO, research & more" },
            { icon: Clock, label: "No Signup Required", desc: "Use tools instantly as guest" },
            { icon: Globe, label: "Multi-language", desc: "50+ languages supported" },
            { icon: Award, label: "Free Credits", desc: "100 credits to start" },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-light mx-auto mb-1.5 sm:mb-2" />
                <p className="text-xs sm:text-sm font-semibold">{s.label}</p>
                <p className="text-[9px] sm:text-[10px] text-muted mt-0.5">{s.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* All 21 Tools Section */}
      <section id="tools" className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-10 sm:py-16 scroll-mt-20">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold">All 21 Tools</h2>
          <p className="text-muted text-xs sm:text-sm mt-1 sm:mt-2">Click any tool to use it instantly — no login required</p>
        </div>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {allTools.map((t) => (
            <Link
              key={t.slug}
              href={`/${t.slug}`}
              className="glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 text-center hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group"
            >
              <div className="text-[9px] sm:text-xs text-muted mb-1 sm:mb-2 font-medium uppercase tracking-wider">{t.category}</div>
              <p className="text-xs sm:text-sm font-semibold group-hover:text-primary-light transition-colors">{t.name}</p>
              <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted mx-auto mt-1 sm:mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-10 sm:py-16">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-10">Everything you need to dominate search</h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <Link key={f.label} href={`/${f.slug}`} className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center mb-2 sm:mb-3`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold mb-0.5 sm:mb-1 group-hover:text-primary-light transition-colors">{f.label}</h3>
                <p className="text-xs sm:text-sm text-muted">{f.desc}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-10 sm:py-16">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-10">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {[
            { step: "01", title: "Choose a Tool", desc: "Pick from 21 AI-powered tools for writing, SEO, research, and more." },
            { step: "02", title: "Enter Your Input", desc: "Type a topic, paste text, or enter a URL. No account needed." },
            { step: "03", title: "Get Results", desc: "Receive AI-generated content, analysis, or optimization instantly." },
          ].map((s) => (
            <div key={s.step} className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full gradient-primary flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm font-bold text-white">{s.step}</span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">{s.title}</h3>
              <p className="text-xs sm:text-sm text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-10 sm:py-16">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-10">Simple, transparent pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {plans.map((p) => (
            <div key={p.name} className={`glass-card rounded-lg sm:rounded-xl p-5 sm:p-6 ${p.popular ? "border-primary/40 ring-1 ring-primary/20" : ""}`}>
              {p.popular && <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-primary-light mb-1 sm:mb-2">Most Popular</div>}
              <h3 className="text-base sm:text-lg font-bold">{p.name}</h3>
              <div className="mt-2 mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl font-bold">{p.price}</span>
                <span className="text-muted text-xs sm:text-sm">{p.period}</span>
              </div>
              <ul className="space-y-1.5 sm:space-y-2 mb-5 sm:mb-6">
                {p.features.map((f) => (
                  <li key={f} className="text-[11px] sm:text-xs text-muted flex items-center gap-1.5 sm:gap-2">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-light shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button variant={p.popular ? "gradient" : "outline"} className="w-full" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-10 sm:py-16">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-10">Frequently Asked Questions</h2>
        <div className="max-w-2xl mx-auto space-y-2 sm:space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 group open:border-primary/20 transition-all">
              <summary className="flex items-center justify-between cursor-pointer text-xs sm:text-sm font-medium gap-2">
                <span className="flex-1">{f.q}</span>
                <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted shrink-0 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-xs sm:text-sm text-muted mt-2 pt-2 border-t border-border">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-10 sm:py-16 text-center">
        <div className="glass-card rounded-lg sm:rounded-xl p-6 sm:p-8 lg:p-12 max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Ready to transform your workflow?</h2>
          <p className="text-muted text-xs sm:text-sm mb-4 sm:mb-6">Join thousands of creators using Nextill AI to work smarter and rank higher.</p>
          <Link href="/signup"><Button variant="gradient" size="lg" className="w-full sm:w-auto">Start Free <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
        </div>
      </section>

      {/* Responsive Footer */}
      <footer className="border-t border-border py-8 sm:py-12 px-3 sm:px-4">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 xs:col-span-3 sm:col-span-3 md:col-span-1">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg gradient-primary flex items-center justify-center">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                </div>
                <span className="text-sm sm:text-base font-bold">Nextill<span className="text-primary-light"> AI</span></span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted">AI-powered SEO and content tools for modern creators.</p>
            </div>
            <div>
              <h4 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">Products</h4>
              <div className="space-y-1.5 sm:space-y-2">
                {["AI Writer", "AI Humanizer", "AI Detector", "Plagiarism Checker"].map((p) => (
                  <Link key={p} href={`/${p.toLowerCase().replace(/\s+/g, "-")}`} className="block text-[10px] sm:text-xs text-muted hover:text-foreground transition-colors">{p}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">Tools</h4>
              <div className="space-y-1.5 sm:space-y-2">
                {["Keyword Research", "Website Audit", "Rank Tracker", "Schema Generator"].map((p) => (
                  <Link key={p} href={`/${p.toLowerCase().replace(/\s+/g, "-")}`} className="block text-[10px] sm:text-xs text-muted hover:text-foreground transition-colors">{p}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">Company</h4>
              <div className="space-y-1.5 sm:space-y-2">
                <Link href="/pricing" className="block text-[10px] sm:text-xs text-muted hover:text-foreground transition-colors">Pricing</Link>
                <Link href="/contact" className="block text-[10px] sm:text-xs text-muted hover:text-foreground transition-colors">Contact</Link>
                <Link href="/tools" className="block text-[10px] sm:text-xs text-muted hover:text-foreground transition-colors">All Tools</Link>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">Legal</h4>
              <div className="space-y-1.5 sm:space-y-2">
                <Link href="/privacy-policy" className="block text-[10px] sm:text-xs text-muted hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="block text-[10px] sm:text-xs text-muted hover:text-foreground transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-4 sm:pt-6 text-center text-[10px] sm:text-xs text-muted">
            &copy; {new Date().getFullYear()} Nextill AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
