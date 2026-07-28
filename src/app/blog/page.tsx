import type { Metadata } from "next"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { getSiteUrl } from "@/lib/site-url"
import { BackButton } from "@/components/shared/back-button"
import { BlogListClient } from "./blog-list-client"

export const metadata: Metadata = {
  title: "Blog — AI SEO & Content Marketing Insights",
  description:
    "Expert insights on AI-powered SEO, content creation, keyword research, and digital marketing strategies. Stay ahead with the latest trends and tools.",
  keywords: ["AI SEO blog", "content marketing tips", "keyword research guide", "SEO strategy 2026"],
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — AI SEO & Content Marketing Insights | Nextill AI",
    description:
      "Expert insights on AI-powered SEO, content creation, keyword research, and digital marketing.",
    url: `${getSiteUrl()}/blog`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI SEO Blog | Nextill AI",
    description: "Expert insights on AI-powered SEO and content marketing.",
  },
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 left-1/4 w-[800px] h-[800px] rounded-full bg-primary/15 blur-[160px]" />
          <div className="absolute top-20 right-1/4 w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[140px]" />
          <div className="absolute -bottom-40 left-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              AI-Powered SEO Insights
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              The{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                AI SEO
              </span>{" "}
              Blog
            </h1>
            <p className="text-muted text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              Expert insights on AI-powered content creation, SEO strategies, keyword research,
              and digital marketing — powered by data, not guesswork.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: "Articles", value: "5+" },
              { label: "Topics", value: "SEO, AI, Content" },
              { label: "Updated", value: "Weekly" },
              { label: "Free", value: "Always" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-xl bg-card/50 border border-border/50">
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <BlogListClient />
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20" />
            <div className="absolute inset-0 bg-card/80 backdrop-blur-sm" />
            <div className="relative p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Ready to{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Boost Your SEO
                </span>
                ?
              </h2>
              <p className="text-muted mb-8 max-w-xl mx-auto">
                Try our AI-powered SEO tools — keyword research, content optimization,
                plagiarism checking, and more. Free to start.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="/signup"
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-foreground font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                >
                  Get Started Free
                </a>
                <a
                  href="/#tools"
                  className="px-8 py-3 rounded-xl border border-border bg-card/50 text-foreground font-medium text-sm hover:bg-card/80 transition-colors"
                >
                  Explore Tools
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
