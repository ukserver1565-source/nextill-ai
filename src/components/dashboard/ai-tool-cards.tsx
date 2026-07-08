"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  PenSquare, UserCheck, SearchCheck, FileSearch,
  SpellCheck, RefreshCw, AlignLeft, Languages, HelpCircle,
  Star, Pin, ArrowRight, Clock,
} from "lucide-react"
import Link from "next/link"

const tools = [
  { icon: PenSquare, name: "AI Writer", slug: "/ai-writer", description: "Generate high-quality, SEO-optimized content with AI", color: "from-blue-500 to-purple-600", badge: "Popular", recent: "Created 2 hours ago", pinned: true },
  { icon: UserCheck, name: "AI Humanizer", slug: "/ai-humanizer", description: "Make AI-generated text indistinguishable from human writing", color: "from-emerald-500 to-teal-600", badge: "New", recent: "Used 30 min ago", pinned: true },
  { icon: SearchCheck, name: "AI Detector", slug: "/ai-detector", description: "Detect AI-generated content with advanced analysis", color: "from-amber-500 to-orange-600", badge: "Updated", recent: "Used 1 hour ago", pinned: false },
  { icon: FileSearch, name: "Plagiarism Checker", slug: "/plagiarism-checker", description: "Check content originality across billions of web pages", color: "from-red-500 to-pink-600", badge: undefined, recent: "Used yesterday", pinned: false },
  { icon: SpellCheck, name: "Grammar Checker", slug: "/grammar-checker", description: "Fix grammar, punctuation, and style issues instantly", color: "from-pink-500 to-rose-600", badge: undefined, recent: "Used 3 hours ago", pinned: false },
  { icon: RefreshCw, name: "Article Rewriter", slug: "/article-rewriter", description: "Rewrite content while maintaining original meaning", color: "from-orange-500 to-red-600", badge: undefined, recent: "Used 5 hours ago", pinned: false },
  { icon: AlignLeft, name: "Summarizer", slug: "/summarizer", description: "Condense long content into concise summaries", color: "from-cyan-500 to-blue-600", badge: undefined, recent: "Never used", pinned: false },
  { icon: Languages, name: "Translator", slug: "/translator", description: "Translate content across 50+ languages", color: "from-violet-500 to-indigo-600", badge: undefined, recent: "Used 2 days ago", pinned: false },
  { icon: HelpCircle, name: "FAQ Generator", slug: "/faq-generator", description: "Generate FAQ sections with schema markup", color: "from-lime-500 to-green-600", badge: "New", recent: "Never used", pinned: false },
]

export function AIToolCards() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight">AI Tools</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {tools.map((tool, i) => {
          const Icon = tool.icon
          return (
            <Link key={tool.name} href={tool.slug}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="glass-card rounded-xl p-4 hover:glass-card-hover transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
                    tool.color
                  )}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    {tool.pinned && (
                      <Pin className="w-3.5 h-3.5 text-primary fill-primary/30" />
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-semibold mb-1">{tool.name}</h3>
                <p className="text-[11px] text-muted leading-relaxed mb-3 line-clamp-2">
                  {tool.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {tool.badge && (
                      <Badge variant="info" size="sm">{tool.badge}</Badge>
                    )}
                    <div className="flex items-center gap-1 text-[10px] text-muted">
                      <Clock className="w-3 h-3" />
                      {tool.recent}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm" className="rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
