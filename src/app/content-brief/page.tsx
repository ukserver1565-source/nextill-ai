export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "AI Content Brief Generator — Plan SEO Content | Nextill AI",
  description:
    "Create detailed content briefs with SEO guidelines and structure.",
  keywords: ["content brief generator", "SEO content plan", "article outline"],
  openGraph: {
    title: "AI Content Brief Generator — Plan SEO Content | Nextill AI",
    description:
      "Create detailed content briefs with SEO guidelines and structure.",
    url: `${getSiteUrl()}/content-brief`,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Content Brief Generator — Plan SEO Content | Nextill AI",
    description: "Create detailed content briefs with SEO guidelines and structure.",
  },
  alternates: {
    canonical: `${getSiteUrl()}/content-brief`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="Content Brief" targetRoute="/post-generator" />
      <GenericToolPage slug="content-brief" />
    </>
  )
}
