"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Wrench, Shield, AlertTriangle, Save, Eye } from "lucide-react"
import { useData, LoadingSkeleton, ErrorState } from "@/lib/hooks/use-admin-data"
import { adminApi } from "@/lib/admin-api"

export default function MaintenancePage() {
  const [enabled, setEnabled] = useState(false)
  const [message, setMessage] = useState("")
  const [allowAdmins, setAllowAdmins] = useState(true)
  const { data: settingsData, loading, error, refetch } = useData(() => adminApi.settings())

  useEffect(() => {
    if (settingsData) {
      setEnabled(settingsData.maintenance_mode || false)
      setMessage(settingsData.maintenance_message || "")
    }
  }, [settingsData])

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-2xl font-bold tracking-tight">Maintenance Mode</h1><p className="text-sm text-muted mt-1">Control site accessibility during maintenance</p></div>

      <div className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between p-4 rounded-xl bg-warning/5 border border-warning/20">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", enabled ? "bg-danger/10" : "bg-success/10")}>
              <Wrench className={cn("w-6 h-6", enabled ? "text-danger" : "text-success")} />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Maintenance Mode</h3>
              <p className="text-xs text-muted">{enabled ? "Site is currently in maintenance mode" : "Site is publicly accessible"}</p>
            </div>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={cn(
              "relative w-12 h-6 rounded-full transition-colors",
              enabled ? "bg-danger" : "bg-zinc-700"
            )}
          >
            <div className={cn(
              "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform",
              enabled ? "translate-x-6" : "translate-x-0.5"
            )} />
          </button>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted">Maintenance Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-24 rounded-lg bg-card border border-border text-sm p-3 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Enter maintenance message..."
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-card">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs font-medium">Allow Admin Access</p>
                <p className="text-[10px] text-muted">Admins can still access the site</p>
              </div>
            </div>
            <button
              onClick={() => setAllowAdmins(!allowAdmins)}
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors",
                allowAdmins ? "bg-primary" : "bg-zinc-700"
              )}
            >
              <div className={cn(
                "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform",
                allowAdmins ? "translate-x-6" : "translate-x-0.5"
              )} />
            </button>
          </div>
        </div>

        {enabled && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-warning">Warning: Maintenance mode is active</p>
              <p className="text-[10px] text-muted">Regular users will see the maintenance page instead of the dashboard.</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button variant="gradient" className="gap-2" onClick={async () => {
            try {
              await adminApi.updateSettings({
                maintenance_mode: enabled,
                maintenance_message: message,
              })
              refetch()
            } catch (e) {
              console.error("Failed to save maintenance settings", e)
            }
          }}><Save className="w-4 h-4" /> Save Changes</Button>
          <Button variant="outline" className="gap-2" onClick={() => window.open("/", "_blank")}><Eye className="w-4 h-4" /> Preview</Button>
        </div>
      </div>
    </div>
  )
}
