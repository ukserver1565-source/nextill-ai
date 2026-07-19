export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Sitemap Generator",
  description:
    "Create XML sitemaps to help search engines crawl your site.",
  openGraph: {
    title: "Sitemap Generator — Nextill AI",
    description:
      "Create XML sitemaps to help search engines crawl your site.",
    url: `${getSiteUrl()}/sitemap-generator`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="Sitemap Generator" targetRoute="/post-generator" />
      <GenericToolPage slug="sitemap-generator" />
    </>
  )
}
