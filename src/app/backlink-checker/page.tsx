export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Backlink Checker",
  description:
    "Analyze backlinks to your site and monitor link profile health.",
  openGraph: {
    title: "Backlink Checker — Nextill AI",
    description:
      "Analyze backlinks to your site and monitor link profile health.",
    url: `${getSiteUrl()}/backlink-checker`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="Backlink Checker" targetRoute="/post-generator" />
      <GenericToolPage slug="backlink-checker" />
    </>
  )
}
