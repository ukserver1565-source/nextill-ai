import Link from "next/link"
import { Sparkles, ArrowRight, ChevronRight } from "lucide-react"
import { toolsRegistry } from "@/lib/tools/registry"
import { Button } from "@/components/ui/button"

const categoryColors: Record<string, string> = {
  content: "from-blue-500 to-purple-600",
  seo: "from-emerald-500 to-teal-600",
  research: "from-amber-500 to-orange-600",
  technical: "from-violet-500 to-indigo-600",
  writing: "from-pink-500 to-rose-600",
}

const categoryLabels: Record<string, string> = {
  content: "Content",
  seo: "SEO",
  research: "Research",
  technical: "Technical",
  writing: "Writing",
}

export default function ToolsPage() {
  const tools = toolsRegistry

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <Link href="/"><span className="text-base sm:text-lg font-bold">Nextill<span className="text-primary-light"> AI</span></span></Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login"><Button variant="ghost" size="sm" className="text-xs sm:text-sm">Sign In</Button></Link>
            <Link href="/signup"><Button variant="gradient" size="sm" className="text-xs sm:text-sm">Get Started</Button></Link>
          </div>
        </div>
      </header>

      <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <Link href="/" className="text-[10px] sm:text-xs text-muted hover:text-foreground transition-colors">Home</Link>
          <span className="text-[10px] sm:text-xs text-muted mx-1.5 sm:mx-2">/</span>
          <span className="text-[10px] sm:text-xs text-foreground font-medium">All Tools</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">All 21 AI Tools</h1>
        <p className="text-muted text-xs sm:text-sm mb-6 sm:mb-10">Use any tool instantly — no login required. Click to get started.</p>

        {(["content", "seo", "research", "technical", "writing"] as const).map((category) => {
          const catTools = tools.filter(t => t.category === category)
          if (!catTools.length) return null
          return (
            <div key={category} className="mb-6 sm:mb-10">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 capitalize">{categoryLabels[category]} Tools</h2>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {catTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={tool.route}
                    className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-2 sm:mb-3`}>
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-xs sm:text-sm group-hover:text-primary-light transition-colors">{tool.name}</h3>
                    <p className="text-[10px] sm:text-xs text-muted mt-1 line-clamp-2">{tool.description}</p>
                    <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
                      <span className="text-[9px] sm:text-[10px] text-muted">{tool.creditsCost} credits</span>
                      <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-primary-light">
                        Open <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </section>

      <footer className="border-t border-border py-6 sm:py-8 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto text-center text-[10px] sm:text-xs text-muted">
          &copy; {new Date().getFullYear()} Nextill AI. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
