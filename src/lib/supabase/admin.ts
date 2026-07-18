import { createClient, SupabaseClient } from "@supabase/supabase-js"

let _admin: SupabaseClient | null = null
let _initError: string | null = null

function getAdmin(): SupabaseClient {
  if (_admin) return _admin

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    _initError = `Missing env vars: ${!supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : ""} ${!supabaseServiceKey ? "SUPABASE_SERVICE_ROLE_KEY" : ""}`.trim()
    throw new Error(_initError)
  }

  _admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return _admin
}

/**
 * Safe accessor — returns null if env vars are missing instead of crashing.
 * Use this in public-facing API routes that should degrade gracefully.
 */
export function getAdminOrNull(): SupabaseClient | null {
  try {
    return getAdmin()
  } catch {
    return null
  }
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getAdmin() as any)[prop]
  },
})
