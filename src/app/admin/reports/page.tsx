"use client"

import { motion } from "framer-motion"
import { FileText, FileSpreadsheet, Download, Users, DollarSign, BarChart3, Cpu } from "lucide-react"

const reportTypes = [
  { icon: Users, label: "User Reports", desc: "User registration, activity, and plan distribution", color: "from-[#6D5EF5] to-[#8B5CF6]", count: 12 },
  { icon: DollarSign, label: "Payment Reports", desc: "Revenue, transactions, and refund summaries", color: "from-[#22C55E] to-[#4CC9F0]", count: 8 },
  { icon: BarChart3, label: "Tool Usage Reports", desc: "Usage statistics per tool and per user", color: "from-[#4CC9F0] to-[#6D5EF5]", count: 15 },
  { icon: Cpu, label: "AI Cost Reports", desc: "API costs, usage per model, and projections", color: "from-[#F59E0B] to-[#EF4444]", count: 6 },
]

const sampleReports = [
  { id: 1, name: "Monthly User Report - June 2024", type: "Users", generated: "2024-07-01", status: "ready" },
  { id: 2, name: "Revenue Summary Q2 2024", type: "Payments", generated: "2024-07-01", status: "ready" },
  { id: 3, name: "Tool Usage Analysis - June", type: "Usage", generated: "2024-06-30", status: "ready" },
  { id: 4, name: "AI Provider Cost Breakdown", type: "Cost", generated: "2024-06-28", status: "ready" },
  { id: 5, name: "Weekly Performance Report", type: "Usage", generated: "2024-06-25", status: "generating" },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Generate and export admin reports</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Reports", value: "42" },
          { label: "This Month", value: "8" },
          { label: "Generated", value: "38" },
          { label: "Scheduled", value: "4" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-[11px] text-[#A7B0C0]">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {reportTypes.map((r, i) => {
          const Icon = r.icon
          return (
            <motion.div key={r.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{r.label}</h3>
              <p className="text-xs text-[#A7B0C0] mb-3">{r.desc}</p>
              <p className="text-[10px] text-[#A7B0C0] mb-3">{r.count} reports</p>
              <button className="w-full h-9 rounded-xl bg-[#090B16] border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center justify-center gap-1.5 transition-all">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </motion.div>
          )
        })}
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-white">Recent Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Name</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Type</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Generated</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Status</th>
                <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sampleReports.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-sm text-white">{r.name}</td>
                  <td className="p-4 text-xs text-[#A7B0C0]">{r.type}</td>
                  <td className="p-4 text-xs text-[#A7B0C0]">{r.generated}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                      r.status === "ready" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                    }`}>{r.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
