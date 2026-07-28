"use client"

import { useState, useEffect } from "react"
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
  const [html, setHtml] = useState("")

  useEffect(() => {
    if (!content) return
    // marked.parse() returns Promise in newer versions
    const result = marked.parse(content)
    if (result instanceof Promise) {
      result.then(raw => setHtml(sanitizeHtml(raw))).catch(() => setHtml(sanitizeHtml(content)))
    } else {
      setHtml(sanitizeHtml(result))
    }
  }, [content])

  if (!content) {
    return (
      <p className="text-muted italic">This post has no content yet.</p>
    )
  }

  return (
    <div
      className="prose prose-invert max-w-none
        prose-headings:text-foreground prose-headings:font-bold
        prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-10
        prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border
        prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-8
        prose-p:text-muted prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-foreground
        prose-li:text-muted prose-li:mb-2
        prose-ul:list-disc prose-ul:mb-6
        prose-ol:list-decimal prose-ol:mb-6
        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted/80 prose-blockquote:my-6
        prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-background/80 prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:p-4
        prose-img:rounded-xl prose-img:max-w-full prose-img:mx-auto prose-img:my-8
        prose-hr:border-border prose-hr:my-8
        prose-table:w-full prose-table:border-collapse prose-table:my-6
        prose-th:text-left prose-th:p-3 prose-th:border prose-th:border-border prose-th:bg-card prose-th:text-foreground prose-th:text-sm prose-th:font-semibold
        prose-td:p-3 prose-td:border prose-td:border-border prose-td:text-muted prose-td:text-sm"
      dangerouslySetInnerHTML={{ __html: html || sanitizeHtml(content) }}
    />
  )
}
