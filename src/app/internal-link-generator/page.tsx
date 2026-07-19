export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Internal Link Generator",
  description:
    "Discover and generate internal linking opportunities for SEO.",
  openGraph: {
    title: "Internal Link Generator — Nextill AI",
    description:
      "Discover and generate internal linking opportunities for SEO.",
    url: `${getSiteUrl()}/internal-link-generator`,
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
