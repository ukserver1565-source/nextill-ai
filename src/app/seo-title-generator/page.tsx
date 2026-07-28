export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Free SEO Title Generator — Optimized Meta Titles | Nextill AI",
  description:
    "Generate optimized title tags for better search engine rankings.",
  keywords: ["SEO title generator", "meta title", "page title optimizer"],
  openGraph: {
    title: "Free SEO Title Generator — Optimized Meta Titles | Nextill AI",
    description:
      "Generate optimized title tags for better search engine rankings.",
    url: `${getSiteUrl()}/seo-title-generator`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free SEO Title Generator — Optimized Meta Titles | Nextill AI",
    description: "Generate optimized title tags for better search engine rankings.",
  },
  alternates: {
    canonical: `${getSiteUrl()}/seo-title-generator`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="SEO Title Generator" targetRoute="/post-generator" />
      <GenericToolPage slug="seo-title-generator" />
    </>
  )
}
