"use client"

import { useState } from "react"
import { Eye, EyeOff, Shield, ArrowRight, AlertCircle } from "lucide-react"
import { adminLogin } from "@/lib/auth/admin-actions"
import Link from "next/link"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [attempts, setAttempts] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const formData = new FormData()
    formData.set("email", email)
    formData.set("password", password)
    try {
      const result = await adminLogin(formData)
      if (result?.redirect) { window.location.href = result.redirect; return }
      if (result?.error) {
        setError(result.error)
        setAttempts(prev => prev + 1)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    }
    setLoading(false)
  }

  const isRateLimited = attempts >= 5

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary/20 to-accent/10 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6 shadow-2xl shadow-primary/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Nextill AI</h1>
          <p className="text-muted text-lg">Admin Portal</p>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted">
            <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
            System operational
          </div>
          {/* Security info */}
          <div className="mt-8 text-left max-w-sm mx-auto space-y-2">
            <p className="text-[10px] text-muted flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Session timeout: 4 hours of inactivity
            </p>
            <p className="text-[10px] text-muted flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Rate limited: max 5 attempts per 15 minutes
            </p>
            <p className="text-[10px] text-muted flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              All admin actions are logged for security
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Admin Login</h2>
              <p className="text-sm text-muted mt-1">Authorized administrators only</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-[#EF4444] font-medium">{error}</p>
                    {error.includes("Invalid email or password") && attempts >= 2 && (
                      <p className="text-[10px] text-[#EF4444]/70 mt-1">
                        {5 - attempts > 0 ? `${5 - attempts} attempts remaining before temporary lockout.` : "Account temporarily locked. Please wait 15 minutes."}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted">Email</label>
                <input
                  type="email"
                  placeholder="admin@nextill.ai"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError("") }}
                  required
                  className="w-full h-11 px-4 rounded-lg bg-background border border-white/[0.06] text-white text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError("") }}
                    required
                    minLength={8}
                    className="w-full h-11 px-4 pr-11 rounded-lg bg-background border border-white/[0.06] text-white text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-muted">Min 8 characters. Passwords are case-sensitive.</p>
              </div>

              <button
                type="submit"
                disabled={loading || isRateLimited}
                className="w-full h-11 rounded-lg bg-gradient-to-br from-primary to-accent text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isRateLimited ? (
                  "Too many attempts — wait 15 minutes"
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-[11px] text-muted text-center">
                <Link href="/login" className="hover:text-primary transition-colors">Back to user login</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
