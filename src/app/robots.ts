import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/site-url"

const baseUrl = getSiteUrl()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/zain-nextill-ansari/", "/api/", "/login", "/signup", "/checkout", "/reset-password"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
