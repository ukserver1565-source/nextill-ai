"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, UserPlus, ChevronLeft, ChevronRight, Trash2,
  Loader2, X, Shield, ShieldOff, CreditCard, AlertTriangle, Eye
} from "lucide-react"

const PAGE_SIZE = 10

interface UserProfile {
  id: string
  user_id: string
  email: string | null
  full_name: string | null
  role: string
  plan: string
  credits: number
  status: string
  created_at: string
}

const emptyForm = { email: "", name: "", password: "", role: "free_user", plan: "free" }

const planColors: Record<string, string> = {
  free: "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]",
  starter: "bg-[#4CC9F0]/10 text-[#4CC9F0] border-[#4CC9F0]/20",
  pro: "bg-[#6D5EF5]/10 text-[#6D5EF5] border-[#6D5EF5]/20",
  enterprise: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  agency: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [planFilter, setPlanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [plans, setPlans] = useState<{ slug: string; name: string }[]>([])
  const [createdUser, setCreatedUser] = useState<{ email: string; tempPassword: string } | null>(null)

  // Detail modal state
  const [detailUser, setDetailUser] = useState<UserProfile | null>(null)
  const [detailTab, setDetailTab] = useState<"overview" | "credits" | "settings">("overview")
  const [creditAmount, setCreditAmount] = useState("")
  const [creditReason, setCreditReason] = useState("")
  const [newPlan, setNewPlan] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: PAGE_SIZE.toString() })
      if (search) params.set("search", search)
      if (planFilter !== "all") params.set("filter[plan]", planFilter)
      if (statusFilter !== "all") params.set("filter[status]", statusFilter)
      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setUsers(json.data || [])
      setTotal(json.total || 0)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [page, search, planFilter, statusFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  useEffect(() => {
    fetch("/api/admin/plans")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPlans(data.map((p: any) => ({ slug: p.slug || p.name?.toLowerCase(), name: p.name })))
      })
      .catch(() => {})
  }, [])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Create user
  const handleCreate = async () => {
    setSaving(true)
    setCreatedUser(null)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create user")
      setCreatedUser({ email: data.email, tempPassword: data.tempPassword })
      setShowCreateModal(false)
      setCreateForm(emptyForm)
      fetchUsers()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed")
    } finally {
      setSaving(false)
    }
  }

  // Update user profile
  const handleUpdateProfile = async (userId: string, updates: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error("Failed to update")
      // Refresh list and detail
      fetchUsers()
      if (detailUser?.id === userId) {
        setDetailUser(prev => prev ? { ...prev, ...updates } as UserProfile : null)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed")
    }
  }

  // Add credits
  const handleAddCredits = async () => {
    if (!detailUser || !creditAmount || isNaN(Number(creditAmount)) || Number(creditAmount) <= 0) return
    try {
      const res = await fetch("/api/admin/users/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: detailUser.user_id, amount: Number(creditAmount), reason: creditReason || "Admin adjustment" }),
      })
      if (!res.ok) throw new Error("Failed to add credits")
      setCreditAmount("")
      setCreditReason("")
      // Update local state
      setDetailUser(prev => prev ? { ...prev, credits: (prev.credits || 0) + Number(creditAmount) } : null)
      fetchUsers()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Credits failed")
    }
  }

  // Delete user
  const handleDelete = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setConfirmDelete(null)
      setDetailUser(null)
      fetchUsers()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed")
    }
  }

  const openDetail = (user: UserProfile) => {
    setDetailUser(user)
    setDetailTab("overview")
    setNewPlan(user.plan || "free")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">{total.toLocaleString()} total users</p>
        </div>
        <button onClick={() => { setShowCreateModal(true); setCreateForm(emptyForm) }} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-[#EF4444]">{error}</p>
          <button onClick={() => setError("")} className="text-[#EF4444] hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name or email..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all"
          />
        </div>
        <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1) }} className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-xs text-white outline-none focus:ring-2 focus:ring-[#6D5EF5]/30">
          <option value="all">All Plans</option>
          {plans.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-xs text-white outline-none focus:ring-2 focus:ring-[#6D5EF5]/30">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Plan</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Credits</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Role</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Joined</th>
                <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-12 text-center"><Loader2 className="w-5 h-5 animate-spin text-[#A7B0C0] mx-auto" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-xs text-[#A7B0C0]">No users found</td></tr>
              ) : (
                users.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => openDetail(user)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B5CF6]/20 border border-white/[0.06] flex items-center justify-center text-xs font-bold text-white">
                          {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.full_name || "Unnamed"}</p>
                          <p className="text-[11px] text-[#A7B0C0]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${planColors[user.plan?.toLowerCase()] || planColors.free}`}>
                        {user.plan || "free"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-[#A7B0C0] flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        {(user.credits ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        user.role === "admin" || user.role === "super_admin"
                          ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                          : "bg-white/[0.04] text-[#A7B0C0] border-white/[0.06]"
                      }`}>
                        {user.role || "free_user"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                        user.status === "active"
                          ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                          : user.status === "suspended"
                          ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
                          : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-[#A7B0C0]">{user.created_at ? new Date(user.created_at).toLocaleDateString("en-US") : "—"}</td>
                    <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openDetail(user)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all" title="View details">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleUpdateProfile(user.id, { status: user.status === "suspended" ? "active" : "suspended" })} className={`p-1.5 rounded-lg hover:bg-white/[0.06] transition-all ${user.status === "suspended" ? "text-[#22C55E] hover:text-[#22C55E]" : "text-[#A7B0C0] hover:text-[#EF4444]"}`} title={user.status === "suspended" ? "Unblock" : "Block"}>
                          {user.status === "suspended" ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => setConfirmDelete(user.id)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-[#EF4444] transition-all" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#A7B0C0]">Page {page} of {totalPages} ({total} total)</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-white disabled:opacity-30 hover:bg-white/[0.06] transition-all"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4))
              const p = start + i
              if (p > totalPages) return null
              return <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === p ? "bg-[#6D5EF5] text-white" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}>{p}</button>
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-white disabled:opacity-30 hover:bg-white/[0.06] transition-all"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      <AnimatePresence>
        {detailUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setDetailUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#090B16] border border-white/[0.06] rounded-xl w-full max-w-lg mx-4 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B5CF6]/20 border border-white/[0.06] flex items-center justify-center text-sm font-bold text-white">
                    {(detailUser.full_name || detailUser.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{detailUser.full_name || "Unnamed"}</h3>
                    <p className="text-[11px] text-[#A7B0C0]">{detailUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setDetailUser(null)} className="text-[#A7B0C0] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/[0.06]">
                {(["overview", "credits", "settings"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className={`flex-1 py-3 text-xs font-medium transition-colors ${
                      detailTab === tab
                        ? "text-[#6D5EF5] border-b-2 border-[#6D5EF5]"
                        : "text-[#A7B0C0] hover:text-white"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {/* Overview Tab */}
                {detailTab === "overview" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#151C2E]/80 rounded-xl p-3">
                        <p className="text-[10px] text-[#A7B0C0] uppercase tracking-wider mb-1">Plan</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${planColors[detailUser.plan?.toLowerCase()] || planColors.free}`}>
                          {detailUser.plan || "free"}
                        </span>
                      </div>
                      <div className="bg-[#151C2E]/80 rounded-xl p-3">
                        <p className="text-[10px] text-[#A7B0C0] uppercase tracking-wider mb-1">Credits</p>
                        <p className="text-sm font-bold text-white">{(detailUser.credits ?? 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-[#151C2E]/80 rounded-xl p-3">
                        <p className="text-[10px] text-[#A7B0C0] uppercase tracking-wider mb-1">Role</p>
                        <p className="text-xs font-medium text-white">{detailUser.role || "free_user"}</p>
                      </div>
                      <div className="bg-[#151C2E]/80 rounded-xl p-3">
                        <p className="text-[10px] text-[#A7B0C0] uppercase tracking-wider mb-1">Status</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          detailUser.status === "active" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                          : detailUser.status === "suspended" ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
                          : "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]"
                        }`}>
                          {detailUser.status}
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#151C2E]/80 rounded-xl p-3">
                      <p className="text-[10px] text-[#A7B0C0] uppercase tracking-wider mb-1">Joined</p>
                      <p className="text-xs text-white">{detailUser.created_at ? new Date(detailUser.created_at).toLocaleString("en-US") : "—"}</p>
                    </div>
                    <div className="bg-[#151C2E]/80 rounded-xl p-3">
                      <p className="text-[10px] text-[#A7B0C0] uppercase tracking-wider mb-1">User ID</p>
                      <p className="text-[10px] text-[#A7B0C0] font-mono break-all">{detailUser.user_id}</p>
                    </div>
                  </div>
                )}

                {/* Credits Tab */}
                {detailTab === "credits" && (
                  <div className="space-y-4">
                    <div className="bg-[#151C2E]/80 rounded-xl p-4 text-center">
                      <p className="text-[10px] text-[#A7B0C0] uppercase tracking-wider mb-1">Current Balance</p>
                      <p className="text-3xl font-bold text-white">{(detailUser.credits ?? 0).toLocaleString()}</p>
                      <p className="text-[10px] text-[#A7B0C0] mt-1">credits</p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-white">Add Credits</h4>
                      <div className="space-y-2">
                        <input
                          type="number"
                          value={creditAmount}
                          onChange={e => setCreditAmount(e.target.value)}
                          placeholder="Amount to add"
                          className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30"
                        />
                        <input
                          value={creditReason}
                          onChange={e => setCreditReason(e.target.value)}
                          placeholder="Reason (optional)"
                          className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30"
                        />
                        <button
                          onClick={handleAddCredits}
                          disabled={!creditAmount || isNaN(Number(creditAmount)) || Number(creditAmount) <= 0}
                          className="w-full h-10 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          Add Credits
                        </button>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {[10, 50, 100, 500].map(amt => (
                          <button key={amt} onClick={() => setCreditAmount(String(amt))} className="px-3 py-1.5 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-[10px] text-[#A7B0C0] hover:text-white hover:bg-white/[0.06] transition-all">
                            +{amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {detailTab === "settings" && (
                  <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#A7B0C0]">Full Name</label>
                      <div className="flex gap-2">
                        <input
                          defaultValue={detailUser.full_name || ""}
                          id="detail-name"
                          className="flex-1 h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30"
                        />
                        <button onClick={() => {
                          const el = document.getElementById("detail-name") as HTMLInputElement
                          if (el) handleUpdateProfile(detailUser.id, { full_name: el.value })
                        }} className="h-10 px-4 rounded-xl bg-[#6D5EF5] text-white text-xs font-medium hover:opacity-90 transition-opacity">Save</button>
                      </div>
                    </div>

                    {/* Plan */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#A7B0C0]">Plan</label>
                      <div className="flex gap-2">
                        <select
                          value={newPlan}
                          onChange={e => setNewPlan(e.target.value)}
                          className="flex-1 h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30"
                        >
                          {plans.length > 0 ? plans.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>) : (
                            <>
                              <option value="free">Free</option>
                              <option value="starter">Starter</option>
                              <option value="pro">Pro</option>
                              <option value="enterprise">Enterprise</option>
                            </>
                          )}
                        </select>
                        <button onClick={() => handleUpdateProfile(detailUser.id, { plan: newPlan })} className="h-10 px-4 rounded-xl bg-[#6D5EF5] text-white text-xs font-medium hover:opacity-90 transition-opacity">Update</button>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#A7B0C0]">Role</label>
                      <div className="flex gap-2">
                        <select
                          defaultValue={detailUser.role || "free_user"}
                          id="detail-role"
                          className="flex-1 h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30"
                        >
                          <option value="free_user">User</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                        <button onClick={() => {
                          const el = document.getElementById("detail-role") as HTMLSelectElement
                          if (el) handleUpdateProfile(detailUser.id, { role: el.value })
                        }} className="h-10 px-4 rounded-xl bg-[#6D5EF5] text-white text-xs font-medium hover:opacity-90 transition-opacity">Update</button>
                      </div>
                    </div>

                    {/* Block / Unblock */}
                    <div className="pt-2 border-t border-white/[0.06]">
                      <button
                        onClick={() => handleUpdateProfile(detailUser.id, { status: detailUser.status === "suspended" ? "active" : "suspended" })}
                        className={`w-full h-10 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                          detailUser.status === "suspended"
                            ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 hover:bg-[#22C55E]/20"
                            : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 hover:bg-[#EF4444]/20"
                        }`}
                      >
                        {detailUser.status === "suspended" ? <><ShieldOff className="w-4 h-4" /> Unblock User</> : <><Shield className="w-4 h-4" /> Block User</>}
                      </button>
                    </div>

                    {/* Delete */}
                    <div>
                      <button
                        onClick={() => setConfirmDelete(detailUser.id)}
                        className="w-full h-10 rounded-xl bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 text-xs font-medium flex items-center justify-center gap-2 hover:bg-[#EF4444]/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" /> Delete User
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#090B16] border border-[#EF4444]/20 rounded-xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Delete User</h3>
                  <p className="text-xs text-[#A7B0C0]">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-xs text-[#A7B0C0] mb-6">
                This will permanently delete the user&apos;s auth account, profile, and all related data.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setConfirmDelete(null)} className="h-9 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.06] transition-all">Cancel</button>
                <button onClick={() => confirmDelete && handleDelete(confirmDelete)} className="h-9 px-4 rounded-xl bg-[#EF4444] text-white text-xs font-medium hover:opacity-90 transition-opacity">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#090B16] border border-white/[0.06] rounded-xl p-6 w-full max-w-md space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Add User</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-[#A7B0C0] hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Email *</label>
                  <input value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Name</label>
                  <input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Password</label>
                  <input type="password" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} placeholder="Leave empty for auto-generated" className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#A7B0C0]">Role</label>
                    <select value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30">
                      <option value="free_user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#A7B0C0]">Plan</label>
                    <select value={createForm.plan} onChange={e => setCreateForm(f => ({ ...f, plan: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30">
                      {plans.length > 0 ? plans.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>) : <option value="free">Free</option>}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowCreateModal(false)} className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.06] transition-all">Cancel</button>
                <button onClick={handleCreate} disabled={saving || !createForm.email.trim()} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Created User Toast */}
      <AnimatePresence>
        {createdUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-[#151C2E]/95 backdrop-blur-xl border border-[#22C55E]/30 rounded-xl shadow-lg z-50 p-4 max-w-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#22C55E]">User Created</span>
              <button onClick={() => setCreatedUser(null)} className="text-[#A7B0C0] hover:text-white text-xs">✕</button>
            </div>
            <p className="text-xs text-[#A7B0C0] mb-1">Email: <span className="text-white">{createdUser.email}</span></p>
            <p className="text-xs text-[#A7B0C0] mb-2">Temporary Password:</p>
            <div className="flex items-center gap-2 bg-[#090B16] rounded-lg px-3 py-2">
              <code className="text-xs text-[#22C55E] font-mono flex-1 break-all">{createdUser.tempPassword}</code>
              <button onClick={() => navigator.clipboard.writeText(createdUser.tempPassword)} className="text-[#A7B0C0] hover:text-white text-xs shrink-0">Copy</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
