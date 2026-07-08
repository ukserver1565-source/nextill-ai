"use client"

import { Search, X } from "lucide-react"

interface AdminSearchProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export function AdminSearch({ value, onChange, placeholder = "Search..." }: AdminSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-8 rounded-lg bg-card border border-border text-sm placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
      />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
