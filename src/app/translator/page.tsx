export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "AI Translator — Translate Content to Any Language | Nextill AI",
  description:
    "Translate content between multiple languages while maintaining context.",
  keywords: ["AI translator", "content translation", "multilingual"],
  openGraph: {
    title: "AI Translator — Translate Content to Any Language | Nextill AI",
    description:
      "Translate content between multiple languages while maintaining context.",
    url: `${getSiteUrl()}/translator`,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Translator — Translate Content to Any Language | Nextill AI",
    description: "Translate content between multiple languages while maintaining context.",
  },
  alternates: {
    canonical: `${getSiteUrl()}/translator`,
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
