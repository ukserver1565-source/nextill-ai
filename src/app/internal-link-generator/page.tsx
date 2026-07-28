export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Internal Link Generator — Improve Site Structure | Nextill AI",
  description:
    "Discover and generate internal linking opportunities for SEO.",
  keywords: ["internal links", "site structure", "link building"],
  openGraph: {
    title: "Internal Link Generator — Improve Site Structure | Nextill AI",
    description:
      "Discover and generate internal linking opportunities for SEO.",
    url: `${getSiteUrl()}/internal-link-generator`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Internal Link Generator — Improve Site Structure | Nextill AI",
    description: "Discover and generate internal linking opportunities for SEO.",
  },
  alternates: {
    canonical: `${getSiteUrl()}/internal-link-generator`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="Internal Link Generator" targetRoute="/post-generator" />
      <GenericToolPage slug="internal-link-generator" />
    </>
  )
}
