import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"
import PostGeneratorClient from "./post-generator-client"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { ToolStatusGuard } from "@/components/shared/tool-status-guard"

export const metadata: Metadata = {
  title: "AI Post Generator",
  description:
    "Generate fully SEO-optimized blog posts with AI in one click. Includes SEO titles, meta descriptions, FAQ schema, internal links, and structured content.",
  openGraph: {
    title: "AI Post Generator — Nextill AI",
    description:
      "Generate SEO-optimized blog posts with AI — titles, meta, FAQ schema, and internal links included.",
    url: `${getSiteUrl()}/post-generator`,
  },
}

export default function PostGeneratorPage() {
  return (
    <ToolStatusGuard toolSlug="post-generator" toolName="AI Post Generator" toolDescription="Generate SEO-optimized blog posts with AI">
      <div className="min-h-screen bg-background flex flex-col">
        <PublicHeader />
        <div className="flex-1">
          <PostGeneratorClient />
        </div>
        <PublicFooter />
      </div>
    </ToolStatusGuard>
  )
}
