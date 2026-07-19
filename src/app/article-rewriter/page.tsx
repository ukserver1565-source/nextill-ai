export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Article Rewriter",
  description:
    "Rewrite and rephrase articles while preserving meaning and SEO value.",
  openGraph: {
    title: "Article Rewriter — Nextill AI",
    description:
      "Rewrite and rephrase articles while preserving meaning and SEO value.",
    url: `${getSiteUrl()}/article-rewriter`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="Article Rewriter" targetRoute="/post-generator" />
      <GenericToolPage slug="article-rewriter" />
    </>
  )
}
