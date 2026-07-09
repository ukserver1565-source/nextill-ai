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

export interface AIProviderRow {
  id: string
  name: string
  slug: string
  provider: string
  api_key_encrypted: string | null
  base_url: string | null
  is_enabled: boolean
  priority: number
  config: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AIProviderWithModels extends AIProviderRow {
  model_count: number
  api_key_preview: string | null
}

function maskKey(key: string | null): string | null {
  if (!key) return null
  if (key.length <= 8) return key.slice(0, 2) + "****"
  return key.slice(0, 4) + "****" + key.slice(-4)
}

export const providersService = {
  async list(): Promise<AIProviderWithModels[]> {
    const { data, error } = await supabaseAdmin
      .from("ai_providers")
      .select("*, ai_models:ai_models(count)")
      .order("priority", { ascending: true })
      .order("name")
    if (error) throw new Error(`Failed to fetch providers: ${error.message}`)
    return (data || []).map((p: any) => ({
      ...p,
      model_count: p.ai_models?.[0]?.count ?? 0,
      api_key_preview: p.api_key_encrypted ? maskKey(decrypt(p.api_key_encrypted)) : null,
      api_key_encrypted: undefined,
      ai_models: undefined,
    }))
  },

  async get(id: string): Promise<AIProviderWithModels> {
    const { data, error } = await supabaseAdmin
      .from("ai_providers")
      .select("*, ai_models:ai_models(count)")
      .eq("id", id)
      .single()
    if (error) throw new Error(`Failed to fetch provider: ${error.message}`)
    return {
      ...data,
      model_count: (data as any).ai_models?.[0]?.count ?? 0,
      api_key_preview: data.api_key_encrypted ? maskKey(decrypt(data.api_key_encrypted)) : null,
      api_key_encrypted: undefined,
      ai_models: undefined,
    } as AIProviderWithModels
  },

  async create(data: {
    name: string
    slug: string
    provider: string
    api_key?: string
    base_url?: string
    priority?: number
    config?: Record<string, any>
  }) {
    const payload: any = {
      name: data.name,
      slug: data.slug,
      provider: data.provider,
      base_url: data.base_url || null,
      priority: data.priority ?? 0,
      is_enabled: true,
      config: data.config || {},
    }
    if (data.api_key) {
      payload.api_key_encrypted = encrypt(data.api_key)
    }
    const { data: created, error } = await supabaseAdmin
      .from("ai_providers")
      .insert(payload)
      .select()
      .single()
    if (error) throw new Error(`Failed to create provider: ${error.message}`)
    return created as AIProviderRow
  },

  async update(id: string, data: {
    name?: string
    slug?: string
    provider?: string
    api_key?: string
    base_url?: string
    priority?: number
    is_enabled?: boolean
    config?: Record<string, any>
  }) {
    const payload: any = { ...data }
    if (data.api_key) {
      payload.api_key_encrypted = encrypt(data.api_key)
      delete payload.api_key
    } else {
      delete payload.api_key
    }
    const { data: updated, error } = await supabaseAdmin
      .from("ai_providers")
      .update(payload)
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(`Failed to update provider: ${error.message}`)
    return updated as AIProviderRow
  },

  async delete(id: string) {
    await supabaseAdmin.from("ai_models").delete().eq("provider_id", id)
    const { error } = await supabaseAdmin.from("ai_providers").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete provider: ${error.message}`)
  },

  async testConnection(id: string): Promise<{ latency: number; success: boolean }> {
    const { data, error } = await supabaseAdmin
      .from("ai_providers")
      .select("provider, api_key_encrypted, base_url, config")
      .eq("id", id)
      .single()
    if (error || !data) throw new Error(`Provider not found: ${error?.message}`)
    const apiKey = data.api_key_encrypted ? decrypt(data.api_key_encrypted) : null
    if (!apiKey) throw new Error("No API key configured for this provider")
    const start = Date.now()
    try {
      const response = await fetch(data.base_url || `https://api.${data.provider}.com/v1/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10000),
      })
      const latency = Date.now() - start
      return { latency, success: response.ok }
    } catch {
      const latency = Date.now() - start
      return { latency, success: false }
    }
  },

  async setPriority(id: string, priority: number) {
    const { data, error } = await supabaseAdmin
      .from("ai_providers")
      .update({ priority })
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(`Failed to set priority: ${error.message}`)
    return data as AIProviderRow
  },

  async toggle(id: string) {
    const { data: current } = await supabaseAdmin
      .from("ai_providers")
      .select("is_enabled")
      .eq("id", id)
      .single()
    const { data, error } = await supabaseAdmin
      .from("ai_providers")
      .update({ is_enabled: !current?.is_enabled })
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(`Failed to toggle provider: ${error.message}`)
    return data as AIProviderRow
  },

  async getFallbackChain(): Promise<AIProviderRow[]> {
    const { data, error } = await supabaseAdmin
      .from("ai_providers")
      .select("*")
      .eq("is_enabled", true)
      .order("priority", { ascending: true })
    if (error) throw new Error(`Failed to fetch fallback chain: ${error.message}`)
    return (data || []) as AIProviderRow[]
  },
}
