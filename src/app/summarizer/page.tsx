export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "AI Summarizer — Condense Long Articles | Nextill AI",
  description:
    "Condense long articles and documents into concise, key-point summaries.",
  keywords: ["AI summarizer", "text summarizer", "article summarizer"],
  openGraph: {
    title: "AI Summarizer — Condense Long Articles | Nextill AI",
    description:
      "Condense long articles and documents into concise, key-point summaries.",
    url: `${getSiteUrl()}/summarizer`,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Summarizer — Condense Long Articles | Nextill AI",
    description: "Condense long articles and documents into concise, key-point summaries.",
  },
  alternates: {
    canonical: `${getSiteUrl()}/summarizer`,
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
