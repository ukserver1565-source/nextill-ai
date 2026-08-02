import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/site-url"
import { supabaseAdmin } from "@/lib/supabase/admin"

const baseUrl = getSiteUrl()

// Blog post metadata for auto-seeding
const BLOG_POSTS = [
  { slug: "how-to-humanize-ai-content", title: "How to Humanize AI Content: Complete Guide to Pass AI Detection in 2026", excerpt: "Learn proven techniques to humanize AI-generated content and pass AI detection tools. Step-by-step guide with examples." },
  { slug: "ai-vs-human-writing-seo", title: "AI vs Human Writing: Which Is Better for SEO Rankings in 2026?", excerpt: "Comprehensive comparison of AI vs human writing for SEO. Data-driven analysis of rankings, engagement, and quality." },
  { slug: "top-10-ai-seo-tools", title: "Top 10 AI SEO Tools Every Content Creator Needs in 2026", excerpt: "Discover the best AI-powered SEO tools for keyword research, content optimization, and ranking improvement." },
  { slug: "mastering-keyword-research", title: "Mastering Keyword Research: A Step-by-Step Guide Using AI Intelligence", excerpt: "Complete keyword research guide using AI tools. Find high-value keywords, long-tail phrases, and content opportunities." },
  { slug: "plagiarism-detection-ensure-original-content", title: "Plagiarism Detection Explained: How to Ensure Your Content Is 100% Original", excerpt: "How plagiarism detection works, why originality matters for SEO, and tools to check content authenticity." },
]

async function ensureBlogPostsSeeded() {
  try {
    const { data: existing } = await supabaseAdmin
      .from("blog_posts")
      .select("slug")
      .in("slug", BLOG_POSTS.map(p => p.slug))

    const existingSlugs = new Set((existing || []).map((r: { slug: string }) => r.slug))
    const now = new Date().toISOString()

    for (const post of BLOG_POSTS) {
      if (!existingSlugs.has(post.slug)) {
        await supabaseAdmin.from("blog_posts").upsert({
          title: post.title,
          slug: post.slug,
          content: "",
          excerpt: post.excerpt,
          status: "published",
          published_at: now,
          updated_at: now,
          view_count: 0,
        }, { onConflict: "slug" })
      }
    }
  } catch {
    // Seed failed — sitemap will still work for non-blog pages
  }
}

async function getBlogPostUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    // Ensure blog posts exist in DB (for Google crawling)
    await ensureBlogPostsSeeded()

    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("slug, title, published_at, updated_at")
      .eq("status", "published")
      .not("published_at", "is", null)

    if (error) {
      console.error("[Sitemap] Blog posts query error:", error.message)
      return []
    }

    if (!data || data.length === 0) {
      console.warn("[Sitemap] No published blog posts found in database")
      return []
    }

    // Deduplicate by slug and normalized title (old seed runs created duplicate rows),
    // preferring canonical slugs when the same title exists under two slugs
    const CANONICAL_SLUGS = new Set([
      "how-to-humanize-ai-content",
      "ai-vs-human-writing-seo",
      "top-10-ai-seo-tools",
      "mastering-keyword-research",
      "plagiarism-detection-ensure-original-content",
    ])
    const rows = data as Array<{ slug: string; title?: string; published_at?: string; updated_at?: string }>
    const bySlug = new Map<string, typeof rows[number]>()
    for (const row of rows) {
      if (bySlug.has(row.slug)) continue
      bySlug.set(row.slug, row)
    }
    const byTitle = new Map<string, typeof rows[number]>()
    for (const row of bySlug.values()) {
      const t = (row.title || "").trim().toLowerCase()
      if (!t) { byTitle.set("__slug__" + row.slug, row); continue }
      const existing = byTitle.get(t)
      if (!existing) { byTitle.set(t, row); continue }
      if (CANONICAL_SLUGS.has(row.slug) && !CANONICAL_SLUGS.has(existing.slug)) {
        byTitle.set(t, row)
      }
    }
    const uniquePosts = Array.from(byTitle.values())

    const blogIndex: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
    ]

    const blogPosts: MetadataRoute.Sitemap = uniquePosts.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.published_at || new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

    console.log(`[Sitemap] Found ${blogPosts.length} blog posts`)
    return [...blogIndex, ...blogPosts]
  } catch (err) {
    console.error("[Sitemap] Failed to fetch blog posts:", err)
    return [
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
    ]
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Core public pages
  const corePages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/service-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  // Tool pages — public-facing tools that should be indexed
  const toolPages: MetadataRoute.Sitemap = [
    // Premium workflow tools (main landing pages)
    {
      url: `${baseUrl}/post-generator`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/plagiarism-checker`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/domain-overview`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // Individual AI tools
    {
      url: `${baseUrl}/ai-writer`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ai-humanizer`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ai-detector`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/article-rewriter`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/grammar-checker`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/summarizer`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/translator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/keyword-research`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/seo-title-generator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/meta-description-generator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/schema-generator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sitemap-generator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/robots-txt-generator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/content-brief`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/topical-map`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/website-audit`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/rank-tracker`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/backlink-checker`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/internal-link-generator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq-generator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ]

  // Blog pages (dynamic from database)
  const blogPages = await getBlogPostUrls()

  return [...corePages, ...toolPages, ...blogPages]
}
