export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "SEO Title Generator",
  description:
    "Generate optimized title tags for better search engine rankings.",
  openGraph: {
    title: "SEO Title Generator — Nextill AI",
    description:
      "Generate optimized title tags for better search engine rankings.",
    url: `${getSiteUrl()}/seo-title-generator`,
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
