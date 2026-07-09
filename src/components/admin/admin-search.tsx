"use client"

import { Search, X } from "lucide-react"

interface AdminSearchProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export function AdminSearch({ value, onChange, placeholder = "Search..." }: AdminSearchProps) {
  return (
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0C0] group-focus-within:text-[#6D5EF5] transition-colors" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-8 rounded-lg bg-[#151C2E] border border-white/[0.06] text-sm text-white placeholder:text-[#A7B0C0] outline-none focus:ring-2 focus:ring-[#6D5EF5]/30 focus:border-[#6D5EF5]/30 transition-all"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7B0C0] hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
