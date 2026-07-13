"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { Search, UserPlus, ChevronLeft, ChevronRight, MoreVertical, Edit3, Trash2, Loader2, X } from "lucide-react"

const PAGE_SIZE = 8

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [planFilter, setPlanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [formState, setFormState] = useState({ email: "", name: "", role: "user", plan_id: "free" })
  const [saving, setSaving] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [plans, setPlans] = useState<{ slug: string; name: string }[]>([])
  const [menuError, setMenuError] = useState("")
  const menuRef = useRef<HTMLDivElement>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: PAGE_SIZE.toString() })
      if (search) params.set("search", search)
      if (planFilter !== "all") params.set("filter[plan_id]", planFilter)
      if (statusFilter !== "all") params.set("filter[status]", statusFilter)
      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setUsers(json.data || [])
      setTotal(json.total || 0)
    } catch (err: any) {
      setError(err.message)
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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const openCreate = () => {
    setEditingUser(null)
    setFormState({ email: "", name: "", role: "user", plan_id: "free" })
    setShowModal(true)
  }

  const openEdit = (user: any) => {
    setEditingUser(user)
    setFormState({ email: user.email || "", name: user.name || "", role: user.role || "user", plan_id: user.plan_id || "free" })
    setShowModal(true)
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formState),
      })
      if (!res.ok) throw new Error("Failed to create user")
      setShowModal(false)
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingUser) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formState),
      })
      if (!res.ok) throw new Error("Failed to update user")
      setShowModal(false)
      setEditingUser(null)
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete user")
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleMenuAction = async (user: any, action: string) => {
    setOpenMenuId(null)
    setMenuError("")
    if (action === "change_role") {
      const newRole = window.prompt("Enter new role (user/admin):", user.role || "user")
      if (!newRole) return
      try {
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: newRole }),
        })
        if (!res.ok) throw new Error("Failed to update role")
        fetchUsers()
      } catch (e: any) { setMenuError(e.message) }
    } else if (action === "change_status") {
      const newStatus = window.prompt("Enter new status (active/suspended/inactive):", user.status || "active")
      if (!newStatus) return
      try {
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }),
        })
        if (!res.ok) throw new Error("Failed to update status")
        fetchUsers()
      } catch (e: any) { setMenuError(e.message) }
    } else if (action === "add_credits") {
      const amount = window.prompt("Enter credits to add:")
      if (!amount) return
      try {
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ credits: (user.credits || 0) + Number(amount) }),
        })
        if (!res.ok) throw new Error("Failed to add credits")
        fetchUsers()
      } catch (e: any) { setMenuError(e.message) }
    } else if (action === "suspend") {
      const newStatus = user.status === "suspended" ? "active" : "suspended"
      try {
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }),
        })
        if (!res.ok) throw new Error("Failed to update status")
        fetchUsers()
      } catch (e: any) { setMenuError(e.message) }
    }
  }

  const planColors: Record<string, string> = {
    free: "bg-[#A7B0C0]/10 text-[#A7B0C0] border-white/[0.06]",
    starter: "bg-[#4CC9F0]/10 text-[#4CC9F0] border-[#4CC9F0]/20",
    pro: "bg-[#6D5EF5]/10 text-[#6D5EF5] border-[#6D5EF5]/20",
    enterprise: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
    agency: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">{total.toLocaleString()} total users</p>
        </div>
        <button onClick={openCreate} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search users..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5]/50 transition-all"
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

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Plan</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Joined</th>
                <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="w-5 h-5 animate-spin text-[#A7B0C0] mx-auto" /></td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="p-8 text-center text-xs text-red-400">{error}</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-xs text-[#A7B0C0]">No users found</td></tr>
              ) : (
                users.map((user: any, i: number) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B5CF6]/20 border border-white/[0.06] flex items-center justify-center text-xs font-bold text-white">
                          {(user.name || user.email || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.name || "Unnamed"}</p>
                          <p className="text-[11px] text-[#A7B0C0]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${planColors[user.plan_id?.toLowerCase()] || planColors.free}`}>
                        {user.plan_id || "free"}
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
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-[#EF4444] transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        <div className="relative" ref={openMenuId === user.id ? menuRef : undefined}>
                          <button onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"><MoreVertical className="w-3.5 h-3.5" /></button>
                          {openMenuId === user.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-[#090B16] border border-white/[0.06] rounded-xl shadow-2xl z-50 overflow-hidden">
                              <button onClick={() => handleMenuAction(user, "change_role")} className="w-full text-left px-4 py-2.5 text-xs text-[#A7B0C0] hover:text-white hover:bg-white/[0.06] transition-all">Change Role</button>
                              <button onClick={() => handleMenuAction(user, "change_status")} className="w-full text-left px-4 py-2.5 text-xs text-[#A7B0C0] hover:text-white hover:bg-white/[0.06] transition-all">Change Status</button>
                              <button onClick={() => handleMenuAction(user, "add_credits")} className="w-full text-left px-4 py-2.5 text-xs text-[#A7B0C0] hover:text-white hover:bg-white/[0.06] transition-all">Add Credits</button>
                              <button onClick={() => handleMenuAction(user, "suspend")} className="w-full text-left px-4 py-2.5 text-xs text-[#A7B0C0] hover:text-white hover:bg-white/[0.06] transition-all">{user.status === "suspended" ? "Activate" : "Suspend"}</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#A7B0C0]">Page {page} of {totalPages} ({total} total)</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-white disabled:opacity-30 hover:bg-white/[0.06] transition-all"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 3, totalPages - 6))
              const p = start + i
              if (p > totalPages) return null
              return (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === p ? "bg-[#6D5EF5] text-white" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}>{p}</button>
              )
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-white disabled:opacity-30 hover:bg-white/[0.06] transition-all"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-[#090B16] border border-white/[0.06] rounded-xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editingUser ? "Edit User" : "Add User"}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#A7B0C0] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B0C0]">Email</label>
                <input value={formState.email} onChange={e => setFormState(f => ({ ...f, email: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B0C0]">Name</label>
                <input value={formState.name} onChange={e => setFormState(f => ({ ...f, name: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Role</label>
                  <select value={formState.role} onChange={e => setFormState(f => ({ ...f, role: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Plan</label>
                  <select value={formState.plan_id} onChange={e => setFormState(f => ({ ...f, plan_id: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30">
                    {plans.length > 0 ? plans.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>) : <option value="free">Free</option>}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.06] transition-all">Cancel</button>
              <button onClick={editingUser ? handleUpdate : handleCreate} disabled={saving} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingUser ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
      {menuError && (
        <div className="fixed bottom-4 right-4 bg-[#EF4444]/90 backdrop-blur-xl text-white text-xs px-4 py-2.5 rounded-xl shadow-lg z-50">
          {menuError}
        </div>
      )}
    </div>
  )
}
