import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"
import DomainOverviewClient from "./domain-overview-client"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"

export const metadata: Metadata = {
  title: "Domain Intelligence",
  description:
    "Discover high-value keywords with real-time search volume, difficulty scoring, trend data, competitor analysis, and SERP feature breakdown — all powered by AI.",
  openGraph: {
    title: "Domain Intelligence — Nextill AI",
    description:
      "Discover high-value keywords with volume, difficulty, trends, competitors, and SERP analysis.",
    url: `${getSiteUrl()}/domain-overview`,
  },
}

export default function DomainOverviewPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader />
      <div className="flex-1">
        <DomainOverviewClient />
      </div>
      <PublicFooter />
    </div>
  )
}
