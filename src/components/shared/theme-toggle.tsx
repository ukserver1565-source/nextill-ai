"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/lib/theme/theme-provider"

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[#A7B0C0] hover:text-white hover:bg-[#151C2E] transition-all text-xs font-medium ${className}`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
      <span className="hidden lg:inline">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
    </button>
  )
}
