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

function maskKey(key: string | null): string {
  if (!key) return ""
  if (key.length <= 8) return key.slice(0, 2) + "****"
  return key.slice(0, 4) + "****" + key.slice(-4)
}

export interface AiApiKeyRow {
  id: string
  provider_slug: string
  name: string
  key_prefix: string
  is_enabled: boolean
  last_used_at: string | null
  created_at: string
  updated_at: string
}

export const apiKeysService = {
  async list(providerSlug?: string) {
    let query = supabaseAdmin
      .from("ai_api_keys")
      .select("id, provider_slug, name, key_prefix, is_enabled, last_used_at, created_at, updated_at")
    if (providerSlug) query = query.eq("provider_slug", providerSlug)
    query = query.order("created_at", { ascending: false })
    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch API keys: ${error.message}`)
    return (data || []) as AiApiKeyRow[]
  },

  async get(id: string) {
    const { data, error } = await supabaseAdmin
      .from("ai_api_keys")
      .select("id, provider_slug, name, key_prefix, is_enabled, last_used_at, created_at, updated_at")
      .eq("id", id)
      .single()
    if (error) throw new Error(`Failed to fetch API key: ${error.message}`)
    return data as AiApiKeyRow
  },

  async create(data: {
    provider_slug: string
    name: string
    key: string
    is_enabled?: boolean
  }) {
    const encrypted = encrypt(data.key)
    const keyPrefix = data.key.slice(0, 8)
    const { data: created, error } = await supabaseAdmin
      .from("ai_api_keys")
      .insert({
        provider_slug: data.provider_slug,
        name: data.name,
        key_encrypted: encrypted,
        key_prefix: keyPrefix,
        is_enabled: data.is_enabled ?? true,
      })
      .select("id, provider_slug, name, key_prefix, is_enabled, last_used_at, created_at, updated_at")
      .single()
    if (error) throw new Error(`Failed to create API key: ${error.message}`)
    return created as AiApiKeyRow
  },

  async update(id: string, data: {
    name?: string
    key?: string
    is_enabled?: boolean
  }) {
    const payload: Record<string, unknown> = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.is_enabled !== undefined) payload.is_enabled = data.is_enabled
    if (data.key) {
      payload.key_encrypted = encrypt(data.key)
      payload.key_prefix = data.key.slice(0, 8)
    }
    payload.updated_at = new Date().toISOString()
    const { data: updated, error } = await supabaseAdmin
      .from("ai_api_keys")
      .update(payload)
      .eq("id", id)
      .select("id, provider_slug, name, key_prefix, is_enabled, last_used_at, created_at, updated_at")
      .single()
    if (error) throw new Error(`Failed to update API key: ${error.message}`)
    return updated as AiApiKeyRow
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin.from("ai_api_keys").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete API key: ${error.message}`)
  },

  async rotate(id: string, newKey: string) {
    const { data: existing } = await supabaseAdmin
      .from("ai_api_keys")
      .select("id, provider_slug, name")
      .eq("id", id)
      .single()
    if (!existing) throw new Error("API key not found")
    await this.delete(id)
    return this.create({
      provider_slug: existing.provider_slug,
      name: existing.name + " (rotated)",
      key: newKey,
    })
  },

  async test(id: string): Promise<{ success: boolean; latency: number }> {
    const { data, error } = await supabaseAdmin
      .from("ai_api_keys")
      .select("key_encrypted, provider_slug")
      .eq("id", id)
      .single()
    if (error || !data) throw new Error(`API key not found: ${error?.message}`)
    const apiKey = decrypt(data.key_encrypted)
    const { data: provider } = await supabaseAdmin
      .from("ai_providers")
      .select("base_url, slug")
      .eq("slug", data.provider_slug)
      .single()
    const start = Date.now()
    let success = false
    try {
      const baseUrl = (provider?.base_url || `https://api.openai.com/v1`).replace(/\/+$/, "")
      const response = await fetch(`${baseUrl}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10000),
      })
      success = response.ok
    } catch {
      success = false
    }
    const latency = Date.now() - start
    return { success, latency }
  },

  async toggle(id: string) {
    const { data: current } = await supabaseAdmin
      .from("ai_api_keys")
      .select("is_enabled")
      .eq("id", id)
      .single()
    if (!current) throw new Error("API key not found")
    const { data: updated, error } = await supabaseAdmin
      .from("ai_api_keys")
      .update({ is_enabled: !current.is_enabled, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, provider_slug, name, key_prefix, is_enabled, last_used_at, created_at, updated_at")
      .single()
    if (error) throw new Error(`Failed to toggle API key: ${error.message}`)
    return updated as AiApiKeyRow
  },
}
