import { supabaseAdmin } from "@/lib/supabase/admin"

export interface PromptRow {
  id: string
  slug: string
  name: string
  category: string
  prompt_text: string
  default_model: string | null
  temperature: number | null
  max_tokens: number | null
  is_active: boolean
  version: number
  created_at: string
  updated_at: string
}

export const promptsService = {
  async list(category?: string) {
    let query = supabaseAdmin
      .from("prompt_templates")
      .select("*")
      .order("category", { ascending: true })
      .order("version", { ascending: false })
    if (category) query = query.eq("category", category)
    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch prompts: ${error.message}`)
    return (data || []) as PromptRow[]
  },

  async get(id: string) {
    const { data, error } = await supabaseAdmin
      .from("prompt_templates")
      .select("*")
      .eq("id", id)
      .single()
    if (error) throw new Error(`Failed to fetch prompt: ${error.message}`)
    return data as PromptRow
  },

  async create(data: {
    slug: string
    name: string
    category: string
    prompt_text: string
    default_model?: string
    temperature?: number
    max_tokens?: number
    is_active?: boolean
  }) {
    const { data: active, error: activeError } = await supabaseAdmin
      .from("prompt_templates")
      .select("version")
      .eq("category", data.category)
      .order("version", { ascending: false })
      .limit(1)
    if (activeError) throw new Error(`Failed to fetch latest version: ${activeError.message}`)
    const latestVersion = (active && active.length > 0) ? active[0].version : 0
    const { data: created, error } = await supabaseAdmin
      .from("prompt_templates")
      .insert({
        slug: data.slug,
        name: data.name,
        category: data.category,
        prompt_text: data.prompt_text,
        default_model: data.default_model || null,
        temperature: data.temperature ?? 0.7,
        max_tokens: data.max_tokens ?? 4096,
        version: latestVersion + 1,
        is_active: data.is_active ?? false,
      })
      .select()
      .single()
    if (error) throw new Error(`Failed to create prompt: ${error.message}`)
    return created as PromptRow
  },

  async update(id: string, data: {
    name?: string
    prompt_text?: string
    category?: string
    default_model?: string
    temperature?: number
    max_tokens?: number
    is_active?: boolean
  }) {
    const { data: prompt } = await supabaseAdmin
      .from("prompt_templates")
      .select("*")
      .eq("id", id)
      .single()
    if (!prompt) throw new Error("Prompt not found")
    const payload: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() }
    if (data.prompt_text && data.prompt_text !== prompt.prompt_text) {
      const { data: active } = await supabaseAdmin
        .from("prompt_templates")
        .select("version")
        .eq("category", prompt.category)
        .order("version", { ascending: false })
        .limit(1)
      const latestVersion = (active && active.length > 0) ? active[0].version : 0
      payload.version = latestVersion + 1
      payload.is_active = true
    }
    const { data: updated, error } = await supabaseAdmin
      .from("prompt_templates")
      .update(payload)
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(`Failed to update prompt: ${error.message}`)
    return updated as PromptRow
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin.from("prompt_templates").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete prompt: ${error.message}`)
  },

  async getActive(category: string) {
    const { data, error } = await supabaseAdmin
      .from("prompt_templates")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw new Error(`Failed to fetch active prompt: ${error.message}`)
    return data as PromptRow | null
  },

  async restoreVersion(id: string, version: number) {
    const { data: original, error: fetchError } = await supabaseAdmin
      .from("prompt_templates")
      .select("*")
      .eq("id", id)
      .single()
    if (fetchError || !original) throw new Error("Prompt not found")
    const { data: versionData, error: versionError } = await supabaseAdmin
      .from("prompt_templates")
      .select("*")
      .eq("category", original.category)
      .eq("version", version)
      .single()
    if (versionError || !versionData) throw new Error(`Version ${version} not found`)
    const { data: active } = await supabaseAdmin
      .from("prompt_templates")
      .select("version")
      .eq("category", original.category)
      .order("version", { ascending: false })
      .limit(1)
    const latestVersion = (active && active.length > 0) ? active[0].version : 0
    const { data: restored, error } = await supabaseAdmin
      .from("prompt_templates")
      .insert({
        slug: versionData.slug + "-restored-v" + version,
        name: versionData.name + " (restored v" + version + ")",
        category: versionData.category,
        prompt_text: versionData.prompt_text,
        default_model: versionData.default_model,
        temperature: versionData.temperature,
        max_tokens: versionData.max_tokens,
        version: latestVersion + 1,
        is_active: true,
      })
      .select()
      .single()
    if (error) throw new Error(`Failed to restore version: ${error.message}`)
    await supabaseAdmin.from("prompt_templates").update({ is_active: false }).eq("id", id)
    await supabaseAdmin.from("prompt_templates").update({ is_active: false }).eq("id", versionData.id)
    return restored as PromptRow
  },

  async getVersions(id: string) {
    const { data: prompt, error: fetchError } = await supabaseAdmin
      .from("prompt_templates")
      .select("category")
      .eq("id", id)
      .single()
    if (fetchError || !prompt) throw new Error("Prompt not found")
    const { data, error } = await supabaseAdmin
      .from("prompt_templates")
      .select("*")
      .eq("category", prompt.category)
      .order("version", { ascending: false })
    if (error) throw new Error(`Failed to fetch versions: ${error.message}`)
    return (data || []) as PromptRow[]
  },
}
