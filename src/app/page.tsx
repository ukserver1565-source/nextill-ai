import type { Metadata } from "next"
import { getActivePlans } from "@/lib/data/plans"
import { getSiteUrl } from "@/lib/site-url"
import HomePage from "@/components/home/home-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "SEO with AI — Free AI SEO Tools, Content Writer & Keyword Research | Nextill AI",
  description:
    "Rank #1 with AI-powered SEO tools. Free AI writer, keyword research, plagiarism checker, domain analysis & content optimization. 22+ tools trusted by 10,000+ creators. Start free today.",
  keywords: [
    "SEO with AI", "AI SEO tools", "AI content writer free", "keyword research tool",
    "plagiarism checker free", "AI humanizer", "SEO tools online", "content optimization",
    "AI blog writer", "rank tracker free", "website audit tool", "AI writing assistant",
    "SEO software", "content marketing tools", "AI-powered SEO", "free SEO tools",
  ],
  openGraph: {
    title: "SEO with AI — Free AI SEO Tools & Content Platform | Nextill AI",
    description:
      "22+ AI-powered SEO tools. Free AI writer, keyword research, plagiarism checker, humanizer & more. Start ranking higher today.",
    url: getSiteUrl(),
    type: "website",
    siteName: "Nextill AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO with AI — Free AI SEO Tools | Nextill AI",
    description: "22+ AI-powered SEO tools. Free to start. AI writer, keyword research, plagiarism checker & more.",
  },
}

export default async function Page() {
  const plans = await getActivePlans()

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Nextill AI — SEO with AI Tools",
    "operatingSystem": "Web",
    "applicationCategory": "BusinessApplication",
    "description": "All-in-one AI SEO platform with 22+ tools for content creation, keyword research, plagiarism checking, and domain analysis.",
    "url": getSiteUrl(),
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free tier available"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150",
      "bestRating": "5"
    },
    "featureList": [
      "AI Content Writer",
      "AI Humanizer",
      "AI Detection Checker",
      "Plagiarism Checker",
      "Keyword Research",
      "Domain Intelligence",
      "Post Generator",
      "Website Audit",
      "Rank Tracker",
      "Backlink Checker"
    ]
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is SEO with AI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SEO with AI means using artificial intelligence tools to improve search engine rankings. AI can help with keyword research, content creation, plagiarism checking, and website optimization — making SEO faster and more effective."
        }
      },
      {
        "@type": "Question",
        "name": "Are these AI SEO tools free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Nextill AI offers a free tier with daily usage limits. You can use the AI writer, keyword research, plagiarism checker, and other tools without paying. Premium plans unlock higher limits and advanced features."
        }
      },
      {
        "@type": "Question",
        "name": "How many AI SEO tools does Nextill AI offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nextill AI offers 22+ AI-powered tools including AI Writer, Humanizer, Detector, Plagiarism Checker, Keyword Research, Domain Intelligence, Post Generator, Website Audit, Rank Tracker, and more."
        }
      },
      {
        "@type": "Question",
        "name": "Can AI help me rank #1 on Google?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AI tools can significantly speed up your SEO workflow — from keyword research to content creation. While no tool guarantees #1 ranking, combining AI efficiency with quality content and proper SEO strategy gives you the best chance."
        }
      },
      {
        "@type": "Question",
        "name": "What is an AI content writer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An AI content writer uses artificial intelligence to generate SEO-optimized articles, blog posts, and web content. Nextill AI's writer creates content with proper headings, keywords, and structure to help you rank higher."
        }
      }
    ]
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HomePage initialPlans={plans} />
    </>
  )
}
