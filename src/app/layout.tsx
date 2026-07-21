import type { Metadata } from "next"
import localFont from "next/font/local"
import { AuthProvider } from "@/lib/auth/AuthProvider"
import { ThemeProvider } from "@/lib/theme/theme-provider"
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
    default: "Nextill AI — AI SEO Tools & Content Platform",
    template: "%s | Nextill AI",
  },
  description:
    "Nextill AI is the all-in-one AI SEO platform for content creators and SEO professionals. Generate SEO-optimized content, research keywords, check plagiarism, and analyze domains with AI-powered workflows.",
  keywords: [
    "AI SEO tools",
    "AI content generator",
    "SEO platform",
    "plagiarism checker",
    "keyword research",
    "content creation",
    "blog writer",
    "domain intelligence",
    "AI SEO platform",
    "Nextill AI",
  ],
  authors: [{ name: "Nextill AI" }],
  creator: "Nextill AI",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Nextill AI",
    title: "Nextill AI — AI SEO Tools & Content Platform",
    description:
      "Nextill AI — the all-in-one AI SEO platform. Generate SEO-optimized content, research keywords, check plagiarism, and analyze domains with AI.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Nextill AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nextill AI — AI SEO Tools & Content Platform",
    description: "Nextill AI — the all-in-one AI SEO platform for content creators.",
    images: ["/api/og"],
  },
  icons: {
    icon: "/favicon.svg",
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
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Nextill AI",
    "url": siteUrl,
    "logo": `${siteUrl}/og-image.png`,
    "description": "AI-powered SEO and content generation platform for keyword research, post generation, and plagiarism checking.",
    "sameAs": [],
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Nextill AI",
    "url": siteUrl,
    "description": "AI-powered SEO and content generation platform.",
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme — runs before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);document.documentElement.classList.add(t)}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        <NavigationProgressWrapper />
        <ThemeProvider>
          <AuthProvider>
            <ScrollToTop />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
