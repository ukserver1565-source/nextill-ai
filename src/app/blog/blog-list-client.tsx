"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, ArrowRight, Loader2 } from "lucide-react"

interface BlogCategory {
  id: string
  name: string
  slug: string
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image_url: string | null
  published_at: string | null
  blog_categories?: BlogCategory | null
}

const PAGE_SIZE = 9

export function BlogListClient() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>("")

  const fetchPosts = useCallback(async (p: number, append = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: PAGE_SIZE.toString(),
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

  const _handleCategory = (catId: string) => {
    setActiveCategory(catId === activeCategory ? "" : catId)
  }

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchPosts(next, true)
  }

  const formatDate = (d: string | null) => {
    if (!d) return ""
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted text-lg">No blog posts published yet.</p>
        <p className="text-muted/60 text-sm mt-2">Check back soon for new content.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, i) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/blog/${post.slug}`} className="block h-full group">
              <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                {/* Featured Image */}
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
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <span className="text-3xl opacity-20">📝</span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Category */}
                  {post.blog_categories && (
                    <span className="inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 mb-3">
                      {post.blog_categories.name}
                    </span>
                  )}

                  <h2 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.published_at)}
                    </div>
                    <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read more <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>

      {/* Load More */}
      {posts.length < total && (
        <div className="text-center pt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white text-sm font-medium hover:bg-white/[0.06] transition-all disabled:opacity-50"
          >
            {loadingMore ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Load More Posts"
            )}
          </button>
        </div>
      )}
    </div>
  )
}
