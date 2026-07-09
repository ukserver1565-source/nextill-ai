"use client"

import { useState, useMemo } from "react"
import { Sparkles, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signup } from "@/lib/auth/actions"
import Link from "next/link"

function getStrength(password: string): { label: string; level: number; color: string } {
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  if (score <= 1) return { label: "Weak", level: 0, color: "bg-red-500" }
  if (score <= 2) return { label: "Fair", level: 1, color: "bg-orange-500" }
  if (score <= 3) return { label: "Good", level: 2, color: "bg-yellow-500" }
  return { label: "Strong", level: 3, color: "bg-green-500" }
}

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const strength = useMemo(() => getStrength(password), [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setLoading(true)
    setError("")
    try {
      const formData = new FormData()
      formData.set("email", email)
      formData.set("password", password)
      formData.set("full_name", fullName)
      const result = await signup(formData)
      if (result?.redirect) { window.location.href = result.redirect; return }
      if (result?.error) setError(result.error)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#090B16] flex">
      {/* Left - Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#6D5EF5]/20 via-[#090B16] to-[#090B16] items-center justify-center">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#6D5EF5]/30 rounded-full blur-[128px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/4 left-1/4 w-4 h-4 border border-[#6D5EF5]/40 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-6 h-6 border border-[#8B5CF6]/30 rounded-lg rotate-45" />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-[#6D5EF5]/40 rounded-full" />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] mb-6 shadow-lg shadow-[#6D5EF5]/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6] bg-clip-text text-transparent">
            Nextill AI
          </h1>
          <p className="text-[#A7B0C0] mt-3 text-lg">Your AI content workflow.</p>
        </div>
      </div>

      {/* Right - Form Panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-8 space-y-6">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Create your account</h1>
              <p className="text-[#A7B0C0] text-sm mt-1">Get started with Nextill AI</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#A7B0C0]">Password</label>
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

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.level ? strength.color : "bg-white/[0.06]"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${strength.level >= 3 ? "text-green-400" : strength.level >= 2 ? "text-yellow-400" : "text-red-400"}`}>
                    {strength.label}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#A7B0C0]">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7B0C0] hover:text-white transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-white/[0.06] bg-[#090B16] text-[#6D5EF5] focus:ring-[#6D5EF5]/40"
                />
                <span className="text-sm text-[#A7B0C0]">
                  I accept the{" "}
                  <span className="text-[#6D5EF5] hover:underline">Terms of Service</span> and{" "}
                  <span className="text-[#6D5EF5] hover:underline">Privacy Policy</span>
                </span>
              </label>

              <Button type="submit" variant="gradient" className="w-full h-11" disabled={loading || !acceptTerms}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-[#A7B0C0]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#6D5EF5] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
