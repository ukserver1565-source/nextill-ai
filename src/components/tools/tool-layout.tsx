"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, Loader2, Sparkles } from "lucide-react"
import { FadeIn } from "@/components/layout/animations"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"

interface ToolLayoutProps {
  title: string
  description: string
  creditsCost: number
  guestLimit: number
  icon?: ReactNode
  children: ReactNode
  result?: ReactNode
}

export function ToolLayout({ title, description, creditsCost, guestLimit, icon, children, result }: ToolLayoutProps) {
  const { profile } = useAuth()

  return (
    <FadeIn>
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
      <PublicHeader />
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6 space-y-4 sm:space-y-6 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Link
              href={profile ? "/dashboard" : "/"}
              className="inline-flex items-center gap-2 h-9 rounded-lg px-3.5 text-xs sm:text-sm font-medium bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D5EF5]/40 mb-1 sm:mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {profile ? "Back to Dashboard" : "Home"}
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              {icon && <div className="hidden xs:block shrink-0">{icon}</div>}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight break-words">{title}</h1>
                <p className="text-xs sm:text-sm text-muted mt-0.5 sm:mt-1">{description}</p>
              </div>
            </div>
          </div>
          {!profile && (
            <Link href="/login" className="shrink-0 self-start sm:self-auto">
              <Button variant="outline" size="sm">
                Sign in for more
              </Button>
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted">
          {profile ? (
            <span className="flex items-center gap-1"><Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {creditsCost} credit{creditsCost !== 1 ? "s" : ""} per use</span>
          ) : (
            <span className="flex items-center gap-1">Guest: {guestLimit} uses/day · <Link href="/login" className="text-primary hover:underline">Sign up</Link> for unlimited</span>
          )}
        </div>

        {/* Mobile: stacked | Tablet (md 768+): 50/50 | Desktop (lg 1024+): 40/60 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          <div className="md:col-span-1 lg:col-span-2 space-y-3 sm:space-y-4">
            <div className="glass-card rounded-xl p-4 sm:p-5">
              {children}
            </div>
          </div>

          <div className="md:col-span-1 lg:col-span-3 space-y-3 sm:space-y-4">
            {result}
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
    </FadeIn>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-muted" />
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center max-w-sm">
        <Sparkles className="w-8 h-8 text-muted mx-auto mb-3" />
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted mt-1">{description}</p>
      </div>
    </div>
  )
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="glass-card rounded-xl p-4 border border-danger/30">
      <p className="text-sm text-danger">{message}</p>
    </div>
  )
}

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return <label htmlFor={htmlFor} className="text-xs text-muted font-medium block mb-1.5">{children}</label>
}

export function SelectField({ id, value, onChange, options, className }: {
  id?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`flex h-10 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 ${className || ""}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-background">{o.label}</option>
      ))}
    </select>
  )
}

export function RangeField({ id, value, onChange, min, max, step = 100 }: {
  id?: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number
}) {
  return (
    <div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-border accent-primary"
      />
      <div className="flex justify-between text-[10px] text-muted mt-1">
        <span>{min}</span>
        <span className="text-primary font-medium">{value}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export function NumberField({ id, value, onChange, min, max }: {
  id?: string; value: number; onChange: (v: number) => void; min?: number; max?: number
}) {
  return (
    <Input
      id={id}
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-24"
    />
  )
}
