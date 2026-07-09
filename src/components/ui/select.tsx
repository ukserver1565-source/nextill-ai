"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Search, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value?: string
  onChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  searchable?: boolean
  className?: string
  disabled?: boolean
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ value, onChange, options, placeholder = "Select...", searchable = false, className, disabled }, ref) => {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const dropdownRef = React.useRef<HTMLDivElement>(null)
    const searchInputRef = React.useRef<HTMLInputElement>(null)

    const selectedOption = options.find((o) => o.value === value)

    const filteredOptions = searchable
      ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
      : options

    React.useEffect(() => {
      if (open && searchable) {
        setTimeout(() => searchInputRef.current?.focus(), 50)
      }
      if (!open) setSearch("")
    }, [open, searchable])

    React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node)
        ) {
          setOpen(false)
        }
      }
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false)
      }
      if (open) document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }, [open])

    const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({})

    React.useEffect(() => {
      if (open && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setDropdownStyle({
          position: "fixed",
          top: `${rect.bottom + 4}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
        })
      }
    }, [open])

    const handleSelect = (opt: SelectOption) => {
      onChange?.(opt.value)
      setOpen(false)
    }

    return (
      <div ref={ref} className={cn("relative", className)}>
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#090B16]/60 px-3 py-2 text-sm backdrop-blur-xl transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/40 focus:border-[#6D5EF5]/50",
            disabled && "cursor-not-allowed opacity-50",
            open && "border-[#6D5EF5]/50"
          )}
        >
          <span className={cn(!selectedOption && "text-[#A7B0C0]")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-[#A7B0C0] transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>

        {open &&
          createPortal(
            <div
              ref={dropdownRef}
              style={dropdownStyle}
              className={cn(
                "z-50 max-h-60 overflow-auto rounded-xl border border-[rgba(255,255,255,0.06)]",
                "bg-[#111827]/95 backdrop-blur-2xl shadow-2xl",
                "animate-in fade-in-0 zoom-in-95",
                "custom-scrollbar"
              )}
            >
              {searchable && (
                <div className="sticky top-0 border-b border-[rgba(255,255,255,0.06)] bg-[#111827] p-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A7B0C0]" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search..."
                      className="w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-[#090B16]/60 py-1.5 pl-8 pr-2 text-sm text-white placeholder:text-[#A7B0C0] focus:outline-none focus:ring-1 focus:ring-[#6D5EF5]/40"
                    />
                  </div>
                </div>
              )}

              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-[#A7B0C0]">No options found</div>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-sm text-white transition-colors hover:bg-white/[0.06]",
                      opt.value === value && "bg-white/[0.04] text-[#6D5EF5]"
                    )}
                  >
                    <span>{opt.label}</span>
                    {opt.value === value && (
                      <Check className="h-4 w-4 text-[#6D5EF5]" />
                    )}
                  </button>
                ))
              )}
            </div>,
            document.body
          )}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select, type SelectOption }
