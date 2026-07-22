"use client"

import { useState, Suspense } from "react"
import { Sparkles, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/lib/auth/actions"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function LoginPageContent() {
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get("redirect") || ""
  const errorParam = searchParams.get("error") || ""

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(errorParam)
  const [attempts, setAttempts] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const formData = new FormData()
      formData.set("email", email)
      formData.set("password", password)
      if (redirectParam) formData.set("redirect", redirectParam)
      const result = await login(formData)
      if (result?.redirect) { window.location.href = result.redirect; return }
      if (result?.error) {
        setError(result.error)
        setAttempts(prev => prev + 1)
      }
    } catch {
      setError("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  const isRateLimited = attempts >= 5

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-background items-center justify-center">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-[128px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/4 left-1/4 w-4 h-4 border border-primary/40 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-6 h-6 border border-accent/30 rounded-lg rotate-45" />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-primary/40 rounded-full" />
        <div className="relative z-10 text-center max-w-md px-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6 shadow-lg shadow-primary/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-primary-text">Nextill AI</h1>
          <p className="text-muted mt-3 text-lg">Your AI content workflow.</p>

        </div>
      </div>

      {/* Right - Form Panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8 space-y-6">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="text-muted text-sm mt-1">Sign in to your account</p>
            </div>

            {/* Error display */}
            {error && (
              <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-[#EF4444] font-medium">{error}</p>
                  {error.includes("Invalid email or password") && (
                    <p className="text-[10px] text-[#EF4444]/70 mt-1">
                      Tip: Check your email and password. Passwords are case-sensitive.
                      {attempts >= 3 && " Too many failed attempts may temporarily lock your account."}
                    </p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError("") }}
                required
              />

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#A7B0C0]">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError("") }}
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

              <div className="flex items-center justify-end text-sm">
                <Link href="/reset-password" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="gradient" className="w-full h-11" disabled={loading || isRateLimited}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isRateLimited ? "Too many attempts — wait a moment" : "Sign In"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
            </div>

            <p className="text-center text-sm text-muted">
              Don&apos;t have an account?{" "}
              <Link href={redirectParam ? `/signup?redirect=${encodeURIComponent(redirectParam)}` : "/signup"} className="text-primary hover:underline font-medium">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
      <LoginPageContent />
    </Suspense>
  )
}
