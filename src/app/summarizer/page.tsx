export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Summarizer",
  description:
    "Condense long articles and documents into concise, key-point summaries.",
  openGraph: {
    title: "Summarizer — Nextill AI",
    description:
      "Condense long articles and documents into concise, key-point summaries.",
    url: `${getSiteUrl()}/summarizer`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="Summarizer" targetRoute="/post-generator" />
      <GenericToolPage slug="summarizer" />
    </>
  )
}
