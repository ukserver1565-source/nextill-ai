export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "FAQ Generator — Create FAQ Pages with AI | Nextill AI",
  description:
    "Generate FAQ sections with schema markup for better search visibility.",
  keywords: ["FAQ generator", "frequently asked questions", "FAQ schema"],
  openGraph: {
    title: "FAQ Generator — Create FAQ Pages with AI | Nextill AI",
    description:
      "Generate FAQ sections with schema markup for better search visibility.",
    url: `${getSiteUrl()}/faq-generator`,
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ Generator — Create FAQ Pages with AI | Nextill AI",
    description: "Generate FAQ sections with schema markup for better search visibility.",
  },
  alternates: {
    canonical: `${getSiteUrl()}/faq-generator`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="FAQ Generator" targetRoute="/post-generator" />
      <GenericToolPage slug="faq-generator" />
    </>
  )
}
