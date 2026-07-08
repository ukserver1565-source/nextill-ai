"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Sparkles, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const exchangedRef = useRef(false)

  useEffect(() => {
    if (exchangedRef.current) return
    exchangedRef.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setError("This reset link has expired or is invalid. Please request a new one.")
          return
        }
        setReady(true)
        window.history.replaceState(null, "", "/reset-password")
      })
      return
    }

    const hash = window.location.hash.slice(1)
    const hashParams = new URLSearchParams(hash)
    const accessToken = hashParams.get("access_token")
    const type = hashParams.get("type")

    if (!accessToken || type !== "recovery") {
      setError("This reset link has expired or is invalid. Please request a new one.")
      return
    }

    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: hashParams.get("refresh_token") || "",
    }).then(({ error }) => {
      if (error) {
        setError("This reset link has expired or is invalid. Please request a new one.")
        return
      }
      setReady(true)
      window.history.replaceState(null, "", "/reset-password")
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess("Password updated successfully.")
    setTimeout(() => router.push("/dashboard"), 2000)
    setLoading(false)
  }

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    setError("")
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError(error.message)
    } else {
      setSuccess("A new reset link has been sent to your email.")
    }
    setResending(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Set New Password</h1>
          <p className="text-sm text-muted mt-1">Enter your new password below</p>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-xs text-success">
              {success}
            </div>
          )}

          {!ready && !error && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted" />
            </div>
          )}

          {error && !ready && (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted">Email address</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="gradient"
                className="w-full"
                disabled={resending || !email}
                onClick={handleResend}
              >
                {resending ? "Sending..." : "Send New Reset Link"}
              </Button>
            </div>
          )}

          {ready && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
