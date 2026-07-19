export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Grammar Checker",
  description:
    "Check and fix grammar, spelling, and punctuation errors in your content.",
  openGraph: {
    title: "Grammar Checker — Nextill AI",
    description:
      "Check and fix grammar, spelling, and punctuation errors in your content.",
    url: `${getSiteUrl()}/grammar-checker`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="Grammar Checker" targetRoute="/post-generator" />
      <GenericToolPage slug="grammar-checker" />
    </>
  )
}
