import type { Metadata } from "next"
import { getActivePlans } from "@/lib/data/plans"
import { getSiteUrl } from "@/lib/site-url"
import HomePage from "@/components/home/home-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Nextill AI — AI-Powered SEO & Content Platform",
  description:
    "Generate SEO-optimized content, keyword research, plagiarism checks, and domain intelligence with AI. The all-in-one platform for content creators and SEO professionals.",
  openGraph: {
    title: "Nextill AI — AI-Powered SEO & Content Platform",
    description:
      "Generate SEO-optimized content, keyword research, plagiarism checks, and domain intelligence with AI.",
    url: getSiteUrl(),
  },
}

export default async function Page() {
  const plans = await getActivePlans()
  return <HomePage initialPlans={plans} />
}
