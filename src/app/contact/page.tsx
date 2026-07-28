import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"
import ContactClient from "./contact-client"

export const metadata: Metadata = {
  title: "Contact Us — Get AI SEO Support | Nextill AI",
  description:
    "Get in touch with the Nextill AI team. Questions about AI SEO tools, support, or partnerships? We respond within 48 hours.",
  keywords: ["contact Nextill AI", "AI SEO support", "customer service"],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us — Nextill AI Support",
    description: "Get AI SEO tool support, ask questions, or discuss partnerships.",
    url: `${getSiteUrl()}/contact`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us — Nextill AI",
    description: "Get AI SEO tool support. We respond within 48 hours.",
  },
}

export default function ContactPage() {
  return <ContactClient />
}
