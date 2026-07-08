"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface AdminMetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  change?: string
  up?: boolean
  color?: string
  index?: number
}

export function AdminMetricCard({ icon: Icon, label, value, change, up, color, index = 0 }: AdminMetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="glass-card rounded-xl p-4 hover:glass-card-hover transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "p-2.5 rounded-lg border",
          color ? `${color}/10 border-${color}/20` : "bg-primary/10 border-primary/20"
        )}>
          <Icon className={cn("w-4 h-4", color ? `text-${color}` : "text-primary-light")} />
        </div>
        {change && (
          <div className={cn("flex items-center gap-0.5 text-[10px] font-medium", up ? "text-success" : "text-danger")}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      <p className="text-xl font-bold tracking-tight">{value}</p>
      <p className="text-[11px] text-muted mt-0.5">{label}</p>
    </motion.div>
  )
}
