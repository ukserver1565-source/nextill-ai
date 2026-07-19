export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Rank Tracker",
  description:
    "Track your keyword rankings and monitor SEO performance over time.",
  openGraph: {
    title: "Rank Tracker — Nextill AI",
    description:
      "Track your keyword rankings and monitor SEO performance over time.",
    url: `${getSiteUrl()}/rank-tracker`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="Rank Tracker" targetRoute="/post-generator" />
      <GenericToolPage slug="rank-tracker" />
    </>
  )
}
