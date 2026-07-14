import { supabaseAdmin } from "@/lib/supabase/admin"
import type { PostgrestError } from "@supabase/supabase-js"

// Safe wrapper that catches "relation does not exist" errors and returns empty results
// Accepts any thenable (Supabase PostgrestBuilder, Promise, etc.)
export async function safeQuery<T>(
  queryFn: () => { then: (onfulfilled: (value: any) => any, onrejected?: (reason: any) => any) => any }
): Promise<{ data: T[]; error: null; count: number }> {
  try {
    const { data, error, count }: { data: T[] | null; error: PostgrestError | null; count?: number | null } = await queryFn()
    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("relation")) {
        return { data: [], error: null, count: 0 }
      }
      throw error
    }
    return { data: data || [], error: null, count: count || 0 }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes("does not exist") || message.includes("relation") || message.includes("42P01") || message.includes("schema cache")) {
      return { data: [], error: null, count: 0 }
    }
    throw err
  }
}

export async function safeSingle<T>(
  queryFn: () => { then: (onfulfilled: (value: any) => any, onrejected?: (reason: any) => any) => any }
): Promise<{ data: T | null; error: null }> {
  try {
    const { data, error }: { data: T | null; error: PostgrestError | null } = await queryFn()
    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("relation")) {
        return { data: null, error: null }
      }
      throw error
    }
    return { data: data ?? null, error: null }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes("does not exist") || message.includes("relation") || message.includes("42P01") || message.includes("schema cache")) {
      return { data: null, error: null }
    }
    throw err
  }
}

export async function safeCount(
  queryFn: () => { then: (onfulfilled: (value: any) => any, onrejected?: (reason: any) => any) => any }
): Promise<{ count: number; error: null }> {
  try {
    const { count, error }: { count: number | null; error: PostgrestError | null } = await queryFn()
    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("relation")) {
        return { count: 0, error: null }
      }
      throw error
    }
    return { count: count || 0, error: null }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes("does not exist") || message.includes("relation") || message.includes("42P01") || message.includes("schema cache")) {
      return { count: 0, error: null }
    }
    throw err
  }
}
