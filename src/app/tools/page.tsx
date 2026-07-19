import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"
import ToolsClient from "./tools-client"

export const metadata: Metadata = {
  title: "All Tools",
  description:
    "Explore all 20+ AI-powered SEO tools consolidated into 3 premium workflows: Keyword Intelligence, Post Generator, and Plagiarism Checker.",
  openGraph: {
    title: "All Tools — Nextill AI",
    description:
      "20+ AI-powered SEO tools consolidated into 3 premium workflows for keyword research, content generation, and plagiarism checking.",
    url: `${getSiteUrl()}/tools`,
  },
}

export default function ToolsPage() {
  return <ToolsClient />
}
