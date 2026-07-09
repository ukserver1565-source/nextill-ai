import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="Backlink Checker" targetRoute="/post-generator" />
      <GenericToolPage slug="backlink-checker" />
    </>
  )
}
