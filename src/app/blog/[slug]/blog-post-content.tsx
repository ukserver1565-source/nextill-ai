"use client"

interface BlogPostContentProps {
  content: string
}

export function BlogPostContent({ content }: BlogPostContentProps) {
  if (!content) {
    return (
      <p className="text-muted italic">This post has no content yet.</p>
    )
  }

  return (
    <div
      className="prose prose-invert prose-headings:text-white prose-p:text-[#A7B0C0] prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-img:rounded-xl prose-img:max-w-full prose-blockquote:border-primary/30 prose-blockquote:text-muted"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
