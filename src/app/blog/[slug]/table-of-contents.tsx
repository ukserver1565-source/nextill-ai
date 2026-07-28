"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, List } from "lucide-react"

interface TocItem {
  id: string
  text: string
  level: number
}

export function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [isOpen, setIsOpen] = useState(true)
  const [activeId, setActiveId] = useState("")

  useEffect(() => {
    // Extract headings from rendered HTML after mount
    const timer = setTimeout(() => {
      const article = document.querySelector(".prose")
      if (!article) return

      const headingEls = article.querySelectorAll("h2, h3")
      const items: TocItem[] = []

      headingEls.forEach((el, i) => {
        const id = `heading-${i}`
        el.id = id
        items.push({
          id,
          text: el.textContent || "",
          level: parseInt(el.tagName.charAt(1)),
        })
      })

      setHeadings(items)
    }, 500)

    return () => clearTimeout(timer)
  }, [content])

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <div className="rounded-2xl bg-card/60 border border-border/50 overflow-hidden mb-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-card/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <List className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Table of Contents</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted" />
        )}
      </button>

      {isOpen && (
        <div className="px-5 pb-5 border-t border-border/50">
          <nav className="pt-4 space-y-1">
            {headings.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
                  setActiveId(item.id)
                }}
                className={`block text-sm py-1.5 transition-all duration-200 hover:text-primary ${
                  item.level === 3 ? "pl-4" : "pl-0"
                } ${
                  activeId === item.id
                    ? "text-primary font-medium"
                    : "text-muted"
                }`}
              >
                {item.text}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
