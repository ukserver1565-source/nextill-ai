"use client"

import { useMemo } from "react"
import { marked } from "marked"
import { sanitizeHtml } from "@/lib/security/html-sanitizer"

interface BlogPostContentProps {
  content: string
}

// Configure marked for safe, clean output
marked.setOptions({
  breaks: true,
  gfm: true,
})

export function BlogPostContent({ content }: BlogPostContentProps) {
  if (!content) {
    return (
      <p className="text-muted italic">This post has no content yet.</p>
    )
  }

  // Convert markdown to HTML, then sanitize
  const htmlContent = useMemo(() => {
    try {
      const rawHtml = typeof marked.parse === "function"
        ? marked.parse(content) as string
        : content
      return sanitizeHtml(rawHtml)
    } catch {
      // If markdown parsing fails, try rendering as-is (might already be HTML)
      return sanitizeHtml(content)
    }
  }, [content])

  return (
    <div
      className="prose prose-invert max-w-none prose-headings:text-foreground prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-muted prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-li:text-muted prose-ul:list-disc prose-ol:list-decimal prose-blockquote:border-primary/30 prose-blockquote:text-muted prose-blockquote:italic prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-background prose-pre:border prose-img:rounded-xl prose-img:max-w-full prose-img:mx-auto prose-hr:border-border"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
