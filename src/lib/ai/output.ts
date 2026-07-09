import type { ParsedArticle } from "./parser"
import { formatArticleMarkdown, formatArticleTXT } from "./formatter"

export type DownloadFormat = "txt" | "md" | "docx" | "pdf"

export function getDownloadContent(article: ParsedArticle, format: DownloadFormat): { content: string; mimeType: string; filename: string } {
  const baseFilename = article.slug || "article"
  const cleanSlug = baseFilename.replace(/[^a-z0-9-]/gi, "-").toLowerCase()

  switch (format) {
    case "txt":
      return {
        content: formatArticleTXT(article),
        mimeType: "text/plain",
        filename: `${cleanSlug}.txt`,
      }
    case "md":
      return {
        content: formatArticleMarkdown(article),
        mimeType: "text/markdown",
        filename: `${cleanSlug}.md`,
      }
    case "docx":
      return {
        content: formatArticleMarkdown(article),
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename: `${cleanSlug}.docx`,
      }
    case "pdf":
      return {
        content: formatArticleTXT(article),
        mimeType: "application/pdf",
        filename: `${cleanSlug}.pdf`,
      }
  }
}

export function triggerDownload(article: ParsedArticle, format: DownloadFormat): void {
  const { content, mimeType, filename } = getDownloadContent(article, format)
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined") return Promise.resolve(false)
  return navigator.clipboard.writeText(text).then(() => true).catch(() => false)
}
