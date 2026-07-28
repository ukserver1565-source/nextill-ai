export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Free AI Writer — Generate SEO Content Instantly | Nextill AI",
  description:
    "Generate AI-powered articles and blog content with advanced writing models.",
  keywords: ["AI writer free", "AI content generator", "SEO content writer"],
  openGraph: {
    title: "Free AI Writer — Generate SEO Content Instantly | Nextill AI",
    description:
      "Generate AI-powered articles and blog content with advanced writing models.",
    url: `${getSiteUrl()}/ai-writer`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Writer — Generate SEO Content Instantly | Nextill AI",
    description: "Generate AI-powered articles and blog content with advanced writing models.",
  },
  alternates: {
    canonical: `${getSiteUrl()}/ai-writer`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="AI Writer" targetRoute="/post-generator" />
      <GenericToolPage slug="ai-writer" />
    </>
  )
}
