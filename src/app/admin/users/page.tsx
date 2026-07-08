"use client"

import { useState } from "react"
import { AdminTable } from "@/components/admin/admin-table"
import { AdminSearch } from "@/components/admin/admin-search"
import { AdminModal } from "@/components/admin/admin-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useData, LoadingSkeleton, ErrorState } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"
import { roleColors, planColors, statusColors, formatDate } from "@/lib/admin-utils"
import type { AdminUser } from "@/lib/admin-types"
import { Download, UserPlus, MoreHorizontal } from "lucide-react"

export default function UsersPage() {
  const {data, loading, error, refetch} = useData(() => adminApi.users())
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [planFilter, setPlanFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ name: "", email: "", role: "user", plan: "free" })

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const users = data?.data || []

  const filtered = users.filter((u: AdminUser) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    const matchesPlan = planFilter === "all" || u.plan === planFilter
    return matchesSearch && matchesRole && matchesPlan
  })

  const handleAddUser = async () => {
    if (!addForm.name || !addForm.email) return
    try {
      await adminApi.updateUser("new", { ...addForm, credits: 0 })
      setShowAddModal(false)
      setAddForm({ name: "", email: "", role: "user", plan: "free" })
      refetch()
    } catch (e) { console.error(e) }
  }

  const columns = [
    { key: "name", label: "User", render: (u: AdminUser) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-border flex items-center justify-center text-xs font-bold">
          {u.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <p className="text-xs font-medium">{u.name}</p>
          <p className="text-[10px] text-muted">{u.email}</p>
        </div>
      </div>
    )},
    { key: "role", label: "Role", render: (u: AdminUser) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${roleColors[u.role]}`}>{u.role}</span>
    )},
    { key: "plan", label: "Plan", render: (u: AdminUser) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${planColors[u.plan]}`}>{u.plan}</span>
    )},
    { key: "status", label: "Status", render: (u: AdminUser) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[u.status]}`}>{u.status}</span>
    )},
    { key: "credits", label: "Credits", render: (u: AdminUser) => (
      <span className="text-xs font-medium">{u.credits.toLocaleString()}</span>
    )},
    { key: "articlesGenerated", label: "Articles", render: (u: AdminUser) => (
      <span className="text-xs">{u.articlesGenerated.toLocaleString()}</span>
    )},
    { key: "createdAt", label: "Joined", render: (u: AdminUser) => (
      <span className="text-[11px] text-muted">{formatDate(u.createdAt)}</span>
    )},
    { key: "lastLogin", label: "Last Login", render: (u: AdminUser) => (
      <span className="text-[11px] text-muted">{u.lastLogin}</span>
    )},
    { key: "actions", label: "", className: "text-right", render: (u: AdminUser) => (
      <button className="p-1 rounded-md text-muted hover:text-foreground hover:bg-card transition-colors" onClick={() => { setSelectedUser(u); setShowUserModal(true) }}>
        <MoreHorizontal className="w-4 h-4" />
      </button>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted mt-1">Manage all registered users ({data?.total || 0} total)</p>
        </div>
        <Button variant="gradient" size="sm" className="gap-1.5 rounded-lg" onClick={() => setShowAddModal(true)}>
          <UserPlus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full max-w-xs">
          <AdminSearch value={search} onChange={setSearch} placeholder="Search by name or email..." />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-10 px-3 rounded-lg bg-card border border-border text-xs outline-none focus:ring-2 focus:ring-primary/30">
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="h-10 px-3 rounded-lg bg-card border border-border text-xs outline-none focus:ring-2 focus:ring-primary/30">
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="agency">Agency</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={() => {
          const csv = [["Name","Email","Role","Plan","Status","Credits","Articles","Joined","Last Login"], ...filtered.map((u: AdminUser) => [u.name,u.email,u.role,u.plan,u.status,u.credits.toString(),u.articlesGenerated.toString(),formatDate(u.createdAt),u.lastLogin])].map(r => r.join(",")).join("\n")
          const blob = new Blob([csv], { type: "text/csv" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a"); a.href = url; a.download = "users.csv"; a.click()
          URL.revokeObjectURL(url)
        }}>
          <Download className="w-3.5 h-3.5" /> Export
        </Button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <AdminTable columns={columns} data={filtered} keyField="id" onRowClick={(u) => { setSelectedUser(u); setShowUserModal(true) }} />
      </div>

      <AdminModal open={showUserModal} onClose={() => setShowUserModal(false)} title={selectedUser?.name || "User Details"} size="md">
        {selectedUser && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-muted block text-xs">Email</span><span className="font-medium">{selectedUser.email}</span></div>
              <div><span className="text-muted block text-xs">Role</span><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${roleColors[selectedUser.role]}`}>{selectedUser.role}</span></div>
              <div><span className="text-muted block text-xs">Plan</span><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${planColors[selectedUser.plan]}`}>{selectedUser.plan}</span></div>
              <div><span className="text-muted block text-xs">Status</span><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[selectedUser.status]}`}>{selectedUser.status}</span></div>
              <div><span className="text-muted block text-xs">Credits</span><span className="font-medium">{selectedUser.credits.toLocaleString()}</span></div>
              <div><span className="text-muted block text-xs">Articles Generated</span><span className="font-medium">{selectedUser.articlesGenerated.toLocaleString()}</span></div>
              <div><span className="text-muted block text-xs">Joined</span><span className="font-medium">{formatDate(selectedUser.createdAt)}</span></div>
              <div><span className="text-muted block text-xs">Last Login</span><span className="font-medium">{selectedUser.lastLogin}</span></div>
            </div>
          </div>
        )}
      </AdminModal>

      <AdminModal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New User" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1">Name</label>
            <Input value={addForm.name} onChange={(e) => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" className="bg-card border-border text-xs" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Email</label>
            <Input value={addForm.email} onChange={(e) => setAddForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" className="bg-card border-border text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Role</label>
              <select value={addForm.role} onChange={(e) => setAddForm(f => ({ ...f, role: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-card border border-border text-xs outline-none focus:ring-2 focus:ring-primary/30">
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Plan</label>
              <select value={addForm.plan} onChange={(e) => setAddForm(f => ({ ...f, plan: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-card border border-border text-xs outline-none focus:ring-2 focus:ring-primary/30">
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="agency">Agency</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={handleAddUser}>Add User</Button>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
