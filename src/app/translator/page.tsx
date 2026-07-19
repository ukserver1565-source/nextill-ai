export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Translator",
  description:
    "Translate content between multiple languages while maintaining context.",
  openGraph: {
    title: "Translator — Nextill AI",
    description:
      "Translate content between multiple languages while maintaining context.",
    url: `${getSiteUrl()}/translator`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="Translator" targetRoute="/post-generator" />
      <GenericToolPage slug="translator" />
    </>
  )
}
