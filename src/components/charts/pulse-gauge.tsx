"use client"

import { cn } from "@/lib/utils"

interface PulseGaugeProps {
  score: number
  size?: number
  className?: string
}

export function PulseGauge({ score, size = 160, className }: PulseGaugeProps) {
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getColor = (s: number) => {
    if (s >= 80) return "#10b981"
    if (s >= 60) return "#6366f1"
    if (s >= 40) return "#f59e0b"
    return "#ef4444"
  }

  const color = getColor(score)

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${color}40)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold tracking-tight"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-[10px] text-muted font-medium uppercase tracking-widest mt-0.5">
          Pulse Score
        </span>
      </div>
    </div>
  )
}
