"use client"

import { motion } from "framer-motion"
import { Mail, Edit3 } from "lucide-react"

const sampleTemplates = [
  { id: 1, name: "Welcome Email", subject: "Welcome to {{site_name}}!", updated: "2024-07-10" },
  { id: 2, name: "Password Reset", subject: "Reset your {{site_name}} password", updated: "2024-07-08" },
  { id: 3, name: "Payment Confirmation", subject: "Payment received - {{plan}} plan", updated: "2024-07-05" },
  { id: 4, name: "Account Suspended", subject: "Your account has been suspended", updated: "2024-06-30" },
  { id: 5, name: "Credit Alert", subject: "Your credits are running low", updated: "2024-06-25" },
  { id: 6, name: "Newsletter", subject: "Nextill AI Monthly Update", updated: "2024-06-20" },
]

export default function EmailsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Email Templates</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Manage email notification templates</p>
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Template Name</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Subject</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Last Updated</th>
                <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sampleTemplates.map((t, i) => (
                <motion.tr key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#6D5EF5]" />
                      <span className="text-sm text-white">{t.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-[#A7B0C0] font-mono">{t.subject}</td>
                  <td className="p-4 text-xs text-[#A7B0C0]">{t.updated}</td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all">
                      <Edit3 className="w-3.5 h-3.5" />
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
