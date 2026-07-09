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
