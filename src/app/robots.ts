import type { MetadataRoute } from "next"

const baseUrl = "https://nextill.ai"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/admin/", "/api/", "/login", "/signup"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
