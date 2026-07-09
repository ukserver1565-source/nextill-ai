"use client"

import { motion } from "framer-motion"
import { FileText, FolderKanban, BarChart3, Sparkles } from "lucide-react"
import Link from "next/link"

const actions = [
  { icon: FileText, label: "Create Document", path: "/post-generator", color: "from-blue-500 to-purple-600" },
  { icon: FolderKanban, label: "Create Project", path: "/dashboard/projects/new", color: "from-violet-500 to-indigo-600" },
  { icon: BarChart3, label: "Run Analysis", path: "/keyword-intelligence", color: "from-emerald-500 to-teal-600" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function CommandCenter() {
  return (
    <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#6D5EF5]/10 border border-[#6D5EF5]/20">
          <Sparkles className="w-3 h-3 text-[#6D5EF5]" />
          <span className="text-[10px] font-medium text-[#6D5EF5]">Command Center</span>
        </div>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap gap-3"
      >
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <motion.div key={action.label} variants={itemVariants}>
              <Link href={action.path}>
                <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#6D5EF5]/30 hover:bg-[#6D5EF5]/5 transition-all duration-200 group cursor-pointer">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white group-hover:text-[#6D5EF5] transition-colors">{action.label}</span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
