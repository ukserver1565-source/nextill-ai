export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Content Brief",
  description:
    "Create detailed content briefs with SEO guidelines and structure.",
  openGraph: {
    title: "Content Brief — Nextill AI",
    description:
      "Create detailed content briefs with SEO guidelines and structure.",
    url: `${getSiteUrl()}/content-brief`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="Content Brief" targetRoute="/post-generator" />
      <GenericToolPage slug="content-brief" />
    </>
  )
}
