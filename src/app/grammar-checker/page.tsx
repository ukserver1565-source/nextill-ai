export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Free Grammar Checker — Fix Writing Errors | Nextill AI",
  description:
    "Check and fix grammar, spelling, and punctuation errors in your content.",
  keywords: ["grammar checker free", "spell check", "writing assistant"],
  openGraph: {
    title: "Free Grammar Checker — Fix Writing Errors | Nextill AI",
    description:
      "Check and fix grammar, spelling, and punctuation errors in your content.",
    url: `${getSiteUrl()}/grammar-checker`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Grammar Checker — Fix Writing Errors | Nextill AI",
    description: "Check and fix grammar, spelling, and punctuation errors in your content.",
  },
  alternates: {
    canonical: `${getSiteUrl()}/grammar-checker`,
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
