export const dynamic = "force-dynamic"
import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"

export const metadata: Metadata = {
  title: "Meta Description Generator",
  description:
    "Create compelling meta descriptions that improve click-through rates.",
  openGraph: {
    title: "Meta Description Generator — Nextill AI",
    description:
      "Create compelling meta descriptions that improve click-through rates.",
    url: `${getSiteUrl()}/meta-description-generator`,
  },
}

import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="Meta Description Generator" targetRoute="/post-generator" />
      <GenericToolPage slug="meta-description-generator" />
    </>
  )
}
