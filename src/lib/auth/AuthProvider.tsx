"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"

export interface UserProfile {
  id: string
  user_id: string
  full_name: string | null
  email: string | null
  role: string
  plan: string
  credits: number
  avatar_url: string | null
  status: string
  created_at: string
}

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchProfile = useCallback(async (userId: string, retryCount = 0) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
    if (error) {
      if (retryCount < 1) {
        await new Promise((r) => setTimeout(r, 2000))
        return fetchProfile(userId, retryCount + 1)
      }
    }
    setProfile(data as UserProfile | null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) await fetchProfile(s.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) fetchProfile(s.user.id)
      else setProfile(null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setProfile(null)
    router.push("/login")
  }, [router])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
