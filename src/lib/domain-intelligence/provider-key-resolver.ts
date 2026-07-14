// Resolves encrypted API keys from the database for domain intelligence providers
// Uses the same encryption/decryption as api-keys.service.ts

import { supabaseAdmin } from "@/lib/supabase/admin"
import { createHash, createDecipheriv } from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || createHash('sha256').update(String(process.env.SUPABASE_SERVICE_ROLE_KEY)).digest('hex').slice(0, 32)

function decrypt(text: string): string {
  if (!text || !text.includes(":")) return text
  try {
    const parts = text.split(':')
    const iv = Buffer.from(parts.shift()!, 'hex')
    const encrypted = parts.join(':')
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch {
    return text
  }
}

export interface ResolvedKey {
  apiKey: string
  baseUrl: string | null
  enabled: boolean
}

export async function resolveProviderKey(slug: string): Promise<ResolvedKey | null> {
  const { data: keyRow } = await supabaseAdmin
    .from("ai_api_keys")
    .select("key_encrypted, is_enabled")
    .eq("provider_slug", slug)
    .eq("is_enabled", true)
    .limit(1)
    .maybeSingle()

  if (!keyRow?.key_encrypted) return null

  const { data: provider } = await supabaseAdmin
    .from("ai_providers")
    .select("base_url, enabled")
    .eq("slug", slug)
    .maybeSingle()

  return {
    apiKey: decrypt(keyRow.key_encrypted),
    baseUrl: provider?.base_url || null,
    enabled: provider?.enabled ?? true,
  }
}
