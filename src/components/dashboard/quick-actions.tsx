"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { quickActions } from "@/lib/data"
import { cn } from "@/lib/utils"
import {
  FilePlus, UserCheck, RefreshCw, Languages, AlignLeft,
  SpellCheck, SearchCheck, FileSearch, HelpCircle, ListTree,
  Heading, FileText, Code,
} from "lucide-react"

const iconMap: Record<string, React.ElementType> = {
  FilePlus, UserCheck, RefreshCw, Languages, AlignLeft,
  SpellCheck, SearchCheck, FileSearch, HelpCircle, ListTree,
  Heading, FileText, Code,
}

const actionRoutes: Record<string, string> = {
  "Create Article": "/ai-writer",
  "Humanize": "/ai-humanizer",
  "Rewrite": "/paraphraser",
  "Translate": "/translator",
  "Summarize": "/summarizer",
  "Grammar Fix": "/grammar-checker",
  "Check AI": "/ai-detector",
  "Check Plagiarism": "/plagiarism-checker",
  "Generate FAQ": "/faq-generator",
  "Generate Outline": "/ai-writer",
  "Generate Title": "/seo-title-generator",
  "Generate Meta": "/meta-description-generator",
  "Generate Schema": "/schema-generator",
}

export function QuickActions() {
  const router = useRouter()

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Quick Actions</h2>
        <button className="text-xs text-primary hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2">
        {quickActions.map((action, i) => {
          const Icon = iconMap[action.icon]
          if (!Icon) return null
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              onClick={() => {
                const route = actionRoutes[action.label]
                if (route) router.push(route)
              }}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl glass-card hover:glass-card-hover transition-all duration-200 group cursor-pointer"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br group-hover:scale-110 transition-transform duration-200",
                action.color
              )}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-[11px] font-medium text-center leading-tight">
                {action.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
