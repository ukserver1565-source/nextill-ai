import type { Metadata } from "next"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { getSiteUrl } from "@/lib/site-url"
import { BackButton } from "@/components/shared/back-button"
import { BlogListClient } from "./blog-list-client"

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read the latest insights on AI-powered SEO, content creation, keyword research, and digital marketing from the Nextill AI team.",
  openGraph: {
    title: "Blog — Nextill AI",
    description:
      "Insights on AI-powered SEO, content creation, keyword research, and digital marketing.",
    url: `${getSiteUrl()}/blog`,
    type: "website",
  },
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicHeader />

      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto mb-8">
          <BackButton fallback="/" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[140px]" />
          <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[120px]" />
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Our <span className="gradient-primary-text">Blog</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
            Insights on AI-powered SEO, content creation, and digital marketing strategies.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <BlogListClient />
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
