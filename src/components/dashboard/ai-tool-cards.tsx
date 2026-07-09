"use client"

import { motion } from "framer-motion"
import { Search, FileText, FileSearch, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

const tools = [
  {
    icon: Search,
    name: "Keyword Intelligence",
    slug: "/keyword-intelligence",
    description: "Discover high-value keywords with volume, difficulty & SERP analysis",
    color: "from-violet-500 to-indigo-600",
    badge: "Popular",
    credits: "2 credits",
  },
  {
    icon: FileText,
    name: "Post Generator",
    slug: "/post-generator",
    description: "Generate full SEO-optimized blog posts from a topic in one click",
    color: "from-blue-500 to-purple-600",
    badge: "New",
    credits: "5 credits",
  },
  {
    icon: FileSearch,
    name: "Plagiarism Checker",
    slug: "/plagiarism-checker",
    description: "Check content originality against billions of indexed web pages",
    color: "from-red-500 to-pink-600",
    badge: undefined,
    credits: "3 credits",
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" },
  }),
}

export function AIToolCards() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-white">AI Workflows</h2>
        <span className="text-xs text-[#A7B0C0]">3 available</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, i) => {
          const Icon = tool.icon
          return (
            <Link key={tool.name} href={tool.slug}>
              <motion.div
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 hover:border-[#6D5EF5]/30 hover:bg-[#151C2E]/90 transition-all duration-300 group cursor-pointer h-full flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${tool.color} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-[#6D5EF5]/10 group-hover:border-[#6D5EF5]/20">
                    <ArrowRight className="w-4 h-4 text-[#6D5EF5]" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{tool.name}</h3>
                <p className="text-xs text-[#A7B0C0] leading-relaxed mb-4 flex-1">
                  {tool.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    {tool.badge && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#4CC9F0]/10 text-[#4CC9F0] border border-[#4CC9F0]/20">
                        {tool.badge}
                      </span>
                    )}
                    <span className="text-[10px] text-[#A7B0C0]">{tool.credits}</span>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-[#6D5EF5]/40" />
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
