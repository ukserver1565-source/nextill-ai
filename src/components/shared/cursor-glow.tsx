"use client"

import { useEffect, useRef } from "react"

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleMove = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
    }

    const handleEnter = () => { el.style.opacity = "1" }
    const handleLeave = () => { el.style.opacity = "0" }

    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseenter", handleEnter)
    document.addEventListener("mouseleave", handleLeave)

    return () => {
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseenter", handleEnter)
      document.removeEventListener("mouseleave", handleLeave)
    }
  }, [])

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300"
      style={{
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(109, 94, 245, 0.06) 0%, transparent 70%)",
        filter: "blur(40px)",
      }}
      aria-hidden="true"
    />
  )
}
