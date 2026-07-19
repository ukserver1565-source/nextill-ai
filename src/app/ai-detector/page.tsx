export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "AI Detector",
  description:
    "Detect whether content was written by AI or a human with high accuracy.",
  openGraph: {
    title: "AI Detector — Nextill AI",
    description:
      "Detect whether content was written by AI or a human with high accuracy.",
    url: `${getSiteUrl()}/ai-detector`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="AI Detector" targetRoute="/post-generator" />
      <GenericToolPage slug="ai-detector" />
    </>
  )
}
