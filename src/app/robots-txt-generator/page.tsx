export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Robots.txt Generator",
  description:
    "Generate robots.txt files to control search engine crawling.",
  openGraph: {
    title: "Robots.txt Generator — Nextill AI",
    description:
      "Generate robots.txt files to control search engine crawling.",
    url: `${getSiteUrl()}/robots-txt-generator`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="Robots.txt Generator" targetRoute="/post-generator" />
      <GenericToolPage slug="robots-txt-generator" />
    </>
  )
}
