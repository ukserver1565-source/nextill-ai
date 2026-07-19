export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "AI Humanizer",
  description:
    "Humanize AI-generated content to sound natural and pass AI detection.",
  openGraph: {
    title: "AI Humanizer — Nextill AI",
    description:
      "Humanize AI-generated content to sound natural and pass AI detection.",
    url: `${getSiteUrl()}/ai-humanizer`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="AI Humanizer" targetRoute="/post-generator" />
      <GenericToolPage slug="ai-humanizer" />
    </>
  )
}
