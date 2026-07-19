export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Keyword Research",
  description:
    "Research keywords with search volume, difficulty, and competition data.",
  openGraph: {
    title: "Keyword Research — Nextill AI",
    description:
      "Research keywords with search volume, difficulty, and competition data.",
    url: `${getSiteUrl()}/keyword-research`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="Keyword Research" targetRoute="/post-generator" />
      <GenericToolPage slug="keyword-research" />
    </>
  )
}
