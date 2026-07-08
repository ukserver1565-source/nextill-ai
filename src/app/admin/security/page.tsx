"use client"

import { useState } from "react"
import { AdminTable } from "@/components/admin/admin-table"
import { AdminSearch } from "@/components/admin/admin-search"
import { formatDateTime } from "@/lib/admin-utils"
import { Badge } from "@/components/ui/badge"
import { useData, LoadingSkeleton, ErrorState } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"
import type { SecurityLog } from "@/lib/admin-types"

const logTypeColors: Record<string, string> = {
  login: "bg-success/10 text-success border-success/20",
  failed_login: "bg-danger/10 text-danger border-danger/20",
  admin_action: "bg-primary/10 text-primary border-primary/20",
}

export default function SecurityPage() {
  const [search, setSearch] = useState("")
  const { data, loading, error, refetch } = useData(() => adminApi.securityLogs())
  const logs = data?.data || []
  const filtered = logs.filter((l: any) =>
    l.action.toLowerCase().includes(search.toLowerCase()) || (l.userName || "").toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: "type", label: "Type", render: (l: SecurityLog) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${logTypeColors[l.type]}`}>
        {l.type.replace(/_/g, " ")}
      </span>
    )},
    { key: "user", label: "User", render: (l: SecurityLog) => (
      <span className="text-xs">{l.userName || "Anonymous"}</span>
    )},
    { key: "action", label: "Action", render: (l: SecurityLog) => (
      <span className="text-xs max-w-[300px] truncate block">{l.action}</span>
    )},
    { key: "ip", label: "IP Hash", render: (l: SecurityLog) => (
      <code className="text-[10px] text-muted font-mono">{l.ipHash}</code>
    )},
    { key: "timestamp", label: "Timestamp", render: (l: SecurityLog) => (
      <span className="text-[11px] text-muted">{formatDateTime((l as any).created_at)}</span>
    )},
  ]

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Security Logs</h1><p className="text-sm text-muted mt-1">Monitor login attempts, admin actions, and security events</p></div>
      <div className="w-full max-w-xs"><AdminSearch value={search} onChange={setSearch} placeholder="Search logs..." /></div>
      <div className="glass-card rounded-xl overflow-hidden">
        <AdminTable columns={columns} data={filtered} keyField="id" />
      </div>
    </div>
  )
}
