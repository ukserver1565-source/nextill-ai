"use client"

import { motion } from "framer-motion"
import { PulseGauge } from "@/components/charts/pulse-gauge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { calculatePulseScore, pulseScoreMetrics } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

const metricItems = [
  { key: "seoQuality" as const, label: "SEO Quality" },
  { key: "readability" as const, label: "Readability" },
  { key: "aiDetectionRisk" as const, label: "AI Detection Risk" },
  { key: "keywordUsage" as const, label: "Keyword Usage" },
  { key: "headingStructure" as const, label: "Heading Structure" },
  { key: "internalLinking" as const, label: "Internal Linking" },
  { key: "contentDepth" as const, label: "Content Depth" },
  { key: "metaOptimization" as const, label: "Meta Optimization" },
  { key: "schema" as const, label: "Schema" },
  { key: "imageSEO" as const, label: "Image SEO" },
  { key: "pageSpeed" as const, label: "Page Speed" },
]

export function PulseScoreSection() {
  const score = calculatePulseScore()

  const getVariant = (val: number) => {
    if (val >= 80) return "success" as const
    if (val >= 60) return "default" as const
    if (val >= 40) return "warning" as const
    return "danger" as const
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Pulse Score</h2>
        <button className="text-xs text-primary hover:underline">View History</button>
      </div>
      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
          <div className="flex flex-col items-center">
            <PulseGauge score={score} size={160} />
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] text-muted">vs last week</span>
              <span className="text-xs text-success font-medium flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +4.2%
              </span>
            </div>
          </div>

          <Separator orientation="vertical" className="hidden lg:block h-40" />

          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {metricItems.map((item) => {
              const val = pulseScoreMetrics[item.key]
              return (
                <div key={item.key} className="flex items-center gap-3 py-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted truncate">{item.label}</span>
                      <span className={cn(
                        "text-xs font-medium ml-2",
                        val >= 80 ? "text-success" : val >= 60 ? "text-foreground" : val >= 40 ? "text-warning" : "text-danger"
                      )}>
                        {val}%
                      </span>
                    </div>
                    <Progress
                      value={val}
                      variant={getVariant(val)}
                      size="sm"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Priority Actions", value: "3", icon: TrendingUp, color: "text-danger" },
            { label: "Improvements", value: "7", icon: TrendingUp, color: "text-warning" },
            { label: "On Track", value: "12", icon: Minus, color: "text-success" },
            { label: "AI Recommendations", value: "5", icon: TrendingUp, color: "text-primary" },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-card">
                <Icon className={cn("w-4 h-4", item.color)} />
                <div>
                  <p className="text-xs font-semibold">{item.value}</p>
                  <p className="text-[10px] text-muted">{item.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
