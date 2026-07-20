"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Calendar, Loader2 } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image_url: string | null
  published_at: string | null
  blog_categories?: { id: string; name: string } | null
}

export function LatestBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/public/blog?limit=3")
      .then(r => r.ok ? r.json() : { data: [] })
      .then(json => setPosts(json.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    )
  }

  if (posts.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {posts.map((post, i) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <Link href={`/blog/${post.slug}`} className="block group h-full">
            <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
              {post.featured_image_url ? (
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <span className="text-2xl opacity-20">📝</span>
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                {post.blog_categories && (
                  <span className="inline-flex items-center self-start px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 mb-2">
                    {post.blog_categories.name}
                  </span>
                )}
                <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-xs text-muted line-clamp-2 mb-3 flex-1">{post.excerpt}</p>
                )}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                  <span className="text-[10px] text-muted flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}
                  </span>
                  <span className="text-[10px] text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
