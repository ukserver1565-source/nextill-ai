"use client"

import Link from "next/link"
import Image from "next/image"
import { Sparkles } from "lucide-react"
import { useSiteLogo } from "@/hooks/use-site-logo"

interface SiteLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  href?: string
  className?: string
}

export function SiteLogo({ size = "md", showText = true, href = "/", className }: SiteLogoProps) {
  const logoUrl = useSiteLogo()

  const sizes = {
    sm: { box: "w-7 h-7", icon: "w-3.5 h-3.5", img: "w-7 h-7", px: 28, text: "text-sm" },
    md: { box: "w-8 h-8", icon: "w-4 h-4", img: "w-8 h-8", px: 32, text: "text-lg" },
    lg: { box: "w-16 h-16 rounded-2xl", icon: "w-8 h-8", img: "w-16 h-16 rounded-2xl", px: 64, text: "text-4xl" },
  }
  const s = sizes[size]

  const logoContent = logoUrl ? (
    <Image
      src={logoUrl}
      alt=""
      width={s.px}
      height={s.px}
      sizes={`${s.px}px`}
      className={`${s.img} object-contain rounded-lg`}
      priority={size !== "sm"}
      onError={(e) => {
        ;(e.target as HTMLImageElement).style.display = "none"
        const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement
        if (fallback) fallback.style.display = "flex"
      }}
    />
  ) : null

  return (
    <Link href={href} className={`flex items-center gap-2.5 ${className || ""}`}>
      {logoUrl ? (
        <div className="relative">
          {logoContent}
          <div className={`${s.box} rounded-lg gradient-primary flex items-center justify-center ${logoUrl ? "hidden" : ""}`}>
            <Sparkles className={`${s.icon} text-white`} />
          </div>
        </div>
      ) : (
        <div className={`${s.box} rounded-lg gradient-primary flex items-center justify-center`}>
          <Sparkles className={`${s.icon} text-white`} />
        </div>
      )}
      {showText && (
        <span className={`${s.text} font-bold tracking-tight`}>
          <span className="gradient-primary-text">Nextill AI</span>
        </span>
      )}
    </Link>
  )
}
