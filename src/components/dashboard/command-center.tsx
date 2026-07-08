"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  FileText, UserCheck, SearchCheck, Zap, Search,
  HelpCircle, Heading, FileText as FileTextIcon, GitBranch,
  Upload, Mic, Sparkles, ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const quickTools = [
  { icon: FileText, label: "Write Article", color: "from-blue-500 to-purple-600" },
  { icon: UserCheck, label: "Humanize", color: "from-emerald-500 to-teal-600" },
  { icon: SearchCheck, label: "Detect AI", color: "from-amber-500 to-orange-600" },
  { icon: Zap, label: "SEO Optimize", color: "from-violet-500 to-indigo-600" },
  { icon: Search, label: "Keyword Research", color: "from-cyan-500 to-blue-600" },
  { icon: HelpCircle, label: "Create FAQ", color: "from-pink-500 to-rose-600" },
  { icon: Heading, label: "Generate Meta", color: "from-teal-500 to-emerald-600" },
  { icon: GitBranch, label: "Build Topic Cluster", color: "from-indigo-500 to-blue-600" },
]

export function CommandCenter() {
  const [prompt, setPrompt] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const handleGenerate = () => {
    setError(null)
    if (!prompt.trim()) {
      setError("Please enter a prompt first.")
      return
    }
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setResult(`Result for: "${prompt.trim()}"\n\nThis is a placeholder result. AI generation will be connected later.`)
    }, 800)
  }

  return (
    <section className="glass-card rounded-xl p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary-light font-medium mb-3">
            <Sparkles className="w-3 h-3" />
            AI Command Center
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gradient mb-1">
            What would you like to create today?
          </h1>
          <p className="text-sm text-muted">
            Describe what you want Nextill AI to do...
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <textarea
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); setError(null) }}
            placeholder="Write a comprehensive guide about SEO best practices for 2026..."
            className="w-full h-32 lg:h-40 p-5 rounded-xl bg-card border border-border text-sm placeholder:text-muted resize-none outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200"
          />
          {error && (
            <p className="text-xs text-danger mt-2">{error}</p>
          )}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-background transition-colors">
              <Upload className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-background transition-colors">
              <Mic className="w-4 h-4" />
            </button>
            <Button variant="gradient" size="sm" className="gap-1.5 rounded-lg" onClick={handleGenerate} disabled={generating}>
              {generating ? "Generating..." : "Generate"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl bg-card border border-border"
          >
            <pre className="text-sm whitespace-pre-wrap font-sans">{result}</pre>
          </motion.div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {quickTools.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.label}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
                  "bg-card border border-border hover:border-primary/30 hover:bg-card-hover transition-all",
                  "group"
                )}
              >
                <Icon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                {tool.label}
              </button>
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}
