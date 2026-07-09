import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createHash, randomBytes, createCipheriv } from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || createHash('sha256').update(String(process.env.SUPABASE_SERVICE_ROLE_KEY)).digest('hex').slice(0, 32)
const IV_LENGTH = 16

function encrypt(text: string) {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function maskKey(key: string): string {
  if (!key) return ""
  if (key.length <= 8) return key.slice(0, 2) + "****"
  return key.slice(0, 4) + "****" + key.slice(-4)
}

export async function POST(req: NextRequest) {
  try {
    const { id, new_key } = await req.json()
    if (!id || !new_key) throw new Error("Key ID and new key are required")
    const { data: existing } = await supabaseAdmin
      .from("api_keys")
      .select("id, provider_id, name")
      .eq("id", id)
      .single()
    if (!existing) throw new Error("API key not found")
    await supabaseAdmin.from("api_keys").delete().eq("id", id)
    const encrypted = encrypt(new_key)
    const preview = maskKey(new_key)
    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .insert({
        provider_id: existing.provider_id,
        name: existing.name + " (rotated)",
        key_encrypted: encrypted,
        key_preview: preview,
        is_enabled: true,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to rotate API key", details: (err as Error).message }, { status: 400 })
  }
}
