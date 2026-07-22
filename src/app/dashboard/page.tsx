"use client"

import { useAuth } from "@/lib/auth/AuthProvider"
import { supabase } from "@/lib/supabase/client"
import { FileText, Sparkles, FolderKanban, FileIcon, Zap, Activity } from "lucide-react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MetricCards } from "@/components/dashboard/metric-cards"
import { AIToolCards } from "@/components/dashboard/ai-tool-cards"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { CommandCenter } from "@/components/dashboard/command-center"
import { PageSkeleton } from "@/components/ui/skeleton"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

import Link from "next/link"
import { cn } from "@/lib/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Dashboard() {
  const { profile } = useAuth()
  const [documents, setDocuments] = useState<any[]>([])
  const [credits, setCredits] = useState<any>(null)
  const [creditLimit, setCreditLimit] = useState(5000)
  const [statsData, setStatsData] = useState([
    { icon: FolderKanban, label: "Projects", value: "0", trend: "+0", up: true, color: "from-violet-500 to-indigo-600" },
    { icon: FileIcon, label: "Documents", value: "0", trend: "+0", up: true, color: "from-blue-500 to-cyan-500" },
    { icon: Zap, label: "Credits Used", value: "0", trend: "+0", up: true, color: "from-amber-500 to-orange-600" },
    { icon: Activity, label: "AI Runs", value: "0", trend: "+0", up: true, color: "from-emerald-500 to-teal-600" },
  ])
  const [loading, setLoading] = useState(true)
  const [clientDate, setClientDate] = useState("")

  useEffect(() => {
    const hour = new Date().getHours()
    let greeting = "Good evening"
    if (hour < 12) greeting = "Good morning"
    else if (hour < 17) greeting = "Good afternoon"
    setClientDate(greeting + "|" + new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }))
  }, [])

  useEffect(() => {
    if (!profile) return
    const uid = profile.user_id
    async function load() {
      try {
        const [docRes, credRes, projRes, usageRes, creditLogRes, planRes] = await Promise.all([
          supabase.from("documents").select("*").eq("user_id", uid).order("updated_at", { ascending: false }).limit(10),
          supabase.from("credits").select("balance").eq("user_id", uid).single(),
          supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", uid),
          supabase.from("usage_logs").select("id", { count: "exact", head: true }).eq("user_id", uid),
          supabase.from("credit_logs").select("amount, type").eq("user_id", uid).eq("type", "used"),
          supabase.from("plans").select("credits").eq("slug", profile?.plan || "free").maybeSingle(),
        ])
        setDocuments(docRes.data || [])
        setCredits(credRes.data as { balance: number } | null)
        if (planRes.data?.credits) setCreditLimit(planRes.data.credits)

        const projectCount = projRes.count || 0
        const documentCount = docRes.count || 0
        const creditsUsed = creditLogRes.data?.reduce((sum: number, log: any) => sum + Math.abs(log.amount), 0) || 0
        const aiRuns = usageRes.count || 0

        setStatsData([
          { icon: FolderKanban, label: "Projects", value: projectCount.toLocaleString(), trend: projectCount > 0 ? `+${projectCount}` : "0", up: true, color: "from-violet-500 to-indigo-600" },
          { icon: FileIcon, label: "Documents", value: documentCount.toLocaleString(), trend: documentCount > 0 ? `+${documentCount}` : "0", up: true, color: "from-blue-500 to-cyan-500" },
          { icon: Zap, label: "Credits Used", value: creditsUsed.toLocaleString(), trend: creditsUsed > 0 ? `-${creditsUsed}` : "0", up: false, color: "from-amber-500 to-orange-600" },
          { icon: Activity, label: "AI Runs", value: aiRuns.toLocaleString(), trend: aiRuns > 0 ? `+${aiRuns}` : "0", up: true, color: "from-emerald-500 to-teal-600" },
        ])
      } catch (err) {
        console.error("Failed to load dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
    const onFocus = () => { if (profile) load() }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [profile])

  if (loading) {
    return (
      <div className="p-6">
        <PageSkeleton />
      </div>
    )
  }

  const userName = profile?.full_name || profile?.email || "User"
  const creditBalance = profile?.credits ?? credits?.balance ?? 0
  const creditUsed = creditLimit - creditBalance
  const creditPercent = creditLimit > 0 ? Math.round((creditUsed / creditLimit) * 100) : 0

  const docTypeColors: Record<string, string> = {
    blog: "bg-blue-500/20 text-blue-400",
    article: "bg-purple-500/20 text-purple-400",
    social: "bg-pink-500/20 text-pink-400",
    seo: "bg-emerald-500/20 text-emerald-400",
  }

  const statusColors: Record<string, string> = {
    draft: "bg-[#A7B0C0]/10 text-[#A7B0C0]",
    published: "bg-[#22C55E]/10 text-[#22C55E]",
    processing: "bg-[#F59E0B]/10 text-[#F59E0B]",
    failed: "bg-[#EF4444]/10 text-[#EF4444]",
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-24"
    >
      <motion.div variants={itemVariants}>
        <Breadcrumbs className="mb-4" />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {clientDate ? clientDate.split("|")[0] : "Hello"}, {userName.split(" ")[0]}
            </h1>
            <p className="text-sm text-[#A7B0C0] mt-1">{clientDate ? clientDate.split("|")[1] : ""}</p>
          </div>
          <div className="flex items-center gap-2 bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl px-4 py-2.5">
            <Sparkles className="w-4 h-4 text-[#6D5EF5]" />
            <span className="text-sm font-medium text-white">{creditBalance}</span>
            <span className="text-xs text-[#A7B0C0]">credits left</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <MetricCards stats={statsData} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <AIToolCards />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileIcon className="w-4 h-4 text-[#6D5EF5]" />
              Recent Documents
            </h3>
            <span className="text-[10px] text-[#A7B0C0] bg-white/[0.04] px-2 py-1 rounded-md">{documents.length} total</span>
          </div>
          {documents.length > 0 ? (
            <div className="space-y-1">
              {documents.slice(0, 6).map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-white/[0.03] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#6D5EF5]/10 border border-[#6D5EF5]/20 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-[#6D5EF5]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate max-w-[220px]">{doc.title || "Untitled"}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded", docTypeColors[doc.type] || "bg-white/[0.04] text-[#A7B0C0]")}>
                          {doc.type || "document"}
                        </span>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded", statusColors[doc.status] || "bg-white/[0.04] text-[#A7B0C0]")}>
                          {doc.status || "draft"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#A7B0C0] shrink-0">
                    {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "N/A"}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 rounded-xl bg-[#6D5EF5]/10 border border-[#6D5EF5]/20 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-[#6D5EF5]" />
              </div>
              <p className="text-sm text-white font-medium mb-1">No documents yet</p>
              <p className="text-xs text-[#A7B0C0] mb-4">Generate your first SEO-optimized post to get started</p>
              <Link href="/post-generator">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6D5EF5] text-white text-xs font-medium hover:brightness-110 transition-all">
                  <Sparkles className="w-3.5 h-3.5" />
                  Create your first post
                </span>
              </Link>
            </div>
          )}
        </div>

        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F59E0B]" />
              Credit Usage
            </h3>
            <span className="text-[10px] text-[#A7B0C0] bg-white/[0.04] px-2 py-1 rounded-md">
              {creditBalance} remaining
            </span>
          </div>
          <div className="flex flex-col items-center py-4">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <motion.circle
                  cx="64" cy="64" r="54" fill="none"
                  stroke="url(#creditGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - creditPercent / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="creditGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6D5EF5" />
                    <stop offset="100%" stopColor="#4CC9F0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{creditPercent}%</span>
                <span className="text-[10px] text-[#A7B0C0]">used</span>
              </div>
            </div>
            <div className="w-full max-w-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A7B0C0]">Used</span>
                <span className="text-white font-medium">{creditUsed.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#6D5EF5] to-[#4CC9F0]"
                  initial={{ width: 0 }}
                  animate={{ width: `${creditPercent}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A7B0C0]">Limit</span>
                <span className="text-white font-medium">{creditLimit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <QuickActions />
      </motion.div>

      <motion.div variants={itemVariants}>
        <CommandCenter />
      </motion.div>
    </motion.div>
  )
}
