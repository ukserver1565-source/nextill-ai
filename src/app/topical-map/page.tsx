export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Topical Map",
  description:
    "Generate topical authority maps for comprehensive content strategy.",
  openGraph: {
    title: "Topical Map — Nextill AI",
    description:
      "Generate topical authority maps for comprehensive content strategy.",
    url: `${getSiteUrl()}/topical-map`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="Topical Map" targetRoute="/post-generator" />
      <GenericToolPage slug="topical-map" />
    </>
  )
}
