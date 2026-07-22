"use client"

import { useState, useMemo, Suspense } from "react"
import { Sparkles, Eye, EyeOff, Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signup } from "@/lib/auth/actions"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

// Real email providers — block disposable/temporary emails
const REAL_EMAIL_DOMAINS = [
  "gmail.com", "googlemail.com", "outlook.com", "outlook.co.uk", "hotmail.com", "live.com",
  "yahoo.com", "yahoo.co.uk", "icloud.com", "me.com", "mac.com",
  "protonmail.com", "proton.me", "zoho.com", "aol.com",
  "mail.com", "gmx.com", "fastmail.com", "tutanota.com",
  "yandex.com", "mail.ru", "rediffmail.com",
]

function isRealEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase()
  if (!domain) return false
  return REAL_EMAIL_DOMAINS.includes(domain)
}

function getStrength(password: string): { level: number } {
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  if (score <= 1) return { level: 0 } // Weak
  if (score <= 2) return { level: 1 } // Fair
  if (score <= 3) return { level: 2 } // Good
  return { level: 3 } // Strong
}

function SignupPageContent() {
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get("redirect") || ""

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
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword
  const emailLooksFake = email.length > 0 && !isRealEmail(email)

  const getPasswordBorderColor = () => {
    if (!password) return ""
    if (strength.level >= 3) return "border-[#22C55E]/60 focus:ring-[#22C55E]/30"
    if (strength.level >= 2) return "border-[#EAB308]/60 focus:ring-[#EAB308]/30"
    return "border-[#EF4444]/60 focus:ring-[#EF4444]/30"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (!isRealEmail(email)) {
      setError("Please use a real email address (Gmail, Outlook, iCloud, Yahoo, etc.).")
      return
    }
    setLoading(true)
    setError("")
    try {
      const formData = new FormData()
      formData.set("email", email)
      formData.set("password", password)
      formData.set("full_name", fullName)
      if (redirectParam) formData.set("redirect", redirectParam)
      const result = await signup(formData)
      if (result?.redirect) { window.location.href = result.redirect; return }
      if (result?.error) setError(result.error)
    } catch {
      setError("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-background items-center justify-center">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-[128px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />
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
          <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-8 space-y-6">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Create your account</h1>
              <p className="text-[#A7B0C0] text-sm mt-1">Get started with Nextill AI — it&apos;s free</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              {/* Email — with real email validation indicator */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B0C0]">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError("") }}
                    required
                    className={`w-full h-11 px-4 pr-10 rounded-lg bg-[#090B16] border text-sm text-white placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 transition-all ${
                      emailLooksFake
                        ? "border-[#EF4444]/50 focus:ring-[#EF4444]/30"
                        : email && !emailLooksFake
                          ? "border-[#22C55E]/50 focus:ring-[#22C55E]/30"
                          : "border-white/[0.06] focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5]/50"
                    }`}
                  />
                  {email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailLooksFake ? (
                        <X className="w-4 h-4 text-[#EF4444]" />
                      ) : (
                        <Check className="w-4 h-4 text-[#22C55E]" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Password — with border color feedback */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B0C0]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Jone#567"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError("") }}
                    required
                    minLength={8}
                    className={`w-full h-11 px-4 pr-11 rounded-lg bg-[#090B16] border text-sm text-white placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 transition-all ${
                      getPasswordBorderColor() || "border-white/[0.06] focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5]/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7B0C0] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <p className={`text-[10px] font-medium ${
                    strength.level >= 3 ? "text-[#22C55E]" : strength.level >= 2 ? "text-[#EAB308]" : "text-[#EF4444]"
                  }`}>
                    {strength.level >= 3 ? "Strong" : strength.level >= 2 ? "Good" : strength.level >= 1 ? "Fair" : "Weak"} password
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A7B0C0]">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Jone#567"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError("") }}
                    required
                    minLength={8}
                    className={`w-full h-11 px-4 pr-11 rounded-lg bg-[#090B16] border text-sm text-white placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 transition-all ${
                      passwordMismatch
                        ? "border-[#EF4444]/50 focus:ring-[#EF4444]/30"
                        : confirmPassword && !passwordMismatch
                          ? "border-[#22C55E]/50 focus:ring-[#22C55E]/30"
                          : "border-white/[0.06] focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5]/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7B0C0] hover:text-white transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordMismatch && (
                  <p className="text-[10px] text-[#EF4444]">Passwords do not match</p>
                )}
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
                  <Link href="/terms" className="text-[#6D5EF5] hover:underline">Terms</Link> and{" "}
                  <Link href="/privacy-policy" className="text-[#6D5EF5] hover:underline">Privacy Policy</Link>
                </span>
              </label>

              <Button type="submit" variant="gradient" className="w-full h-11" disabled={loading || !acceptTerms || passwordMismatch}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Free Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-[#A7B0C0]">
              Already have an account?{" "}
              <Link href={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : "/login"} className="text-[#6D5EF5] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-6 h-6 animate-spin text-[#6D5EF5]" /></div>}>
      <SignupPageContent />
    </Suspense>
  )
}
