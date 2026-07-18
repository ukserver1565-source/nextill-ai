"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  PenSquare, UserCheck, SearchCheck, FileSearch, SpellCheck, RefreshCw,
  AlignLeft, Languages, ArrowRight, Heading, FileText,
  Search, Shield, TrendingUp, Share2, Code, Map, Bot, Link as LinkIcon, ClipboardList,
  GitBranch, HelpCircle, type LucideIcon,
} from "lucide-react"
import Link from "next/link"

const iconMap: Record<string, LucideIcon> = {
  PenSquare, UserCheck, SearchCheck, FileSearch, SpellCheck, RefreshCw,
  AlignLeft, Languages, Heading, FileText, Search, Shield, TrendingUp,
  Share2, Code, Map, Bot, LinkIcon, ClipboardList, GitBranch, HelpCircle,
}

interface ToolCardProps {
  slug: string
  name: string
  description: string
  color: string
  icon: string
  creditsCost: number
  index?: number
}

export function ToolCard({ slug, name, description, color, icon, creditsCost, index = 0 }: ToolCardProps) {
  const Icon = iconMap[icon] || PenSquare

  return (
    <Link href={`/${slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.3 }}
        className="glass-card rounded-xl p-4 hover:glass-card-hover transition-all duration-300 group cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br", color)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <Badge variant="info" size="sm">{creditsCost} cr</Badge>
        </div>
        <h3 className="text-sm font-semibold mb-1">{name}</h3>
        <p className="text-[11px] text-muted leading-relaxed mb-3 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon-sm" className="rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </motion.div>
    </Link>
  )
}
