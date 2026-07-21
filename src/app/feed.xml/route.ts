import { getSiteUrl } from "@/lib/site-url"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  const siteUrl = getSiteUrl()

  const { data: posts } = await supabaseAdmin
    .from("blog_posts")
    .select("title, slug, excerpt, published_at, updated_at")
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(50)

  const items = (posts || []).map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      ${post.excerpt ? `<description><![CDATA[${post.excerpt}]]></description>` : ""}
      <pubDate>${new Date(post.published_at || post.updated_at).toUTCString()}</pubDate>
    </item>`).join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nextill AI Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Insights on AI-powered SEO, content creation, and digital marketing strategies.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
