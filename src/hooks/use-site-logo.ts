"use client"

import { useState, useEffect } from "react"

let cachedLogoUrl: string | null = null
let cacheTime = 0
const CACHE_TTL = 60_000 // 60 seconds

export function useSiteLogo(): string | null {
  const [logoUrl, setLogoUrl] = useState<string | null>(cachedLogoUrl)

  useEffect(() => {
    const now = Date.now()
    if (cachedLogoUrl !== null && (now - cacheTime) < CACHE_TTL) {
      setLogoUrl(cachedLogoUrl)
      return
    }

    fetch("/api/public/site-logo")
      .then(r => r.json())
      .then(data => {
        const url = data.logo_url || null
        cachedLogoUrl = url
        cacheTime = Date.now()
        setLogoUrl(url)
      })
      .catch(() => {
        // Keep whatever we had
      })
  }, [])

  return logoUrl
}
