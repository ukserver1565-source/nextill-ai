import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Keyword Intelligence — Redirecting",
  robots: { index: false, follow: true },
}

// Server-side redirect: /keyword-intelligence → /domain-overview
// Googlebot follows server redirects but NOT client-side JS redirects
export default function KeywordIntelligenceRedirect() {
  redirect("/domain-overview")
}
