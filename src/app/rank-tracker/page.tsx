export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Free Rank Tracker — Monitor Google Rankings | Nextill AI",
  description:
    "Track your keyword rankings and monitor SEO performance over time.",
  keywords: ["rank tracker", "SERP tracking", "Google position checker"],
  openGraph: {
    title: "Free Rank Tracker — Monitor Google Rankings | Nextill AI",
    description:
      "Track your keyword rankings and monitor SEO performance over time.",
    url: `${getSiteUrl()}/rank-tracker`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Rank Tracker — Monitor Google Rankings | Nextill AI",
    description: "Track your keyword rankings and monitor SEO performance over time.",
  },
  alternates: {
    canonical: `${getSiteUrl()}/rank-tracker`,
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
