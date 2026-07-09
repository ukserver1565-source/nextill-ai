"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { PenSquare, Search, Shield, TrendingUp, Share2, FileSearch, ToggleLeft, Settings } from "lucide-react"

const sampleTools = [
  { id: 1, name: "AI Writer", slug: "ai_writer", description: "Generate high-quality content with AI", enabled: true },
  { id: 2, name: "Keyword Research", slug: "keyword_research", description: "Discover high-performing keywords", enabled: true },
  { id: 3, name: "Post Generator", slug: "post_generator", description: "Auto-generate blog posts", enabled: true },
  { id: 4, name: "Plagiarism Checker", slug: "plagiarism_checker", description: "Check content originality", enabled: false },
  { id: 5, name: "SEO Analyzer", slug: "seo_analyzer", description: "Analyze on-page SEO factors", enabled: false },
  { id: 6, name: "Rank Tracker", slug: "rank_tracker", description: "Track keyword rankings", enabled: false },
  { id: 7, name: "Backlink Analyzer", slug: "backlink_analyzer", description: "Analyze backlink profiles", enabled: false },
  { id: 8, name: "Website Audit", slug: "website_audit", description: "Full website SEO audit", enabled: false },
  { id: 9, name: "AI Humanizer", slug: "ai_humanizer", description: "Humanize AI-generated text", enabled: false },
]

const toolIcons: Record<string, any> = {
  ai_writer: PenSquare, keyword_research: Search, post_generator: PenSquare,
  plagiarism_checker: FileSearch, seo_analyzer: Search, rank_tracker: TrendingUp,
  backlink_analyzer: Share2, website_audit: Shield, ai_humanizer: PenSquare,
}

export default function ToolsPage() {
  const [tools, setTools] = useState(sampleTools)

  const toggleTool = (id: number) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tools</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Manage AI tools and their availability</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tools.map((tool, i) => {
          const Icon = toolIcons[tool.slug] || PenSquare
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tool.enabled ? "bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6]" : "bg-[#090B16] border border-white/[0.06]"}`}>
                  <Icon className={`w-5 h-5 ${tool.enabled ? "text-white" : "text-[#A7B0C0]"}`} />
                </div>
                <button
                  onClick={() => toggleTool(tool.id)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${tool.enabled ? "bg-[#6D5EF5]" : "bg-white/[0.06]"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow ${tool.enabled ? "translate-x-5.5" : "translate-x-0.5"}`} />
                </button>
              </div>
              <h3 className="text-sm font-semibold text-white">{tool.name}</h3>
              <p className="text-xs text-[#A7B0C0] mt-1">{tool.description}</p>
              <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className={`text-[10px] font-medium ${tool.enabled ? "text-[#22C55E]" : "text-[#A7B0C0]"}`}>
                  {tool.enabled ? "Enabled" : "Disabled"}
                </span>
                <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all">
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
