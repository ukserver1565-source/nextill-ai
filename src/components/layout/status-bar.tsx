"use client"

import { cn } from "@/lib/utils"
import { Wifi, HardDrive, Clock, Activity } from "lucide-react"

export function StatusBar() {
  return (
    <div className="h-[--statusbar-height] bg-sidebar border-t border-border flex items-center justify-between px-4 text-[10px] text-muted">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
          <span>Connected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <HardDrive className="w-3 h-3" />
          <span>98% Uptime</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3" />
          <span>AI Server: 24ms</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span>Last backup: 2 min ago</span>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          <span>v10.0.0</span>
        </div>
      </div>
    </div>
  )
}
