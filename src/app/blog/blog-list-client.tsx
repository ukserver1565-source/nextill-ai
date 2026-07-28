"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, ArrowRight, Clock, Eye, Loader2, TrendingUp, BookOpen, Search, Zap } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image_url: string | null
  published_at: string | null
  view_count?: number
  category_id?: string | null
}

const CATEGORIES = [
  { id: "", label: "All Posts", icon: BookOpen },
  { id: "ai-seo", label: "AI & SEO", icon: Zap },
  { id: "content", label: "Content Strategy", icon: TrendingUp },
  { id: "tools", label: "Tools & Reviews", icon: Search },
]

const CATEGORY_MAP: Record<string, string> = {
  "ai-seo": "AI & SEO",
  "content": "Content Strategy",
  "tools": "Tools & Reviews",
}

function getReadTime(content: string | null): string {
  if (!content) return "5 min read"
  const words = content.split(/\s+/).length
  const mins = Math.max(1, Math.ceil(words / 200))
  return `${mins} min read`
}

function estimateCategory(title: string): string {
  const t = title.toLowerCase()
  if (t.includes("ai") || t.includes("seo") || t.includes("keyword") || t.includes("rank")) return "ai-seo"
  if (t.includes("content") || t.includes("writing") || t.includes("humanize") || t.includes("blog")) return "content"
  if (t.includes("tool") || t.includes("plagiarism") || t.includes("checker")) return "tools"
  return "ai-seo"
}

export function BlogListClient() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeCategory, setActiveCategory] = useState("")

  const fetchPosts = useCallback(async (p: number, append = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: "12",
      })
      if (activeCategory) params.set("category_id", activeCategory)
      const res = await fetch(`/api/public/blog?${params}`)
      if (!res.ok) throw new Error("Failed to load")
      const json = await res.json()
      if (append) {
        setPosts(prev => [...prev, ...(json.data || [])])
      } else {
        setPosts(json.data || [])
      }
      setTotal(json.total || 0)
    } catch {
      // silent
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [activeCategory])

  useEffect(() => {
    setPage(1)
    fetchPosts(1)
  }, [fetchPosts])

  const formatDate = (d: string | null) => {
    if (!d) return ""
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-sm text-muted">Loading articles...</p>
      </div>
    )
  }

  const featuredPost = posts[0]
  const remainingPosts = posts.slice(1)

  return (
    <div className="space-y-12">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-card/60 border border-border text-muted hover:text-foreground hover:border-primary/30 hover:bg-card/80"
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          )
        })}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-primary/50" />
          </div>
          <h3 className="text-xl font-bold mb-2">No articles yet</h3>
          <p className="text-muted">We&apos;re working on new content. Check back soon!</p>
        </div>
      ) : (
        <>
          {/* Featured Post (First Post - Large Card) */}
          {featuredPost && !activeCategory && (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link href={`/blog/${featuredPost.slug}`} className="block group">
                <div className="relative rounded-3xl overflow-hidden bg-card/60 border border-border/50 hover:border-primary/30 transition-all duration-500">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Image */}
                    <div className="relative h-64 md:h-full min-h-[300px] overflow-hidden">
                      {featuredPost.featured_image_url ? (
                        <img
                          src={featuredPost.featured_image_url}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/15 to-primary/10 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-primary/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r" />
                      {/* Featured Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg">
                          <TrendingUp className="w-3 h-3" />
                          Featured
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-10 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          {CATEGORY_MAP[estimateCategory(featuredPost.title)] || "AI & SEO"}
                        </span>
                        <span className="text-xs text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getReadTime(featuredPost.title)}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight">
                        {featuredPost.title}
                      </h2>

                      {featuredPost.excerpt && (
                        <p className="text-muted leading-relaxed mb-6 line-clamp-3">
                          {featuredPost.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(featuredPost.published_at)}
                          </span>
                        </div>
                        <span className="text-sm text-primary font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                          Read Article <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          )}

          {/* Posts Grid */}
          {remainingPosts.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-xl font-bold">
                  {activeCategory ? CATEGORIES.find(c => c.id === activeCategory)?.label : "Latest Articles"}
                </h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted">{total} articles</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingPosts.map((post, i) => {
                  const cat = estimateCategory(post.title)
                  return (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link href={`/blog/${post.slug}`} className="block h-full group">
                        <div className="h-full flex flex-col rounded-2xl bg-card/60 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                          {/* Image */}
                          {post.featured_image_url ? (
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={post.featured_image_url}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                          ) : (
                            <div className="h-48 bg-gradient-to-br from-primary/10 via-secondary/8 to-primary/5 flex items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(109,94,245,0.08),transparent_60%)]" />
                              <BookOpen className="w-12 h-12 text-primary/20" />
                            </div>
                          )}

                          <div className="p-6 flex flex-col flex-1">
                            {/* Category + Read Time */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                {CATEGORY_MAP[cat] || "AI & SEO"}
                              </span>
                              <span className="text-[10px] text-muted flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {getReadTime(post.title)}
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                              {post.title}
                            </h3>

                            {post.excerpt && (
                              <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-2 flex-1">
                                {post.excerpt}
                              </p>
                            )}

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                              <span className="text-xs text-muted flex items-center gap-1.5">
                                <Calendar className="w-3 h-3" />
                                {formatDate(post.published_at)}
                              </span>
                              <span className="text-xs text-primary font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  )
                })}
              </div>
            </div>
          )}

          {/* Load More */}
          {posts.length < total && (
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  const next = page + 1
                  setPage(next)
                  fetchPosts(next, true)
                }}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-border bg-card/50 text-foreground text-sm font-medium hover:bg-card/80 hover:border-primary/30 transition-all disabled:opacity-50"
              >
                {loadingMore ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Load More Articles
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
