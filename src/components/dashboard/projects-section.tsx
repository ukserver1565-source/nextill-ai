"use client"

import { motion } from "framer-motion"
import { projectList } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  ExternalLink, BarChart3, Globe, MoreHorizontal,
} from "lucide-react"

export function ProjectsSection() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Projects</h2>
        <Button variant="outline" size="sm" className="rounded-lg">
          View All Projects
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {projectList.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          >
            <div className="glass-card rounded-xl p-5 hover:glass-card-hover transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm">
                    {project.logo}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{project.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-muted">
                      <Globe className="w-3 h-3" />
                      {project.domain}
                    </div>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-colors opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-[10px] text-muted mb-0.5">Articles</p>
                  <p className="text-sm font-semibold">{project.articles}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted mb-0.5">Keywords</p>
                  <p className="text-sm font-semibold">{project.keywords.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted mb-0.5">Traffic</p>
                  <p className="text-sm font-semibold">{project.traffic}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted mb-0.5">SEO Score</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{project.seoScore}</span>
                    <Progress
                      value={project.seoScore}
                      variant={project.seoScore >= 80 ? "success" : project.seoScore >= 60 ? "default" : "warning"}
                      size="sm"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-[10px] text-muted">
                  Updated {project.lastUpdated}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" className="rounded-md">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="rounded-md">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
