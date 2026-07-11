export const dynamic = "force-dynamic"
import { LegacyBanner } from "@/components/tools/legacy-banner"
import { GenericToolPage } from "@/components/tools/generic-tool-page"

export default function OldToolPage() {
  return (
    <>
      <LegacyBanner toolName="AI Writer" targetRoute="/post-generator" />
      <GenericToolPage slug="ai-writer" />
    </>
  )
}
