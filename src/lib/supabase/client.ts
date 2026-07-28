import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// persistSession: true → session stored in localStorage + cookies
// autoRefreshToken: true → refresh JWT before expiry
// cookieOptions: long expiry so session survives browser close
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    cookieOptions: {
      name: "sb-auth-token",
      lifetime: 60 * 60 * 24 * 7, // 7 days in seconds
      domain: "",
      path: "/",
      sameSite: "lax",
    },
  },
})
