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
  sparklineData?: number[]
}

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  primary: { bg: "bg-[#6D5EF5]/10", text: "text-[#6D5EF5]", border: "border-[#6D5EF5]/20" },
  success: { bg: "bg-[#22C55E]/10", text: "text-[#22C55E]", border: "border-[#22C55E]/20" },
  warning: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", border: "border-[#F59E0B]/20" },
  danger: { bg: "bg-[#EF4444]/10", text: "text-[#EF4444]", border: "border-[#EF4444]/20" },
  info: { bg: "bg-[#4CC9F0]/10", text: "text-[#4CC9F0]", border: "border-[#4CC9F0]/20" },
}

export function AdminMetricCard({ icon: Icon, label, value, change, up = true, color = "primary", index = 0, sparklineData }: AdminMetricCardProps) {
  const colors = colorMap[color] || colorMap.primary

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="rounded-xl p-5 bg-[#151C2E] border border-white/[0.06] hover:bg-[#1A2340] hover:border-white/[0.1] transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-lg border", colors.bg, colors.border)}>
          <Icon className={cn("w-4 h-4", colors.text)} />
        </div>
        {change && (
          <div className={cn("flex items-center gap-0.5 text-[10px] font-medium", up ? "text-[#22C55E]" : "text-[#EF4444]")}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
      <p className="text-[11px] text-[#A7B0C0] mt-1">{label}</p>

      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-3 h-8 flex items-end gap-0.5">
          {sparklineData.map((point, i) => {
            const max = Math.max(...sparklineData)
            const height = max > 0 ? (point / max) * 100 : 0
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-sm transition-all duration-300",
                  up ? "bg-[#22C55E]/20 group-hover:bg-[#22C55E]/30" : "bg-[#EF4444]/20 group-hover:bg-[#EF4444]/30"
                )}
                style={{ height: `${Math.max(height, 10)}%` }}
              />
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
