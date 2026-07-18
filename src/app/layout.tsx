import type { Metadata } from "next"
import localFont from "next/font/local"
import { AuthProvider } from "@/lib/auth/AuthProvider"
import { ScrollToTop } from "@/components/layout/scroll-to-top"
import { NavigationProgressWrapper } from "@/components/layout/navigation-progress-wrapper"
import { getSiteUrl } from "@/lib/site-url"
import "./globals.css"

const geistSans = localFont({
  src: "../../public/fonts/geist-sans.woff2",
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = localFont({
  src: "../../public/fonts/geist-mono.woff2",
  variable: "--font-geist-mono",
  display: "swap",
})

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: {
    default: "Nextill AI — AI-Powered SEO & Content Platform",
    template: "%s | Nextill AI",
  },
  description:
    "Generate SEO-optimized content, keyword research, plagiarism checks, and domain intelligence with AI. The all-in-one platform for content creators and SEO professionals.",
  keywords: [
    "AI content generator",
    "SEO tools",
    "plagiarism checker",
    "keyword research",
    "content creation",
    "blog writer",
    "domain intelligence",
  ],
  authors: [{ name: "Nextill AI" }],
  creator: "Nextill AI",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Nextill AI",
    title: "Nextill AI — AI-Powered SEO & Content Platform",
    description:
      "Generate SEO-optimized content, keyword research, plagiarism checks, and domain intelligence with AI.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nextill AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nextill AI — AI-Powered SEO & Content Platform",
    description: "Generate SEO-optimized content with AI-powered tools.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        <NavigationProgressWrapper />
        <AuthProvider>
          <ScrollToTop />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
