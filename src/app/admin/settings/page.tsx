"use client"

import { useState, useEffect } from "react"
import { useData, LoadingSkeleton, ErrorState } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Save, Globe, Palette, Mail, Search, Image } from "lucide-react"

const defaultSettings = {
  siteName: "Nextill AI",
  logo: "/logo.png",
  favicon: "/favicon.ico",
  primaryColor: "#6366f1",
  freeDailyLimits: 5,
  maintenanceMode: false,
  maintenanceMessage: "",
  contactEmail: "",
  socialLinks: [{ platform: "Twitter", url: "" }, { platform: "LinkedIn", url: "" }],
  seoMetaDefaults: { title: "", description: "" },
}

export default function SettingsPage() {
  const {data: settingsData, loading, error, refetch} = useData(() => adminApi.settings())
  const [settings, setSettings] = useState({...defaultSettings})

  useEffect(() => {
    if (settingsData) {
      setSettings({
        siteName: settingsData.site_name,
        logo: settingsData.logo || "/logo.png",
        favicon: settingsData.favicon || "/favicon.ico",
        primaryColor: settingsData.primary_color,
        freeDailyLimits: settingsData.free_daily_limits,
        maintenanceMode: settingsData.maintenance_mode || false,
        maintenanceMessage: settingsData.maintenance_message || "",
        contactEmail: settingsData.contact_email || "",
        socialLinks: settingsData.social_links || [],
        seoMetaDefaults: settingsData.seo_meta_defaults || { title: "", description: "" },
      })
    }
  }, [settingsData])

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-2xl font-bold tracking-tight">Website Settings</h1><p className="text-sm text-muted mt-1">Configure your SaaS platform settings</p></div>

      <div className="glass-card rounded-xl p-6 space-y-6">
        <section>
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4"><Globe className="w-4 h-4 text-primary" /> General</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted">Site Name</label>
              <Input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted">Contact Email</label>
              <Input value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted">Logo URL</label>
              <Input value={settings.logo} onChange={(e) => setSettings({ ...settings, logo: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted">Favicon URL</label>
              <Input value={settings.favicon} onChange={(e) => setSettings({ ...settings, favicon: e.target.value })} />
            </div>
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4"><Palette className="w-4 h-4 text-primary" /> Appearance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted">Primary Color</label>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg border border-border" style={{ background: settings.primaryColor }} />
                <Input value={settings.primaryColor} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted">Free Daily Limits</label>
              <Input type="number" value={settings.freeDailyLimits} onChange={(e) => setSettings({ ...settings, freeDailyLimits: parseInt(e.target.value) })} />
            </div>
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4"><Search className="w-4 h-4 text-primary" /> SEO Defaults</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted">Default SEO Title</label>
              <Input value={settings.seoMetaDefaults.title} onChange={(e) => setSettings({ ...settings, seoMetaDefaults: { ...settings.seoMetaDefaults, title: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted">Default Meta Description</label>
              <textarea className="w-full h-20 rounded-lg bg-card border border-border text-sm p-3 outline-none focus:ring-2 focus:ring-primary/30 resize-none" value={settings.seoMetaDefaults.description} onChange={(e) => setSettings({ ...settings, seoMetaDefaults: { ...settings.seoMetaDefaults, description: e.target.value } })} />
            </div>
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4"><Mail className="w-4 h-4 text-primary" /> Social Links</h2>
          <div className="space-y-3">
            {settings.socialLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-medium w-20">{link.platform}</span>
                <Input value={link.url} onChange={(e) => {
                  const newLinks = [...settings.socialLinks]
                  newLinks[i] = { ...newLinks[i], url: e.target.value }
                  setSettings({ ...settings, socialLinks: newLinks })
                }} />
              </div>
            ))}
          </div>
        </section>

        <div className="pt-2">
          <Button variant="gradient" className="gap-2" onClick={async () => {
            try {
              await adminApi.updateSettings({
                site_name: settings.siteName,
                logo: settings.logo,
                favicon: settings.favicon,
                primary_color: settings.primaryColor,
                free_daily_limits: settings.freeDailyLimits,
                maintenance_mode: settings.maintenanceMode,
                maintenance_message: settings.maintenanceMessage,
                contact_email: settings.contactEmail,
                social_links: settings.socialLinks,
                seo_meta_defaults: settings.seoMetaDefaults,
              })
              refetch()
            } catch (e) {
              console.error("Failed to save settings", e)
            }
          }}>
            <Save className="w-4 h-4" /> Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
