export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "AI Writer",
  description:
    "Generate AI-powered articles and blog content with advanced writing models.",
  openGraph: {
    title: "AI Writer — Nextill AI",
    description:
      "Generate AI-powered articles and blog content with advanced writing models.",
    url: `${getSiteUrl()}/ai-writer`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="AI Writer" targetRoute="/post-generator" />
      <GenericToolPage slug="ai-writer" />
    </>
  )
}
