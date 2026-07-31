"use client"

import Link from "next/link"
import Image from "next/image"
import { useSiteLogo } from "@/hooks/use-site-logo"
import { LogoIcon } from "./logo-icon"

interface SiteLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  href?: string
  className?: string
}

export function SiteLogo({ size = "md", showText = true, href = "/", className }: SiteLogoProps) {
  const logoUrl = useSiteLogo()

  const sizes = {
    sm: { box: "w-7 h-7", icon: 28, img: "w-7 h-7", px: 28, text: "text-sm" },
    md: { box: "w-8 h-8", icon: 32, img: "w-8 h-8", px: 32, text: "text-lg" },
    lg: { box: "w-16 h-16 rounded-2xl", icon: 64, img: "w-16 h-16 rounded-2xl", px: 64, text: "text-4xl" },
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
          <div className={`${s.box} rounded-lg flex items-center justify-center ${logoUrl ? "hidden" : ""}`}>
            <LogoIcon size={s.icon} />
          </div>
        </div>
      ) : (
        <div className={`${s.box} rounded-lg flex items-center justify-center`}>
          <LogoIcon size={s.icon} />
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
