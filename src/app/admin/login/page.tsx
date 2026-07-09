"use client"

import { useState } from "react"
import { Eye, EyeOff, Shield, ArrowRight } from "lucide-react"
import { adminLogin } from "@/lib/auth/admin-actions"
import Link from "next/link"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
      if (result?.error) setError(result.error)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#090B16] flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B5CF6]/10 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2RDVFRjUiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0wIDM2YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] mb-6 shadow-2xl shadow-[#6D5EF5]/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Nextill AI</h1>
          <p className="text-[#A7B0C0] text-lg">Admin Portal</p>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[#A7B0C0]">
            <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
            System operational
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Admin Login</h2>
              <p className="text-sm text-[#A7B0C0] mt-1">Authorized administrators only</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-xs text-[#EF4444]">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#A7B0C0]">Email</label>
                <input
                  type="email"
                  placeholder="admin@nextill.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-lg bg-[#090B16] border border-white/[0.06] text-white text-sm placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5]/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#A7B0C0]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full h-11 px-4 pr-11 rounded-lg bg-[#090B16] border border-white/[0.06] text-white text-sm placeholder:text-[#A7B0C0]/50 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5]/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A7B0C0] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-[#6D5EF5]/20"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-[11px] text-[#A7B0C0] text-center">
                <Link href="/login" className="hover:text-[#6D5EF5] transition-colors">Back to user login</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
