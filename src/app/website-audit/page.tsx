export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Website Audit",
  description:
    "Audit your website for SEO issues, performance, and best practices.",
  openGraph: {
    title: "Website Audit — Nextill AI",
    description:
      "Audit your website for SEO issues, performance, and best practices.",
    url: `${getSiteUrl()}/website-audit`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="Website Audit" targetRoute="/post-generator" />
      <GenericToolPage slug="website-audit" />
    </>
  )
}
