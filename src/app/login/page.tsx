"use client"

import { useState } from "react"
import { Sparkles, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login, forgotPassword } from "@/lib/auth/actions"
import Link from "next/link"

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "forgot">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.set("email", email)

      if (mode === "login") {
        formData.set("password", password)
        const result = await login(formData)
        if (result?.redirect) { window.location.href = result.redirect; return }
        if (result?.error) setError(result.error)
      } else {
        const result = await forgotPassword(formData)
        if (result?.error) setError(result.error)
        if (result?.success) setSuccess(result.message || "")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl gradient-primary mb-3 sm:mb-4">
            <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">
            {mode === "login" ? "Welcome Back" : "Reset Password"}
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">Nextill AI Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-lg sm:rounded-xl p-5 sm:p-6 space-y-3 sm:space-y-4">
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

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {mode === "login" && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted">Password</label>
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
          )}

          <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Send Reset Link"}
          </Button>

          {mode === "login" && (
            <div className="space-y-2 text-center text-[11px]">
              <button
                type="button"
                onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}
                className="text-muted hover:text-foreground"
              >
                Forgot password?
              </button>
              <div>
                <span className="text-muted">Don&apos;t have an account? </span>
                <Link href="/signup" className="text-primary-light hover:underline">Sign up</Link>
              </div>
            </div>
          )}

          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className="text-[11px] text-muted hover:text-foreground w-full text-center"
            >
              Back to sign in
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
