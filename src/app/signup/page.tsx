"use client"

import { useState, useMemo, Suspense } from "react"
import { Sparkles, Eye, EyeOff, Loader2, AlertCircle, Check, X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signup } from "@/lib/auth/actions"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function getStrength(password: string): { label: string; level: number; color: string; checks: { label: string; met: boolean }[] } {
  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "Number (0-9)", met: /[0-9]/.test(password) },
    { label: "Special character (!@#$%...)", met: /[^A-Za-z0-9]/.test(password) },
  ]

  const passed = checks.filter(c => c.met).length
  if (passed <= 1) return { label: "Weak", level: 0, color: "bg-[#EF4444]", checks }
  if (passed <= 2) return { label: "Fair", level: 1, color: "bg-[#F59E0B]", checks }
  if (passed <= 3) return { label: "Good", level: 2, color: "bg-[#EAB308]", checks }
  return { label: "Strong", level: 3, color: "bg-[#22C55E]", checks }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your password.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
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
        <div className="relative z-10 text-center max-w-md px-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6 shadow-lg shadow-primary/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-primary-text">Nextill AI</h1>
          <p className="text-muted mt-3 text-lg">Your AI content workflow.</p>

          {/* What you get */}
          <div className="mt-8 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-white">What you get for free</span>
            </div>
            <div className="space-y-2 text-xs">
              {["AI-powered SEO tools", "Blog post generator", "Plagiarism checker", "Domain intelligence", "100 free credits to start"].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-[#22C55E] shrink-0" />
                  <span className="text-muted">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security notice */}
          <div className="mt-4 text-left space-y-2">
            <p className="text-[10px] text-muted flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Only real email addresses allowed (Gmail, Outlook, etc.)
            </p>
            <p className="text-[10px] text-muted flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Passwords are encrypted with industry-standard bcrypt
            </p>
            <p className="text-[10px] text-muted flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              No spam — email verification required
            </p>
          </div>
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
              <h1 className="text-2xl font-bold text-white">Create your account</h1>
              <p className="text-muted text-sm mt-1">Get started with Nextill AI — it&apos;s free</p>
            </div>

            {/* Error display */}
            {error && (
              <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-[#EF4444] font-medium">{error}</p>
                  {error.includes("email") && error.includes("not allowed") && (
                    <p className="text-[10px] text-[#EF4444]/70 mt-1">
                      Please use a real email address: Gmail, Outlook, iCloud, Yahoo, ProtonMail, etc.
                      Disposable/temporary emails are blocked for your account security.
                    </p>
                  )}
                </div>
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
              <p className="text-[10px] text-muted -mt-2">
                Your display name — can be changed later in Settings.
              </p>

              <Input
                label="Email"
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError("") }}
                required
              />
              <p className="text-[10px] text-muted -mt-2">
                Use a real email: Gmail, Outlook, iCloud, Yahoo, etc. No temp/disposable emails.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted">Password</label>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-muted">
                  Example: <code className="text-primary">MyStr0ng!Pass</code> — min 8 chars
                </p>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.level ? strength.color : "bg-white/[0.06]"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength.level >= 3 ? "text-[#22C55E]" : strength.level >= 2 ? "text-[#EAB308]" : "text-[#EF4444]"}`}>
                    {strength.label} password
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {strength.checks.map(check => (
                      <div key={check.label} className="flex items-center gap-1.5">
                        {check.met ? (
                          <Check className="w-3 h-3 text-[#22C55E]" />
                        ) : (
                          <X className="w-3 h-3 text-muted/40" />
                        )}
                        <span className={`text-[10px] ${check.met ? "text-[#22C55E]" : "text-muted/60"}`}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError("") }}
                    required
                    minLength={8}
                    className={passwordMismatch ? "border-[#EF4444]/50 focus:ring-[#EF4444]/30" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordMismatch && (
                  <p className="text-[10px] text-[#EF4444] flex items-center gap-1">
                    <X className="w-3 h-3" /> Passwords do not match
                  </p>
                )}
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-white/[0.06] bg-background text-primary focus:ring-primary/40"
                />
                <span className="text-sm text-muted">
                  I accept the{" "}
                  <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and{" "}
                  <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
                </span>
              </label>

              <Button type="submit" variant="gradient" className="w-full h-11" disabled={loading || !acceptTerms || passwordMismatch}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Free Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted">
              Already have an account?{" "}
              <Link href={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : "/login"} className="text-primary hover:underline font-medium">
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
      <SignupPageContent />
    </Suspense>
  )
}
