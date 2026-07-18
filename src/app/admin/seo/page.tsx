"use client"

import { useState, useEffect } from "react"
import { Save, Search, FileCode, BarChart3, Loader2 } from "lucide-react"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.adultpulse.co.uk"

export default function SEOPage() {
  const [form, setForm] = useState({
    metaTitle: "Nextill AI - AI-Powered SEO & Content Platform",
    metaDescription: "Nextill AI helps you generate SEO-optimized content with AI. Tools include AI writer, keyword research, and rank tracking.",
    googleAnalyticsId: "G-XXXXXXXXXX",
    robotsTxt: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml`,
    sitemapUrl: `${siteUrl}/sitemap.xml`,
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(data => {
        if (data.seo_meta_title) setForm(f => ({ ...f, metaTitle: data.seo_meta_title }))
        if (data.seo_meta_description) setForm(f => ({ ...f, metaDescription: data.seo_meta_description }))
        if (data.seo_ga_id) setForm(f => ({ ...f, googleAnalyticsId: data.seo_ga_id }))
        if (data.seo_robots_txt) setForm(f => ({ ...f, robotsTxt: data.seo_robots_txt }))
        if (data.seo_sitemap_url) setForm(f => ({ ...f, sitemapUrl: data.seo_sitemap_url }))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seo_meta_title: form.metaTitle,
          seo_meta_description: form.metaDescription,
          seo_ga_id: form.googleAnalyticsId,
          seo_robots_txt: form.robotsTxt,
          seo_sitemap_url: form.sitemapUrl,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) { setSaveError(e.message || "Failed to save") } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">SEO Settings</h1>
        <p className="text-sm text-[#A7B0C0] mt-1">Manage meta tags, analytics, and robots.txt</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-[#6D5EF5]" /> Global Meta Tags
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#A7B0C0]">Meta Title</label>
                <input value={form.metaTitle} onChange={(e) => setForm(f => ({ ...f, metaTitle: e.target.value }))} className="w-full h-11 px-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5]/50 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#A7B0C0]">Meta Description</label>
                <textarea value={form.metaDescription} onChange={(e) => setForm(f => ({ ...f, metaDescription: e.target.value }))} rows={3} className="w-full px-4 py-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5]/50 transition-all resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#4CC9F0]" /> Google Analytics
            </h2>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#A7B0C0]">Google Analytics ID</label>
              <input value={form.googleAnalyticsId} onChange={(e) => setForm(f => ({ ...f, googleAnalyticsId: e.target.value }))} placeholder="G-XXXXXXXXXX" className="w-full h-11 px-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5]/50 transition-all" />
            </div>
          </div>

          <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#8B5CF6]" /> Robots.txt & Sitemap
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#A7B0C0]">Robots.txt</label>
                <textarea value={form.robotsTxt} onChange={(e) => setForm(f => ({ ...f, robotsTxt: e.target.value }))} rows={6} className="w-full px-4 py-3 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5]/50 transition-all resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#A7B0C0]">Sitemap URL</label>
                <input value={form.sitemapUrl} onChange={(e) => setForm(f => ({ ...f, sitemapUrl: e.target.value }))} className="w-full h-11 px-4 rounded-xl bg-[#090B16] border border-white/[0.06] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5]/50 transition-all" />
              </div>
            </div>
          </div>

          {saveError && <p className="text-xs text-[#EF4444]">{saveError}</p>}
          <button onClick={handleSave} disabled={saving} className="h-11 px-6 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saved ? "Saved!" : "Save SEO Settings"}
          </button>
        </div>
      )}
    </div>
  )
}
