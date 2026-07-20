"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Plus, Edit3, Trash2, ExternalLink, ChevronLeft, ChevronRight,
  Loader2, X, Copy, Eye, EyeOff, Image as ImageIcon, Upload,
  Bold, Italic, Heading1, Heading2, List, Link as LinkIcon, Type,
  AlertTriangle, BarChart3, Calendar
} from "lucide-react"

const PAGE_SIZE = 10

interface BlogCategory {
  id: string
  name: string
  slug: string
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  featured_image_url: string | null
  category_id: string | null
  status: "draft" | "published"
  seo_title: string | null
  meta_description: string | null
  view_count: number
  created_at: string
  updated_at: string
  published_at: string | null
}

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featured_image_url: "",
  category_id: "",
  status: "draft" as "draft" | "published",
  seo_title: "",
  meta_description: "",
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 200)
}

function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const execCmd = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val)
    editorRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault()
      execCmd("insertHTML", "&nbsp;&nbsp;&nbsp;&nbsp;")
    }
  }

  const updateFormats = () => {
    const formats = new Set<string>()
    if (document.queryCommandState("bold")) formats.add("bold")
    if (document.queryCommandState("italic")) formats.add("italic")
    if (document.queryCommandState("insertUnorderedList")) formats.add("list")
    setActiveFormats(formats)
  }

  const insertLink = () => {
    const url = prompt("Enter URL:")
    if (url) execCmd("createLink", url)
  }

  const insertInlineImage = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/png,image/jpeg,image/webp,image/gif"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const formData = new FormData()
      formData.append("file", file)
      try {
        const res = await fetch("/api/admin/upload/blog-image", { method: "POST", body: formData })
        if (res.ok) {
          const { url } = await res.json()
          execCmd("insertHTML", `<img src="${url}" alt="" style="max-width:100%;border-radius:8px;margin:8px 0" />`)
        }
      } catch (err) {
        console.error("Image upload failed:", err)
      }
    }
    input.click()
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 flex-wrap p-2 bg-[#0D1120] rounded-t-xl border border-white/[0.06] border-b-0">
        <button type="button" onClick={() => execCmd("bold")} className={`p-1.5 rounded-lg transition-colors ${activeFormats.has("bold") ? "bg-[#6D5EF5]/20 text-[#6D5EF5]" : "text-[#A7B0C0] hover:text-white hover:bg-white/[0.06]"}`} title="Bold"><Bold className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => execCmd("italic")} className={`p-1.5 rounded-lg transition-colors ${activeFormats.has("italic") ? "bg-[#6D5EF5]/20 text-[#6D5EF5]" : "text-[#A7B0C0] hover:text-white hover:bg-white/[0.06]"}`} title="Italic"><Italic className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-white/[0.06] mx-1" />
        <button type="button" onClick={() => execCmd("formatBlock", "h2")} className="p-1.5 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-white/[0.06] transition-colors" title="Heading 2"><Heading1 className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => execCmd("formatBlock", "h3")} className="p-1.5 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-white/[0.06] transition-colors" title="Heading 3"><Heading2 className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => execCmd("formatBlock", "p")} className="p-1.5 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-white/[0.06] transition-colors" title="Paragraph"><Type className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-white/[0.06] mx-1" />
        <button type="button" onClick={() => execCmd("insertUnorderedList")} className={`p-1.5 rounded-lg transition-colors ${activeFormats.has("list") ? "bg-[#6D5EF5]/20 text-[#6D5EF5]" : "text-[#A7B0C0] hover:text-white hover:bg-white/[0.06]"}`} title="Bullet List"><List className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={insertLink} className="p-1.5 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-white/[0.06] transition-colors" title="Insert Link"><LinkIcon className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={insertInlineImage} className="p-1.5 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-white/[0.06] transition-colors" title="Insert Image"><ImageIcon className="w-3.5 h-3.5" /></button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] max-h-[600px] overflow-y-auto p-4 bg-[#0D1120] rounded-b-xl border border-white/[0.06] border-t-0 text-sm text-white prose prose-invert prose-headings:text-white prose-p:text-[#A7B0C0] prose-a:text-[#6D5EF5] prose-img:rounded-lg prose-img:max-w-full focus:outline-none"
        onInput={() => {
          onChange(editorRef.current?.innerHTML || "")
        }}
        onKeyDown={handleKeyDown}
        onMouseUp={updateFormats}
        onKeyUp={updateFormats}
        data-placeholder="Start writing your post..."
      />
      <style jsx>{`
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #A7B0C0;
          opacity: 0.5;
        }
      `}</style>
    </div>
  )
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [formState, setFormState] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
      })
      if (search) params.set("search", search)
      if (statusFilter) params.set("filter[status]", statusFilter)
      if (categoryFilter) params.set("filter[category_id]", categoryFilter)
      const res = await fetch(`/api/admin/blog?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setPosts(json.data || [])
      setTotal(json.total || 0)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, categoryFilter])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  // Load categories from a dedicated endpoint
  useEffect(() => {
    fetch("/api/admin/blog/categories")
      .then(r => r.ok ? r.json() : [])
      .then((data: BlogCategory[]) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const openCreate = () => {
    setEditingPost(null)
    setFormState(emptyForm)
    setShowEditor(true)
  }

  const openEdit = (post: BlogPost) => {
    setEditingPost(post)
    setFormState({
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      featured_image_url: post.featured_image_url || "",
      category_id: post.category_id || "",
      status: post.status || "draft",
      seo_title: post.seo_title || "",
      meta_description: post.meta_description || "",
    })
    setShowEditor(true)
  }

  const handleSave = async (publishStatus?: "draft" | "published") => {
    setSaving(true)
    setError("")
    const status = publishStatus || formState.status
    const payload = {
      ...formState,
      status,
      ...(status === "published" && editingPost?.status !== "published"
        ? { published_at: new Date().toISOString() }
        : {}),
    }
    try {
      const url = editingPost ? `/api/admin/blog/${editingPost.id}` : "/api/admin/blog"
      const method = editingPost ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP ${res.status}`)
      }
      setShowEditor(false)
      setEditingPost(null)
      fetchPosts()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete post")
      setDeleteConfirm(null)
      fetchPosts()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const handleDuplicate = async (post: BlogPost) => {
    try {
      const uid = crypto.randomUUID().slice(0, 8)
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${post.title} (Copy)`,
          slug: `${post.slug}-copy-${uid}`,
          excerpt: post.excerpt,
          content: post.content,
          featured_image_url: post.featured_image_url,
          category_id: post.category_id,
          status: "draft",
          seo_title: post.seo_title,
          meta_description: post.meta_description,
        }),
      })
      if (!res.ok) throw new Error("Failed to duplicate")
      fetchPosts()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to duplicate")
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/admin/upload/blog-image", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const { url } = await res.json()
      setFormState(f => ({ ...f, featured_image_url: url }))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Image upload failed")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    setCreatingCategory(true)
    try {
      // We need a category creation endpoint
      const slug = slugify(newCategoryName)
      const res = await fetch("/api/admin/blog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim(), slug }),
      })
      if (!res.ok) throw new Error("Failed to create category")
      const cat = await res.json()
      setCategories(prev => [...prev, cat])
      setFormState(f => ({ ...f, category_id: cat.id }))
      setNewCategoryName("")
      setShowNewCategoryInput(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create category")
    } finally {
      setCreatingCategory(false)
    }
  }

  const autoSuggestExcerpt = () => {
    if (formState.excerpt || !formState.content) return
    // Strip HTML tags and take first 160 chars
    const text = formState.content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
    setFormState(f => ({ ...f, excerpt: text.slice(0, 160) }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage your blog content</p>
        </div>
        <button
          onClick={openCreate}
          className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20"
        >
          <Plus className="w-4 h-4" /> New Post
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
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search posts..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
          className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 transition-all"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-sm text-[#A7B0C0] mb-4">No blog posts yet</p>
            <button onClick={openCreate} className="h-9 px-4 rounded-xl bg-[#6D5EF5] text-white text-xs font-medium hover:opacity-90 transition-opacity">
              Create your first post
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Title</th>
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Category</th>
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Views</th>
                  <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Date</th>
                  <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, i) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {post.featured_image_url ? (
                          <img src={post.featured_image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/[0.06]" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-[#A7B0C0]" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{post.title}</p>
                          <p className="text-[10px] text-[#A7B0C0]">/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {(() => {
                        const cat = categories.find(c => c.id === post.category_id)
                        return cat ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#6D5EF5]/10 text-[#6D5EF5] border border-[#6D5EF5]/20">
                            {cat.name}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#A7B0C0]">—</span>
                        )
                      })()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                        post.status === "published"
                          ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                          : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                      }`}>
                        {post.status === "published" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {post.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-[#A7B0C0] flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        {post.view_count || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-[#A7B0C0]">
                        {post.published_at ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.published_at).toLocaleDateString()}
                          </div>
                        ) : (
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-[#4CC9F0] transition-all"
                          title="View public"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(post)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-[#F59E0B] transition-all"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(post)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(post.id)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-[#EF4444] transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#A7B0C0]">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-white disabled:opacity-30 hover:bg-white/[0.06] transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let p: number
              if (totalPages <= 5) {
                p = i + 1
              } else if (page <= 3) {
                p = i + 1
              } else if (page >= totalPages - 2) {
                p = totalPages - 4 + i
              } else {
                p = page - 2 + i
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === p ? "bg-[#6D5EF5] text-white" : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"}`}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-white disabled:opacity-30 hover:bg-white/[0.06] transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
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
                  <h3 className="text-sm font-bold text-white">Delete Post</h3>
                  <p className="text-xs text-[#A7B0C0]">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-xs text-[#A7B0C0] mb-6">
                Are you sure you want to permanently delete this post? All content and data will be lost.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="h-9 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.06] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                  className="h-9 px-4 rounded-xl bg-[#EF4444] text-white text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8"
            onClick={() => setShowEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#090B16] border border-white/[0.06] rounded-xl w-full max-w-4xl mx-4 space-y-0"
              onClick={e => e.stopPropagation()}
            >
              {/* Editor Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                <h2 className="text-lg font-bold text-white">
                  {editingPost ? "Edit Post" : "New Post"}
                </h2>
                <button onClick={() => setShowEditor(false)} className="text-[#A7B0C0] hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Title *</label>
                  <input
                    value={formState.title}
                    onChange={e => {
                      const title = e.target.value
                      setFormState(f => ({
                        ...f,
                        title,
                        slug: editingPost ? f.slug : slugify(title),
                      }))
                    }}
                    placeholder="Enter post title..."
                    className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">URL Slug</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#A7B0C0] whitespace-nowrap">/blog/</span>
                    <input
                      value={formState.slug}
                      onChange={e => setFormState(f => ({ ...f, slug: slugify(e.target.value) }))}
                      placeholder="post-url-slug"
                      className="flex-1 h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30"
                    />
                  </div>
                </div>

                {/* Featured Image */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Featured Image</label>
                  <div className="relative">
                    {formState.featured_image_url ? (
                      <div className="relative group rounded-xl overflow-hidden border border-white/[0.06]">
                        <img src={formState.featured_image_url} alt="Featured" className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <label className="h-9 px-4 rounded-xl bg-[#6D5EF5] text-white text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2">
                            <Upload className="w-3.5 h-3.5" /> Replace
                            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormState(f => ({ ...f, featured_image_url: "" }))}
                            className="h-9 px-4 rounded-xl bg-[#EF4444] text-white text-xs font-medium hover:opacity-90 transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-white/[0.1] hover:border-[#6D5EF5]/30 bg-[#151C2E]/40 cursor-pointer transition-all group">
                        {uploadingImage ? (
                          <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin" />
                        ) : (
                          <>
                            <ImageIcon className="w-8 h-8 text-[#A7B0C0] group-hover:text-[#6D5EF5] transition-colors mb-2" />
                            <p className="text-xs text-[#A7B0C0] group-hover:text-[#6D5EF5] transition-colors">Click to upload featured image</p>
                            <p className="text-[10px] text-[#A7B0C0]/50 mt-1">PNG, JPG, WebP, GIF — Max 5MB</p>
                          </>
                        )}
                        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Category</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={formState.category_id}
                      onChange={e => setFormState(f => ({ ...f, category_id: e.target.value }))}
                      className="flex-1 h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30"
                    >
                      <option value="">No category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                      className="h-10 px-3 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white hover:bg-white/[0.06] transition-all text-xs font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> New
                    </button>
                  </div>
                  {showNewCategoryInput && (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleCreateCategory()}
                        placeholder="Category name..."
                        className="flex-1 h-9 px-3 rounded-lg bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={creatingCategory || !newCategoryName.trim()}
                        className="h-9 px-3 rounded-lg bg-[#6D5EF5] text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {creatingCategory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Content Editor */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A7B0C0]">Content</label>
                  <RichEditor
                    value={formState.content}
                    onChange={v => setFormState(f => ({ ...f, content: v }))}
                  />
                </div>

                {/* Excerpt */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#A7B0C0]">Excerpt</label>
                    {!formState.excerpt && formState.content && (
                      <button
                        type="button"
                        onClick={autoSuggestExcerpt}
                        className="text-[10px] text-[#6D5EF5] hover:underline"
                      >
                        Auto-suggest from content
                      </button>
                    )}
                  </div>
                  <textarea
                    value={formState.excerpt}
                    onChange={e => setFormState(f => ({ ...f, excerpt: e.target.value }))}
                    placeholder="A brief summary of the post..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 resize-none"
                  />
                </div>

                {/* SEO Fields */}
                <div className="p-4 rounded-xl bg-[#0D1120] border border-white/[0.06] space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">SEO Settings</h3>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-[#A7B0C0]">Meta Title</label>
                      <span className={`text-[10px] ${(formState.seo_title || formState.title).length > 60 ? "text-[#F59E0B]" : "text-[#A7B0C0]"}`}>
                        {(formState.seo_title || formState.title).length}/60
                      </span>
                    </div>
                    <input
                      value={formState.seo_title}
                      onChange={e => setFormState(f => ({ ...f, seo_title: e.target.value }))}
                      placeholder={formState.title || "SEO title (defaults to post title)"}
                      className="w-full h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-[#A7B0C0]">Meta Description</label>
                      <span className={`text-[10px] ${(formState.meta_description || formState.excerpt).length > 155 ? "text-[#F59E0B]" : "text-[#A7B0C0]"}`}>
                        {(formState.meta_description || formState.excerpt).length}/155
                      </span>
                    </div>
                    <textarea
                      value={formState.meta_description}
                      onChange={e => setFormState(f => ({ ...f, meta_description: e.target.value }))}
                      placeholder={formState.excerpt || "SEO description (defaults to excerpt)"}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-sm placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 resize-none"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-4">
                  <label className="text-xs font-medium text-[#A7B0C0]">Status</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormState(f => ({ ...f, status: "draft" }))}
                      className={`h-8 px-4 rounded-lg text-xs font-medium transition-all ${
                        formState.status === "draft"
                          ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                          : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"
                      }`}
                    >
                      Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormState(f => ({ ...f, status: "published" }))}
                      className={`h-8 px-4 rounded-lg text-xs font-medium transition-all ${
                        formState.status === "published"
                          ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20"
                          : "bg-[#151C2E]/80 border border-white/[0.06] text-[#A7B0C0] hover:text-white"
                      }`}
                    >
                      Published
                    </button>
                  </div>
                </div>
              </div>

              {/* Editor Footer */}
              <div className="flex items-center justify-between p-4 border-t border-white/[0.06]">
                <button
                  onClick={() => setShowEditor(false)}
                  className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.06] transition-all"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSave("draft")}
                    disabled={saving || !formState.title.trim()}
                    className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-white text-xs font-medium flex items-center gap-2 hover:bg-white/[0.06] transition-all disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSave("published")}
                    disabled={saving || !formState.title.trim()}
                    className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#22C55E]/20 disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {editingPost?.status === "published" ? "Update & Publish" : "Publish"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
