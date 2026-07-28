import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { BackButton } from "@/components/shared/back-button"
import { getSiteUrl } from "@/lib/site-url"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { BlogPostContent } from "./blog-post-content"
import { TableOfContents } from "./table-of-contents"

interface BlogPostData {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  featured_image_url: string | null
  published_at: string | null
  updated_at: string
  seo_title: string | null
  meta_description: string | null
  blog_categories?: { id: string; name: string; slug: string } | null
}

async function getPost(slug: string): Promise<BlogPostData | null> {
  const { data, error } = await supabaseAdmin
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error || !data) return null

  // Increment view count
  await supabaseAdmin
    .from("blog_posts")
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq("id", data.id)

  return data as BlogPostData
}

async function getRelatedPosts(categoryId: string, excludeId: string) {
  if (!categoryId) return []
  const { data } = await supabaseAdmin
    .from("blog_posts")
    .select("id, title, slug, excerpt, featured_image_url, published_at")
    .eq("status", "published")
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(3)
  return (data || []) as unknown as BlogPostData[]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: "Post Not Found" }

  const siteUrl = getSiteUrl()
  const title = post.seo_title || post.title
  const description = post.meta_description || post.excerpt || ""
  const ogImage = post.featured_image_url || `${siteUrl}/api/og`

  return {
    title,
    description,
    keywords: [post.seo_title || "", post.title, "AI SEO", "content marketing"].filter(Boolean),
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const relatedPosts = await getRelatedPosts(
    post.blog_categories?.id || "",
    post.id
  )

  const siteUrl = getSiteUrl()
  const publishDate = post.published_at || post.updated_at

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.meta_description || "",
    image: post.featured_image_url || `${siteUrl}/api/og`,
    datePublished: publishDate,
    dateModified: post.updated_at,
    author: {
      "@type": "Organization",
      name: "Nextill AI",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Nextill AI",
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`,
    },
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <BackButton fallback="/blog" />
          </div>

          {/* Hero Image */}
          {post.featured_image_url && (
            <div className="relative rounded-3xl overflow-hidden mb-10 aspect-[16/9]">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          )}

          {/* Meta Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Article
            </span>
            <time className="text-xs text-muted flex items-center gap-1.5" dateTime={publishDate}>
              <span className="w-1 h-1 rounded-full bg-muted" />
              {new Date(publishDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg text-muted leading-relaxed mb-10 max-w-3xl border-l-2 border-primary/30 pl-6">
              {post.excerpt}
            </p>
          )}

          {/* Table of Contents */}
          <TableOfContents content={post.content || ""} />

          {/* Content */}
          <div className="rounded-3xl bg-card/60 border border-border/50 p-6 sm:p-10 lg:p-14 mb-16">
            <BlogPostContent content={post.content || ""} />
          </div>

          {/* Author Box */}
          <div className="rounded-2xl bg-card/60 border border-border/50 p-6 sm:p-8 mb-16">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border-2 border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-primary">AP</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground mb-1">AdultPulse AI Team</h3>
                <p className="text-xs text-primary mb-3">Content & SEO Experts</p>
                <p className="text-sm text-muted leading-relaxed">
                  Our team combines years of SEO expertise with cutting-edge AI tools to create
                  data-driven content that ranks. We test every strategy we write about on our own sites first.
                </p>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-8">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map(related => (
                  <Link
                    key={related.id}
                    href={`/blog/${related.slug}`}
                    className="liquid-glass-card rounded-2xl overflow-hidden group hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                  >
                    {related.featured_image_url ? (
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={related.featured_image_url}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary/10" />
                    )}
                    <div className="p-5">
                      {related.blog_categories && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 mb-2">
                          {related.blog_categories.name}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {related.title}
                      </h3>
                      {related.excerpt && (
                        <p className="text-xs text-muted line-clamp-2">{related.excerpt}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <PublicFooter />
    </div>
  )
}
