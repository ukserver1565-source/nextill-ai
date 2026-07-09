"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Database, Download, Plus, CheckCircle, XCircle, Clock, HardDrive } from "lucide-react"

const sampleBackups = [
  { id: 1, type: "Full Database", date: "2024-07-15 03:00 AM", size: "256 MB", status: "completed" },
  { id: 2, type: "Full Database", date: "2024-07-14 03:00 AM", size: "252 MB", status: "completed" },
  { id: 3, type: "Settings Only", date: "2024-07-13 03:00 AM", size: "1.2 MB", status: "completed" },
  { id: 4, type: "Full Database", date: "2024-07-12 03:00 AM", size: "248 MB", status: "failed" },
  { id: 5, type: "Full Database", date: "2024-07-11 03:00 AM", size: "245 MB", status: "completed" },
]

export default function BackupsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Backups</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage database and system backups</p>
        </div>
        <button className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
          <Plus className="w-4 h-4" /> Create Backup
        </button>
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">ID</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Type</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Date</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Size</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Status</th>
                <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sampleBackups.map((b, i) => (
                <motion.tr
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4 text-xs font-mono text-[#4CC9F0]">#{b.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-[#A7B0C0]" />
                      <span className="text-xs text-white">{b.type}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-[#A7B0C0]">{b.date}</td>
                  <td className="p-4 text-xs text-white font-medium">{b.size}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                      b.status === "completed"
                        ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                        : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
                    }`}>
                      {b.status === "completed" ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {b.status}
                    </span>
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
