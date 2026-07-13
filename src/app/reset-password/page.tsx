"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Sparkles, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)
  const [recoveryMode, setRecoveryMode] = useState(false)
  const [checking, setChecking] = useState(true)
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
          setChecking(false)
          return
        }
        setRecoveryMode(true)
        setChecking(false)
        window.history.replaceState(null, "", "/reset-password")
      }).catch(() => setChecking(false))
      return
    }

    const hash = window.location.hash.slice(1)
    const hashParams = new URLSearchParams(hash)
    const accessToken = hashParams.get("access_token")
    const type = hashParams.get("type")

    if (accessToken && type === "recovery") {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get("refresh_token") || "",
      }).then(({ error }) => {
        if (error) {
          setError("This reset link has expired or is invalid. Please request a new one.")
          setChecking(false)
          return
        }
        setRecoveryMode(true)
        setChecking(false)
        window.history.replaceState(null, "", "/reset-password")
      }).catch(() => setChecking(false))
      return
    }

    if (accessToken) {
      setError("This reset link has expired or is invalid. Please request a new one.")
    }
    setChecking(false)
  }, [])

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setTimeout(() => router.push("/dashboard"), 2000)
  }

  return (
    <div className="min-h-screen bg-[#090B16] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-8 space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] mb-4 shadow-lg shadow-[#6D5EF5]/30">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Reset your password</h1>
            <p className="text-[#A7B0C0] text-sm mt-1">
              {recoveryMode ? "Enter your new password" : "Enter your email to receive a reset link"}
            </p>
          </div>

          {checking && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-[#A7B0C0]" />
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          {sent ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-white font-medium">Check your email</p>
              <p className="text-sm text-[#A7B0C0]">
                We&apos;ve sent a reset link to <span className="text-white">{email}</span>
              </p>
              <Button
                variant="outline"
                className="w-full"
                disabled={resending}
                onClick={async () => {
                  setResending(true)
                  setError("")
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                  })
                  if (error) setError(error.message)
                  setResending(false)
                }}
              >
                {resending ? "Sending..." : "Resend email"}
              </Button>
            </div>
          ) : recoveryMode ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#A7B0C0]">New Password</label>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7B0C0] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" variant="gradient" className="w-full h-11" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
              </Button>
            </form>
          ) : !checking ? (
            <form onSubmit={handleSendReset} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" variant="gradient" className="w-full h-11" disabled={loading || !email}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
              </Button>
            </form>
          ) : null}

          <div className="text-center">
            <Link href="/login" className="text-sm text-[#6D5EF5] hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
