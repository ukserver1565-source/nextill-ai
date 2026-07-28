export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "AI Content Detector — Check if Text is AI-Generated | Nextill AI",
  description:
    "Detect whether content was written by AI or a human with high accuracy.",
  keywords: ["AI detector", "check AI content", "GPTZero alternative"],
  openGraph: {
    title: "AI Content Detector — Check if Text is AI-Generated | Nextill AI",
    description:
      "Detect whether content was written by AI or a human with high accuracy.",
    url: `${getSiteUrl()}/ai-detector`,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Content Detector — Check if Text is AI-Generated | Nextill AI",
    description: "Detect whether content was written by AI or a human with high accuracy.",
  },
  alternates: {
    canonical: `${getSiteUrl()}/ai-detector`,
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
