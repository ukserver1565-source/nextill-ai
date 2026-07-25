"use client"

import { useEffect, useRef } from "react"

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const animRef = useRef<number>(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let visible = false

    const handleMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (!visible) {
        visible = true
        el.style.opacity = "1"
        animate()
      }
    }

    const animate = () => {
      el.style.left = `${pos.current.x}px`
      el.style.top = `${pos.current.y}px`
      animRef.current = requestAnimationFrame(animate)
    }

    const handleLeave = () => {
      visible = false
      el.style.opacity = "0"
      cancelAnimationFrame(animRef.current)
    }

    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseleave", handleLeave)

    return () => {
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseleave", handleLeave)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <>
      {/* Outer soft glow */}
      <div
        ref={ref}
        className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-500"
        style={{
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(109, 94, 245, 0.12) 0%, rgba(76, 201, 240, 0.04) 40%, transparent 70%)",
          filter: "blur(50px)",
        }}
        aria-hidden="true"
      />
    </>
  )
}
