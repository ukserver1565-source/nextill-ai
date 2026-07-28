export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Free Website Audit Tool — SEO Health Check | Nextill AI",
  description:
    "Audit your website for SEO issues, performance, and best practices.",
  keywords: ["website audit", "SEO audit", "site health check"],
  openGraph: {
    title: "Free Website Audit Tool — SEO Health Check | Nextill AI",
    description:
      "Audit your website for SEO issues, performance, and best practices.",
    url: `${getSiteUrl()}/website-audit`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Website Audit Tool — SEO Health Check | Nextill AI",
    description: "Audit your website for SEO issues, performance, and best practices.",
  },
  alternates: {
    canonical: `${getSiteUrl()}/website-audit`,
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
