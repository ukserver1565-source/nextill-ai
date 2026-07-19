import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"
import PostGeneratorClient from "./post-generator-client"

export const metadata: Metadata = {
  title: "AI Post Generator",
  description:
    "Generate fully SEO-optimized blog posts with AI in one click. Includes SEO titles, meta descriptions, FAQ schema, internal links, and structured content.",
  openGraph: {
    title: "AI Post Generator — Nextill AI",
    description:
      "Generate SEO-optimized blog posts with AI — titles, meta, FAQ schema, and internal links included.",
    url: `${getSiteUrl()}/post-generator`,
  },
}

export default function PostGeneratorPage() {
  return <PostGeneratorClient />
}
