import type { Metadata } from "next"
import { getActivePlans } from "@/lib/data/plans"
import { getSiteUrl } from "@/lib/site-url"
import HomePage from "@/components/home/home-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Nextill AI — AI SEO Tools & Content Platform",
  description:
    "Nextill AI is the all-in-one AI SEO platform for content creators and SEO professionals. Generate SEO-optimized content, research keywords, check plagiarism, and analyze domains with AI-powered workflows.",
  openGraph: {
    title: "Nextill AI — AI SEO Tools & Content Platform",
    description:
      "Nextill AI — the all-in-one AI SEO platform. Generate SEO-optimized content, research keywords, check plagiarism, and analyze domains with AI.",
    url: getSiteUrl(),
  },
}

export default async function Page() {
  const plans = await getActivePlans()
  return <HomePage initialPlans={plans} />
}
