import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"
import PlagiarismCheckerClient from "./plagiarism-checker-client"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { ToolStatusGuard } from "@/components/shared/tool-status-guard"

export const metadata: Metadata = {
  title: "Plagiarism & Authenticity Checker",
  description:
    "Check content originality against billions of web sources. Get detailed similarity reports with source URL detection and AI detection scoring.",
  openGraph: {
    title: "Plagiarism & Authenticity Checker — Nextill AI",
    description:
      "Check content originality with detailed similarity scoring, source URL detection, and downloadable reports.",
    url: `${getSiteUrl()}/plagiarism-checker`,
  },
}

export default function PlagiarismCheckerPage() {
  return (
    <ToolStatusGuard toolSlug="plagiarism-checker" toolName="Plagiarism & Authenticity Checker" toolDescription="Check content originality against billions of web sources">
      <div className="min-h-screen bg-background flex flex-col">
        <PublicHeader />
        <div className="flex-1">
          <PlagiarismCheckerClient />
        </div>
        <PublicFooter />
      </div>
    </ToolStatusGuard>
  )
}
