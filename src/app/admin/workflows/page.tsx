"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Workflow, CheckCircle, XCircle, Clock, BarChart3, Settings, Play } from "lucide-react"

const sampleWorkflows = [
  {
    id: 1, name: "Keyword Intelligence", slug: "keyword_intelligence",
    description: "AI-powered keyword research and clustering",
    status: "active", lastRun: "2 min ago", totalRuns: 12450, successRate: 98.5,
  },
  {
    id: 2, name: "Post Generator", slug: "post_generator",
    description: "Automated blog post generation with SEO optimization",
    status: "active", lastRun: "5 min ago", totalRuns: 34200, successRate: 96.2,
  },
  {
    id: 3, name: "Plagiarism Checker", slug: "plagiarism_checker",
    description: "Content originality verification across the web",
    status: "inactive", lastRun: "2 hours ago", totalRuns: 8900, successRate: 99.1,
  },
]

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Workflows</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Manage automated workflow settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sampleWorkflows.map((wf, i) => (
          <motion.div
            key={wf.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 hover:border-white/[0.12] transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${wf.status === "active" ? "bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6]" : "bg-[#090B16] border border-white/[0.06]"}`}>
                <Workflow className={`w-6 h-6 ${wf.status === "active" ? "text-white" : "text-[#A7B0C0]"}`} />
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                wf.status === "active"
                  ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                  : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
              }`}>
                {wf.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>

            <h3 className="text-base font-semibold text-white">{wf.name}</h3>
            <p className="text-xs text-[#A7B0C0] mt-1">{wf.description}</p>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="bg-[#090B16] rounded-xl p-3 border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[10px] text-[#A7B0C0] mb-1">
                  <Clock className="w-3 h-3" /> Last Run
                </div>
                <p className="text-xs font-medium text-white">{wf.lastRun}</p>
              </div>
              <div className="bg-[#090B16] rounded-xl p-3 border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[10px] text-[#A7B0C0] mb-1">
                  <BarChart3 className="w-3 h-3" /> Total Runs
                </div>
                <p className="text-xs font-medium text-white">{wf.totalRuns.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-3 bg-[#090B16] rounded-xl p-3 border border-white/[0.06]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A7B0C0]">Success Rate</span>
                <span className="font-bold text-[#22C55E]">{wf.successRate}%</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#6D5EF5] to-[#22C55E]" style={{ width: `${wf.successRate}%` }} />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button className="flex-1 h-9 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
                <Play className="w-3.5 h-3.5" /> Run Now
              </button>
              <button className="h-9 px-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-xs font-medium flex items-center gap-1.5 hover:bg-white/[0.06] transition-all">
                <Settings className="w-3.5 h-3.5" /> Settings
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
