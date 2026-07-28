export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Free Schema Markup Generator — Structured Data | Nextill AI",
  description:
    "Generate JSON-LD structured data schema markup for your pages.",
  keywords: ["schema generator", "JSON-LD", "structured data"],
  openGraph: {
    title: "Free Schema Markup Generator — Structured Data | Nextill AI",
    description:
      "Generate JSON-LD structured data schema markup for your pages.",
    url: `${getSiteUrl()}/schema-generator`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Schema Markup Generator — Structured Data | Nextill AI",
    description: "Generate JSON-LD structured data schema markup for your pages.",
  },
  alternates: {
    canonical: `${getSiteUrl()}/schema-generator`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="Schema Generator" targetRoute="/post-generator" />
      <GenericToolPage slug="schema-generator" />
    </>
  )
}
