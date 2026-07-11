"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, Plus, Edit3, Trash2, ExternalLink, ChevronLeft, ChevronRight, Loader2, FileText, X } from "lucide-react"

const PAGE_SIZE = 8

const emptyForm = { title: "", slug: "", category: "", status: "draft", author: "" }

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState<any | null>(null)
  const [formState, setFormState] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: PAGE_SIZE.toString() })
      if (search) params.set("search", search)
      const res = await fetch(`/api/admin/blog?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setPosts(json.data || [])
      setTotal(json.total || 0)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const openCreate = () => {
    setEditingPost(null)
    setFormState(emptyForm)
    setShowModal(true)
  }

  const openEdit = (post: any) => {
    setEditingPost(post)
    setFormState({
      title: post.title || "",
      slug: post.slug || "",
      category: post.category || "",
      status: post.status || "draft",
      author: post.author || "",
    })
    setShowModal(true)
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      })
      if (!res.ok) throw new Error("Failed to create post")
      setShowModal(false)
      fetchPosts()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingPost) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/blog/${editingPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      })
      if (!res.ok) throw new Error("Failed to update post")
      setShowModal(false)
      setEditingPost(null)
      fetchPosts()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete post")
      fetchPosts()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-8 text-center max-w-sm">
          <p className="text-sm text-[#EF4444] mb-3">Failed to load blog posts</p>
          <p className="text-xs text-[#A7B0C0] mb-4">{error}</p>
          <button onClick={fetchPosts} className="h-9 px-4 rounded-xl bg-[#6D5EF5] text-white text-xs font-medium hover:opacity-90 transition-opacity">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage blog content</p>
        </div>
        <button onClick={openCreate} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search posts..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all"
        />
      </div>

      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Title</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Author</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Date</th>
                <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post: any, i: number) => (
                <motion.tr
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4">
                    <p className="text-sm font-medium text-white">{post.title}</p>
                    <p className="text-[10px] text-[#A7B0C0]">/{post.slug}</p>
                  </td>
                  <td className="p-4 text-xs text-white">{post.author || "—"}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                      post.status === "published"
                        ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                        : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-[#A7B0C0]">{post.created_at ? new Date(post.created_at).toLocaleDateString() : "—"}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => window.open(`/blog/${post.slug}`, '_blank')} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-[#4CC9F0] transition-all"><ExternalLink className="w-3.5 h-3.5" /></button>
                      <button onClick={() => openEdit(post)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-[#EF4444] transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
              </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#A7B0C0]">Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-white disabled:opacity-30 hover:bg-white/[0.06] transition-all"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === p ? "bg-[#6D5EF5] text-white" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-white disabled:opacity-30 hover:bg-white/[0.06] transition-all"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-[#090B16] border border-white/[0.06] rounded-xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editingPost ? "Edit Post" : "New Post"}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#A7B0C0] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B0C0]">Title</label>
                <input value={formState.title} onChange={e => setFormState(f => ({ ...f, title: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B0C0]">Slug</label>
                <input value={formState.slug} onChange={e => setFormState(f => ({ ...f, slug: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B0C0]">Category</label>
                <input value={formState.category} onChange={e => setFormState(f => ({ ...f, category: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Status</label>
                  <select value={formState.status} onChange={e => setFormState(f => ({ ...f, status: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Author</label>
                  <input value={formState.author} onChange={e => setFormState(f => ({ ...f, author: e.target.value }))} className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.06] transition-all">Cancel</button>
              <button onClick={editingPost ? handleUpdate : handleCreate} disabled={saving} className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingPost ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
