"use client"

import { useRef, useState, type ReactNode, type MouseEvent } from "react"

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
  onClick?: () => void
}

export function MagneticButton({ children, className = "", strength = 0.3, onClick }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState("")

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setTransform(`translate(${x * strength}px, ${y * strength}px)`)
  }

  const handleMouseLeave = () => setTransform("")

  return (
    <div
      ref={ref}
      className={`magnetic ${className}`}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
