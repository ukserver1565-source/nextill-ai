"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { MiniChart } from "@/components/charts/mini-chart"
import { Tooltip } from "@/components/ui/tooltip"
import { trendData } from "@/lib/data"
import {
  FileText, PenLine, Sparkles, ShieldCheck, FolderKanban,
  TrendingUp, Search, Share2, Globe, Activity,
} from "lucide-react"

const metrics = [
  {
    icon: FileText,
    label: "Articles Generated",
    value: "1,247",
    trend: "+12.5%",
    up: true,
    chartColor: "#6366f1",
    tooltip: "Total articles created this month",
  },
  {
    icon: PenLine,
    label: "Words Written",
    value: "284.5K",
    trend: "+8.3%",
    up: true,
    chartColor: "#06b6d4",
    tooltip: "Total words generated across all projects",
  },
  {
    icon: Sparkles,
    label: "AI Credits",
    value: "2,847",
    trend: "-4.2%",
    up: false,
    chartColor: "#f59e0b",
    tooltip: "Remaining AI processing credits",
  },
  {
    icon: ShieldCheck,
    label: "SEO Health",
    value: "86",
    trend: "+3.1%",
    up: true,
    chartColor: "#10b981",
    tooltip: "Average SEO health score across projects",
  },
  {
    icon: FolderKanban,
    label: "Projects",
    value: "12",
    trend: "+2",
    up: true,
    chartColor: "#8b5cf6",
    tooltip: "Active projects in your workspace",
  },
  {
    icon: TrendingUp,
    label: "Traffic Growth",
    value: "34.8%",
    trend: "+5.2%",
    up: true,
    chartColor: "#ec4899",
    tooltip: "Month-over-month organic traffic growth",
  },
  {
    icon: Search,
    label: "Keyword Rankings",
    value: "4,892",
    trend: "+18.7%",
    up: true,
    chartColor: "#6366f1",
    tooltip: "Total keywords ranking in top 100",
  },
  {
    icon: Share2,
    label: "Backlinks",
    value: "12.4K",
    trend: "+7.8%",
    up: true,
    chartColor: "#06b6d4",
    tooltip: "Total backlinks across all projects",
  },
  {
    icon: Globe,
    label: "Domain Authority",
    value: "62",
    trend: "+4",
    up: true,
    chartColor: "#10b981",
    tooltip: "Average domain authority score",
  },
  {
    icon: Activity,
    label: "Pulse Score",
    value: "74",
    trend: "+6.2%",
    up: true,
    chartColor: "#8b5cf6",
    tooltip: "Your proprietary Nextill AI score",
  },
]

export function MetricCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3">
      {metrics.map((metric, i) => {
        const Icon = metric.icon
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <Tooltip content={metric.tooltip}>
              <div className="glass-card rounded-xl p-4 hover:glass-card-hover transition-all duration-300 cursor-default">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Icon className="w-4 h-4 text-primary-light" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={cn(
                        "text-[10px] font-medium",
                        metric.up ? "text-success" : "text-danger"
                      )}
                    >
                      {metric.trend}
                    </span>
                    <svg
                      className={cn(
                        "w-3 h-3",
                        metric.up ? "text-success" : "text-danger rotate-180"
                      )}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-xl font-bold tracking-tight">{metric.value}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted">{metric.label}</span>
                  <div className="w-16">
                    <MiniChart data={trendData} color={metric.chartColor} height={24} />
                  </div>
                </div>
              </div>
            </Tooltip>
          </motion.div>
        )
      })}
    </div>
  )
}
