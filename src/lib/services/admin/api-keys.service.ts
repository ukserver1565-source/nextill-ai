import { supabaseAdmin } from "@/lib/supabase/admin"
import { createHash, randomBytes, createCipheriv, createDecipheriv } from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || createHash('sha256').update(String(process.env.SUPABASE_SERVICE_ROLE_KEY)).digest('hex').slice(0, 32)
const IV_LENGTH = 16

function encrypt(text: string) {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(text: string) {
  const parts = text.split(':')
  const iv = Buffer.from(parts.shift()!, 'hex')
  const encrypted = parts.join(':')
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export interface ApiKeyRow {
  id: string
  provider_id: string
  name: string
  key_encrypted: string
  key_preview: string
  is_enabled: boolean
  last_tested_at: string | null
  last_test_success: boolean | null
  created_at: string
  updated_at: string
}

function maskKey(key: string | null): string {
  if (!key) return ""
  if (key.length <= 8) return key.slice(0, 2) + "****"
  return key.slice(0, 4) + "****" + key.slice(-4)
}

export const apiKeysService = {
  async list(providerId?: string) {
    let query = supabaseAdmin
      .from("api_keys")
      .select("id, provider_id, name, key_preview, is_enabled, last_tested_at, last_test_success, created_at, updated_at, providers:provider_id(name)")
    if (providerId) query = query.eq("provider_id", providerId)
    query = query.order("created_at", { ascending: false })
    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch API keys: ${error.message}`)
    return (data || []) as any[]
  },

  async get(id: string) {
    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .select("*, providers:provider_id(name)")
      .eq("id", id)
      .single()
    if (error) throw new Error(`Failed to fetch API key: ${error.message}`)
    return data as any
  },

  async create(data: {
    provider_id: string
    name: string
    key: string
    is_enabled?: boolean
  }) {
    const encrypted = encrypt(data.key)
    const preview = maskKey(data.key)
    const { data: created, error } = await supabaseAdmin
      .from("api_keys")
      .insert({
        provider_id: data.provider_id,
        name: data.name,
        key_encrypted: encrypted,
        key_preview: preview,
        is_enabled: data.is_enabled ?? true,
      })
      .select()
      .single()
    if (error) throw new Error(`Failed to create API key: ${error.message}`)
    return created as ApiKeyRow
  },

  async update(id: string, data: {
    name?: string
    key?: string
    is_enabled?: boolean
  }) {
    const payload: any = { ...data }
    if (data.key) {
      payload.key_encrypted = encrypt(data.key)
      payload.key_preview = maskKey(data.key)
      delete payload.key
    } else {
      delete payload.key
    }
    const { data: updated, error } = await supabaseAdmin
      .from("api_keys")
      .update(payload)
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(`Failed to update API key: ${error.message}`)
    return updated as ApiKeyRow
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin.from("api_keys").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete API key: ${error.message}`)
  },

  async rotate(id: string, newKey: string) {
    const { data: existing } = await supabaseAdmin
      .from("api_keys")
      .select("id, provider_id, name")
      .eq("id", id)
      .single()
    if (!existing) throw new Error("API key not found")
    await this.delete(id)
    return this.create({
      provider_id: existing.provider_id,
      name: existing.name + " (rotated)",
      key: newKey,
    })
  },

  async test(id: string): Promise<{ success: boolean; latency: number }> {
    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .select("key_encrypted, providers:provider_id(base_url, provider)")
      .eq("id", id)
      .single()
    if (error || !data) throw new Error(`API key not found: ${error?.message}`)
    const apiKey = decrypt(data.key_encrypted)
    const provider = (data as any).providers
    const start = Date.now()
    let success = false
    try {
      const response = await fetch(provider?.base_url || `https://api.${provider?.provider || "openai"}.com/v1/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10000),
      })
      success = response.ok
    } catch {
      success = false
    }
    const latency = Date.now() - start
    await supabaseAdmin.from("api_keys").update({
      last_tested_at: new Date().toISOString(),
      last_test_success: success,
    }).eq("id", id)
    return { success, latency }
  },

  async toggle(id: string) {
    const { data: current } = await supabaseAdmin
      .from("api_keys")
      .select("is_enabled")
      .eq("id", id)
      .single()
    if (!current) throw new Error("API key not found")
    const { data: updated, error } = await supabaseAdmin
      .from("api_keys")
      .update({ is_enabled: !current.is_enabled })
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(`Failed to toggle API key: ${error.message}`)
    return updated as ApiKeyRow
  },
}
