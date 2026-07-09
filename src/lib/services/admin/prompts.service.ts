import { supabaseAdmin } from "@/lib/supabase/admin"

export interface PromptRow {
  id: string
  tool_slug: string
  name: string
  content: string
  version: number
  is_active: boolean
  variables: string[]
  created_at: string
  updated_at: string
}

export const promptsService = {
  async list(toolSlug?: string) {
    let query = supabaseAdmin
      .from("prompts")
      .select("*")
      .order("tool_slug", { ascending: true })
      .order("version", { ascending: false })
    if (toolSlug) query = query.eq("tool_slug", toolSlug)
    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch prompts: ${error.message}`)
    return (data || []) as PromptRow[]
  },

  async get(id: string) {
    const { data, error } = await supabaseAdmin
      .from("prompts")
      .select("*")
      .eq("id", id)
      .single()
    if (error) throw new Error(`Failed to fetch prompt: ${error.message}`)
    return data as PromptRow
  },

  async create(data: {
    tool_slug: string
    name: string
    content: string
    variables?: string[]
    is_active?: boolean
  }) {
    const { data: active, error: activeError } = await supabaseAdmin
      .from("prompts")
      .select("version")
      .eq("tool_slug", data.tool_slug)
      .order("version", { ascending: false })
      .limit(1)
    if (activeError) throw new Error(`Failed to fetch latest version: ${activeError.message}`)
    const latestVersion = (active && active.length > 0) ? active[0].version : 0
    const { data: created, error } = await supabaseAdmin
      .from("prompts")
      .insert({
        tool_slug: data.tool_slug,
        name: data.name,
        content: data.content,
        version: latestVersion + 1,
        variables: data.variables || [],
        is_active: data.is_active ?? false,
      })
      .select()
      .single()
    if (error) throw new Error(`Failed to create prompt: ${error.message}`)
    return created as PromptRow
  },

  async update(id: string, data: {
    name?: string
    content?: string
    variables?: string[]
    is_active?: boolean
  }) {
    const { data: prompt } = await supabaseAdmin
      .from("prompts")
      .select("*")
      .eq("id", id)
      .single()
    if (!prompt) throw new Error("Prompt not found")
    const payload: any = { ...data }
    if (data.content && data.content !== prompt.content) {
      const { data: active } = await supabaseAdmin
        .from("prompts")
        .select("version")
        .eq("tool_slug", prompt.tool_slug)
        .order("version", { ascending: false })
        .limit(1)
      const latestVersion = (active && active.length > 0) ? active[0].version : 0
      payload.version = latestVersion + 1
      payload.is_active = true
    }
    const { data: updated, error } = await supabaseAdmin
      .from("prompts")
      .update(payload)
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(`Failed to update prompt: ${error.message}`)
    return updated as PromptRow
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin.from("prompts").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete prompt: ${error.message}`)
  },

  async getActive(toolSlug: string) {
    const { data, error } = await supabaseAdmin
      .from("prompts")
      .select("*")
      .eq("tool_slug", toolSlug)
      .eq("is_active", true)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw new Error(`Failed to fetch active prompt: ${error.message}`)
    return data as PromptRow | null
  },

  async restoreVersion(id: string, version: number) {
    const { data: original, error: fetchError } = await supabaseAdmin
      .from("prompts")
      .select("*")
      .eq("id", id)
      .single()
    if (fetchError || !original) throw new Error("Prompt not found")
    const { data: versionData, error: versionError } = await supabaseAdmin
      .from("prompts")
      .select("*")
      .eq("tool_slug", original.tool_slug)
      .eq("version", version)
      .single()
    if (versionError || !versionData) throw new Error(`Version ${version} not found`)
    const { data: active } = await supabaseAdmin
      .from("prompts")
      .select("version")
      .eq("tool_slug", original.tool_slug)
      .order("version", { ascending: false })
      .limit(1)
    const latestVersion = (active && active.length > 0) ? active[0].version : 0
    const { data: restored, error } = await supabaseAdmin
      .from("prompts")
      .insert({
        tool_slug: versionData.tool_slug,
        name: versionData.name + " (restored v" + version + ")",
        content: versionData.content,
        version: latestVersion + 1,
        variables: versionData.variables,
        is_active: true,
      })
      .select()
      .single()
    if (error) throw new Error(`Failed to restore version: ${error.message}`)
    await supabaseAdmin.from("prompts").update({ is_active: false }).eq("id", id)
    await supabaseAdmin.from("prompts").update({ is_active: false }).eq("id", versionData.id)
    return restored as PromptRow
  },

  async getVersions(id: string) {
    const { data: prompt, error: fetchError } = await supabaseAdmin
      .from("prompts")
      .select("tool_slug")
      .eq("id", id)
      .single()
    if (fetchError || !prompt) throw new Error("Prompt not found")
    const { data, error } = await supabaseAdmin
      .from("prompts")
      .select("*")
      .eq("tool_slug", prompt.tool_slug)
      .order("version", { ascending: false })
    if (error) throw new Error(`Failed to fetch versions: ${error.message}`)
    return (data || []) as PromptRow[]
  },
}
