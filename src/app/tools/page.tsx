import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"
import ToolsClient from "./tools-client"

export const metadata: Metadata = {
  title: "All AI SEO Tools — 22+ Free Tools | Nextill AI",
  description:
    "Explore all 20+ AI-powered SEO tools consolidated into 3 premium workflows: Keyword Intelligence, Post Generator, and Plagiarism Checker.",
  keywords: ["AI SEO tools", "free SEO tools", "content tools"],
  openGraph: {
    title: "All AI SEO Tools — 22+ Free Tools | Nextill AI",
    description:
      "20+ AI-powered SEO tools consolidated into 3 premium workflows for keyword research, content generation, and plagiarism checking.",
    url: `${getSiteUrl()}/tools`,
  },
  twitter: {
    card: "summary_large_image",
    title: "All AI SEO Tools — 22+ Free Tools | Nextill AI",
    description: "Explore all 20+ AI-powered SEO tools consolidated into 3 premium workflows: Keyword Intelligence, Post Generator, and Plagiarism Checker.",
  },
  alternates: {
    canonical: `${getSiteUrl()}/tools`,
  },
}

export default function ToolsPage() {
  return <ToolsClient />
}
