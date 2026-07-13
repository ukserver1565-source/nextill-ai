"use client"

import { useAuth } from "@/lib/auth/AuthProvider"
import { supabase } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Save, Loader2, User, Mail, Shield, CreditCard } from "lucide-react"

export default function DashboardSettings() {
  const { profile, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) setFullName(profile.full_name || "")
  }, [profile])

  const saveProfile = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("user_id", profile.user_id)
      if (!error) {
        setSaved(true)
        refreshProfile()
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {}
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted mt-1">Manage your profile and preferences</p>
      </div>

      <div className="glass-card rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <User className="w-4 h-4 text-primary-light" /> Profile
        </h3>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted">Full Name</label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted">Email</label>
          <Input value={profile?.email || ""} disabled className="opacity-60" />
        </div>

        <Button variant="gradient" size="sm" className="gap-1.5" onClick={saveProfile} disabled={saving}>
          <Save className="w-4 h-4" /> {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="glass-card rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary-light" /> Account
        </h3>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-xs font-medium">Role</p>
            <p className="text-[10px] text-muted capitalize">{profile?.role || "user"}</p>
          </div>
          <span className="text-xs font-medium capitalize px-2 py-1 rounded-full bg-primary/10 text-primary">{profile?.plan || "free"}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-xs font-medium">AI Credits</p>
            <p className="text-[10px] text-muted">Available balance</p>
          </div>
          <span className="text-xs font-bold">{profile?.credits ?? 0}</span>
        </div>
      </div>
    </div>
  )
}
