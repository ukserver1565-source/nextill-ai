"use client"

import { useState, useEffect } from "react"
import { Clock, Loader2, Inbox, ExternalLink } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthProvider"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

export default function DashboardHistoryPage() {
  const { profile } = useAuth()
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) { setLoading(false); return }
    const uid = profile.user_id
    async function load() {
      const { data } = await supabase
        .from("usage_logs")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(50)
      setHistory(data || [])
      setLoading(false)
    }
    load()
  }, [profile])

  const toolColors: Record<string, string> = {
    "keyword-intelligence": "bg-violet-500/20 text-violet-400",
    "post-generator": "bg-blue-500/20 text-blue-400",
    "plagiarism-checker": "bg-red-500/20 text-red-400",
    "ai-writer": "bg-purple-500/20 text-purple-400",
    "ai-humanizer": "bg-pink-500/20 text-pink-400",
    "ai-detector": "bg-orange-500/20 text-orange-400",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-sm text-muted mt-1">Your recent activity and usage history.</p>
      </div>

      {loading ? (
        <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-muted mb-4 animate-spin" />
          <p className="text-sm text-muted">Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Clock className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-lg font-semibold mb-1">No History Yet</h3>
          <p className="text-sm text-muted max-w-md mb-4">
            Your AI tool usage and activity history will appear here.
          </p>
          <Link href="/tools" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6D5EF5] text-white text-xs font-medium hover:brightness-110 transition-all">
            Explore Tools <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Tool</th>
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Credits</th>
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Input</th>
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Output</th>
                  <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry: any, i: number) => (
                  <tr key={entry.id || i} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${toolColors[entry.tool_slug] || "bg-white/[0.04] text-[#A7B0C0]"}`}>
                        {entry.tool_slug || "unknown"}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-white">{entry.credits_used || 0}</td>
                    <td className="p-4 text-xs text-[#A7B0C0]">{entry.input_chars ? `${entry.input_chars.toLocaleString()} chars` : "—"}</td>
                    <td className="p-4 text-xs text-[#A7B0C0]">{entry.output_chars ? `${entry.output_chars.toLocaleString()} chars` : "—"}</td>
                    <td className="p-4 text-xs text-[#A7B0C0] text-right">
                      {entry.created_at ? new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
