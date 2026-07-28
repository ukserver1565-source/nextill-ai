export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "AI Humanizer — Make AI Content Sound Human | Nextill AI",
  description:
    "Humanize AI-generated content to sound natural and pass AI detection.",
  keywords: ["AI humanizer", "bypass AI detection", "humanize AI text"],
  openGraph: {
    title: "AI Humanizer — Make AI Content Sound Human | Nextill AI",
    description:
      "Humanize AI-generated content to sound natural and pass AI detection.",
    url: `${getSiteUrl()}/ai-humanizer`,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Humanizer — Make AI Content Sound Human | Nextill AI",
    description: "Humanize AI-generated content to sound natural and pass AI detection.",
  },
  alternates: {
    canonical: `${getSiteUrl()}/ai-humanizer`,
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
