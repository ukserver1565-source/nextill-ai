"use client"

import { motion } from "framer-motion"
import { FileText, FolderKanban, History } from "lucide-react"
import Link from "next/link"

const actions = [
  { icon: FileText, label: "New Document", path: "/post-generator", color: "from-blue-500 to-purple-600" },
  { icon: FolderKanban, label: "New Project", path: "/dashboard/projects", color: "from-violet-500 to-indigo-600" },
  { icon: History, label: "View History", path: "/dashboard/history", color: "from-amber-500 to-orange-600" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
}

export function QuickActions() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap items-center gap-3"
    >
      <span className="text-xs text-[#A7B0C0] font-medium mr-1">Quick Actions:</span>
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <motion.div key={action.label} variants={itemVariants}>
            <Link href={action.path}>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] hover:border-white/[0.12] hover:bg-[#151C2E]/90 transition-all duration-200 group cursor-pointer">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-medium text-white">{action.label}</span>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
