"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Command, ArrowRight, Clock, FileText, Settings, User, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

const commands = [
  { icon: FileText, label: "Create new article", shortcut: "Ctrl + N", category: "Content" },
  { icon: FileText, label: "Open AI Writer", category: "Content" },
  { icon: FileText, label: "Humanize text", shortcut: "Ctrl + Shift + H", category: "Content" },
  { icon: FileText, label: "AI Detector", shortcut: "Ctrl + Shift + D", category: "Content" },
  { icon: Settings, label: "Open Settings", category: "System" },
  { icon: User, label: "View Profile", category: "System" },
  { icon: HelpCircle, label: "Help & Support", category: "System" },
  { icon: FileText, label: "Open Projects", category: "Navigation" },
  { icon: FileText, label: "View Analytics", category: "Navigation" },
  { icon: FileText, label: "Keyword Research", category: "SEO" },
  { icon: FileText, label: "Schema Generator", category: "SEO" },
  { icon: FileText, label: "Website Audit", category: "SEO" },
]

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query
    ? commands.filter((cmd) =>
        cmd.label.toLowerCase().includes(query.toLowerCase())
      )
    : commands

  useEffect(() => {
    if (open) {
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      onClose()
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="glass-card rounded-xl overflow-hidden shadow-2xl border-border/20">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="w-4 h-4 text-muted shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search commands, tools, projects..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-sm placeholder:text-muted outline-none"
                />
                <kbd className="text-[10px] text-muted px-1.5 py-0.5 rounded border border-border bg-card">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[300px] overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted">
                    No results found for "{query}"
                  </div>
                ) : (
                  filtered.map((cmd, i) => {
                    const Icon = cmd.icon
                    return (
                      <button
                        key={cmd.label}
                        onClick={() => onClose()}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                          i === selectedIndex
                            ? "bg-primary/10 text-primary-light"
                            : "hover:bg-card text-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4 text-muted shrink-0" />
                        <span className="text-sm flex-1">{cmd.label}</span>
                        {cmd.shortcut && (
                          <kbd className="text-[10px] text-muted px-1.5 py-0.5 rounded border border-border bg-background">
                            {cmd.shortcut}
                          </kbd>
                        )}
                        <ArrowRight className="w-3 h-3 text-muted" />
                      </button>
                    )
                  })
                )}
              </div>

              <div className="flex items-center gap-3 px-4 py-2 border-t border-border text-[10px] text-muted">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded border border-border">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded border border-border">↵</kbd>
                  Open
                </span>
                <span className="flex items-center gap-1 ml-auto">
                  <kbd className="px-1 py-0.5 rounded border border-border">ESC</kbd>
                  Close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
