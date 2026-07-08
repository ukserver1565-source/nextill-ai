"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, MessageSquare, Zap, FileText, Search } from "lucide-react"
import { cn } from "@/lib/utils"

const quickOptions = [
  { icon: FileText, label: "Write Article" },
  { icon: Zap, label: "Optimize SEO" },
  { icon: Search, label: "Research Keywords" },
  { icon: MessageSquare, label: "Ask AI" },
]

export function FloatingAIButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="fixed bottom-24 right-6 z-50 flex flex-col gap-2"
            >
              {quickOptions.map((opt) => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.label}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg glass-card hover:glass-card-hover text-sm font-medium shadow-xl group"
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="w-4 h-4 text-primary-light" />
                    <span>{opt.label}</span>
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300",
          open
            ? "bg-danger hover:bg-danger/90"
            : "gradient-primary hover:brightness-110"
        )}
      >
        {open ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Sparkles className="w-5 h-5 text-white" />
        )}
      </button>
    </>
  )
}
