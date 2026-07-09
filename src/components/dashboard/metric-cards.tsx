"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatItem {
  icon: React.ElementType
  label: string
  value: string
  trend: string
  up: boolean
  color: string
}

interface MetricCardsProps {
  stats: StatItem[]
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
}

export function MetricCards({ stats }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((metric, i) => {
        const Icon = metric.icon
        return (
          <motion.div
            key={metric.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.1] hover:bg-[#151C2E]/90 transition-all duration-300 group cursor-default">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
                  metric.color
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "text-xs font-medium",
                    metric.up ? "text-[#22C55E]" : "text-[#EF4444]"
                  )}>
                    {metric.trend}
                  </span>
                  {metric.up ? (
                    <TrendingUp className="w-3.5 h-3.5 text-[#22C55E]" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-[#EF4444]" />
                  )}
                </div>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">{metric.value}</span>
              <p className="text-xs text-[#A7B0C0] mt-1">{metric.label}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
