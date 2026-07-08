"use client"

import { useState } from "react"
import { AdminTable } from "@/components/admin/admin-table"
import { AdminSearch } from "@/components/admin/admin-search"
import { AdminModal } from "@/components/admin/admin-modal"
import { useData, LoadingSkeleton, ErrorState } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"
import type { BlogPost } from "@/lib/admin-types"
import { formatDate, statusColors } from "@/lib/admin-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit3, Trash2, ExternalLink } from "lucide-react"

const defaultForm = { title: "", slug: "", category: "AI & SEO", content: "", seo_title: "", meta_description: "", status: "draft" as "draft" | "published", author: "" }

export default function BlogPage() {
  const [search, setSearch] = useState("")
  const {data, loading, error, refetch} = useData(() => adminApi.blogPosts())
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState<any>(null)
  const [form, setForm] = useState(defaultForm)

  const blogCategories = ["AI & SEO", "Content Writing", "SEO", "SEO Tools", "AI", "Product Updates", "Tutorials"]
  const filtered = (data?.data || []).filter((p: any) => p.title.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const handleSave = async () => {
    try {
      if (editingPost) {
        await adminApi.updateBlogPost(editingPost.id, form)
      } else {
        await adminApi.createBlogPost(form)
      }
      setShowModal(false)
      setEditingPost(null)
      setForm(defaultForm)
      refetch()
    } catch (e) { console.error(e) }
  }

  const openEdit = (post: any) => {
    setEditingPost(post)
    setForm({
      title: post.title,
      slug: post.slug,
      category: post.category,
      content: post.content || "",
      seo_title: post.seo_title || "",
      meta_description: post.meta_description || "",
      status: post.status,
      author: post.author,
    })
    setShowModal(true)
  }

  const openNew = () => {
    setEditingPost(null)
    setForm(defaultForm)
    setShowModal(true)
  }

  const columns = [
    { key: "title", label: "Title", render: (p: BlogPost) => (
      <div><p className="text-xs font-medium">{p.title}</p><p className="text-[10px] text-muted">/{p.slug}</p></div>
    )},
    { key: "category", label: "Category", render: (p: BlogPost) => (
      <Badge variant="info" size="sm">{p.category}</Badge>
    )},
    { key: "status", label: "Status", render: (p: BlogPost) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[p.status]}`}>{p.status}</span>
    )},
    { key: "author", label: "Author", render: (p: BlogPost) => (
      <span className="text-xs">{p.author}</span>
    )},
    { key: "date", label: "Updated", render: (p: any) => (
      <span className="text-[11px] text-muted">{formatDate(p.updated_at)}</span>
    )},
    { key: "actions", label: "", className: "text-right", render: (p: BlogPost) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon-sm" onClick={() => window.open(`/${p.slug}`, "_blank")}><ExternalLink className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(p)}><Edit3 className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon-sm" className="text-danger" onClick={async () => {
          if (confirm(`Delete "${p.title}"?`)) { try { await adminApi.deleteBlogPost(p.id); refetch() } catch (e) { console.error(e) } }
        }}><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Blog Manager</h1><p className="text-sm text-muted mt-1">Manage blog posts and categories</p></div>
        <Button variant="gradient" size="sm" className="gap-1.5 rounded-lg" onClick={openNew}><Plus className="w-4 h-4" /> New Post</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full max-w-xs"><AdminSearch value={search} onChange={setSearch} placeholder="Search posts..." /></div>
        <div className="flex flex-wrap gap-1">
          {blogCategories.map((cat) => (
            <Badge key={cat} variant="outline" size="sm" className="cursor-pointer hover:bg-card-hover">{cat}</Badge>
          ))}
        </div>
      </div>
      <div className="glass-card rounded-xl overflow-hidden">
        <AdminTable columns={columns} data={filtered} keyField="id" />
      </div>

      <AdminModal open={showModal} onClose={() => setShowModal(false)} title={editingPost ? "Edit Post" : "New Post"} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Title</label>
              <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} className="bg-card border-border text-xs" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Slug</label>
              <Input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className="bg-card border-border text-xs font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-card border border-border text-xs outline-none">
                {blogCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Author</label>
              <Input value={form.author} onChange={(e) => setForm(f => ({ ...f, author: e.target.value }))} className="bg-card border-border text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">SEO Title</label>
              <Input value={form.seo_title} onChange={(e) => setForm(f => ({ ...f, seo_title: e.target.value }))} className="bg-card border-border text-xs" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Meta Description</label>
              <Input value={form.meta_description} onChange={(e) => setForm(f => ({ ...f, meta_description: e.target.value }))} className="bg-card border-border text-xs" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Content</label>
            <textarea value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))} rows={6} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-xs outline-none focus:ring-2 focus:ring-primary/30 resize-y font-mono" />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
              <input type="checkbox" checked={form.status === "published"} onChange={(e) => setForm(f => ({ ...f, status: e.target.checked ? "published" : "draft" }))} className="rounded border-border" />
              Published
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={handleSave}>{editingPost ? "Save Changes" : "Create Post"}</Button>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
