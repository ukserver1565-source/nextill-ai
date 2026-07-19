import type { Metadata } from "next"
import { getSiteUrl } from "@/lib/site-url"
import ContactClient from "./contact-client"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Nextill AI team. Have a question, need support, or want to partner? Send us a message and we'll respond within 48 hours.",
  openGraph: {
    title: "Contact Us — Nextill AI",
    description: "Get in touch with the Nextill AI team for support, questions, or partnerships.",
    url: `${getSiteUrl()}/contact`,
  },
}

export default function ContactPage() {
  return <ContactClient />
}
