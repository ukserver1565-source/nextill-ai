"use client"

import { useMemo } from "react"
import { marked } from "marked"
import { sanitizeHtml } from "@/lib/security/html-sanitizer"

interface BlogPostContentProps {
  content: string
}

marked.setOptions({
  breaks: true,
  gfm: true,
})

export function BlogPostContent({ content }: BlogPostContentProps) {
  const htmlContent = useMemo(() => {
    if (!content) return ""
    try {
      const rawHtml = marked.parse(content) as string
      return sanitizeHtml(rawHtml)
    } catch (err) {
      console.error("[BlogPostContent] markdown parse error:", err)
      return sanitizeHtml(content)
    }
  }, [content])

  if (!content) {
    return <p className="text-muted italic">This post has no content yet.</p>
  }

  return (
    <div
      className="blog-content prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
