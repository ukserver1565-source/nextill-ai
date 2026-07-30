import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/site-url"

const baseUrl = getSiteUrl()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Auth & account pages
          "/login",
          "/signup",
          "/reset-password",
          "/checkout",
          // Dashboard (authenticated area)
          "/dashboard/",
          // Admin panel
          "/zain-nextill-ansari/",
          // API routes
          "/api/",
          // Static assets (should not be indexed)
          "/_next/",
          "/fonts/",
          // Utility/error pages
          "/unauthorized",
          "/maintenance",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: "Google-Extended",
        disallow: "/",
      },
      {
        userAgent: "anthropic-ai",
        disallow: "/",
      },
      {
        userAgent: "ClaudeBot",
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
