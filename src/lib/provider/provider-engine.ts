import { providerRepo } from "./provider-repo"
import { localEngine } from "./local-engine"
import type { ProviderResult, ProviderConfig, ModelConfig, AiLog } from "./provider-types"

interface GenerateOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

async function callProviderApi(
  provider: ProviderConfig,
  model: ModelConfig,
  prompt: string,
  options: GenerateOptions
): Promise<{ content: string; latencyMs: number; promptTokens: number; completionTokens: number } | null> {
  const start = Date.now()
  const apiKey = await providerRepo.getApiKey(provider.slug)
  if (!apiKey && provider.slug !== "ollama") return null

  try {
    const baseUrl = (provider.baseUrl ?? "").replace(/\/+$/, "")
    const modelId = options.model ?? model.providerModelId
    const temperature = options.temperature ?? model.temperature
    const maxTokens = options.maxTokens ?? model.maxTokens

    let url = ""
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    let body: unknown

    switch (provider.slug) {
      case "gemini": {
        url = `${baseUrl}/models/${modelId}:generateContent?key=${apiKey}`
        body = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens: maxTokens },
        }
        const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) })
        if (!res.ok) return null
        const data = await res.json()
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!content) return null
        const usage = data?.usageMetadata
        return {
          content,
          latencyMs: Date.now() - start,
          promptTokens: usage?.promptTokenCount ?? 0,
          completionTokens: usage?.candidatesTokenCount ?? 0,
        }
      }

      case "claude": {
        url = `${baseUrl}/messages`
        headers["x-api-key"] = apiKey!
        headers["anthropic-version"] = "2023-06-01"
        body = {
          model: modelId,
          max_tokens: maxTokens,
          messages: [
            ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
            { role: "user", content: prompt },
          ],
          ...(temperature != null ? { temperature } : {}),
        }
        const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) })
        if (!res.ok) return null
        const data = await res.json()
        const content = data?.content?.[0]?.text
        if (!content) return null
        return {
          content,
          latencyMs: Date.now() - start,
          promptTokens: data?.usage?.input_tokens ?? 0,
          completionTokens: data?.usage?.output_tokens ?? 0,
        }
      }

      case "ollama": {
        url = `${baseUrl}/api/generate`
        body = {
          model: modelId,
          prompt,
          ...(temperature != null ? { temperature } : {}),
          ...(maxTokens ? { options: { num_predict: maxTokens } } : {}),
        }
        const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: AbortSignal.timeout(120000) })
        if (!res.ok) return null
        const data = await res.json()
        const content = data?.response
        if (!content) return null
        return {
          content,
          latencyMs: Date.now() - start,
          promptTokens: data?.prompt_eval_count ?? 0,
          completionTokens: data?.eval_count ?? 0,
        }
      }

      case "openrouter": {
        url = `${baseUrl}/chat/completions`
        headers["Authorization"] = `Bearer ${apiKey}`
        headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.adultpulse.co.uk"
        headers["X-Title"] = "Nextill AI"
        body = {
          model: modelId,
          messages: [
            ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
            { role: "user", content: prompt },
          ],
          ...(temperature != null ? { temperature } : {}),
          ...(maxTokens ? { max_tokens: maxTokens } : {}),
        }
        const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) })
        if (!res.ok) return null
        const data = await res.json()
        const content = data?.choices?.[0]?.message?.content
        if (!content) return null
        return {
          content,
          latencyMs: Date.now() - start,
          promptTokens: data?.usage?.prompt_tokens ?? 0,
          completionTokens: data?.usage?.completion_tokens ?? 0,
        }
      }

      default: {
        url = `${baseUrl}/chat/completions`
        headers["Authorization"] = `Bearer ${apiKey}`
        body = {
          model: modelId,
          messages: [
            ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
            { role: "user", content: prompt },
          ],
          ...(temperature != null ? { temperature } : {}),
          ...(maxTokens ? { max_tokens: maxTokens } : {}),
        }
        const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) })
        if (!res.ok) return null
        const data = await res.json()
        const content = data?.choices?.[0]?.message?.content
        if (!content) return null
        return {
          content,
          latencyMs: Date.now() - start,
          promptTokens: data?.usage?.prompt_tokens ?? 0,
          completionTokens: data?.usage?.completion_tokens ?? 0,
        }
      }
    }
  } catch {
    return null
  }
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

async function generateText(
  workflowSlug: string,
  prompt: string,
  options?: GenerateOptions
): Promise<ProviderResult> {
  const startTotal = Date.now()

  const workflow = await providerRepo.getWorkflowSettings(workflowSlug)
  if (!workflow) {
    const fallbackResult = localFallback(prompt, workflowSlug)
    return { ...fallbackResult, error: "Workflow not found" }
  }

  const enabledProviders = await providerRepo.getEnabledProviders()
  const preferSlug = workflow.defaultModel?.split("/")[0] ?? enabledProviders[0]?.slug

  const orderedProviders = [...enabledProviders].sort((a, b) => {
    if (a.slug === preferSlug) return -1
    if (b.slug === preferSlug) return 1
    return a.priority - b.priority
  })

  for (const provider of orderedProviders) {
    const models = await providerRepo.getModels(provider.slug)
    if (models.length === 0) continue

    const model = options?.model
      ? models.find((m) => m.providerModelId === options.model || m.modelName === options.model)
      : models.find((m) => m.isDefault) ?? models[0]

    if (!model) continue

    const result = await callProviderApi(provider, model, prompt, {
      ...options,
      temperature: options?.temperature ?? workflow.temperature ?? model.temperature,
      maxTokens: options?.maxTokens ?? model.maxTokens,
    })

    if (result) {
      const latency = Date.now() - startTotal
      const cost = (model.costInput * result.promptTokens + model.costOutput * result.completionTokens) / 1_000_000

      const logEntry: AiLog = {
        providerSlug: provider.slug,
        modelName: model.providerModelId,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        totalTokens: result.promptTokens + result.completionTokens,
        latencyMs: result.latencyMs,
        cost,
        success: true,
        error: null,
        workflowSlug,
      }

      await providerRepo.logAiCall(logEntry)
      await providerRepo.updateProviderUsage(provider.slug, result.latencyMs, cost, true)

      return {
        success: true,
        content: result.content,
        model: model.providerModelId,
        provider: provider.slug,
        latencyMs: latency,
      }
    }

    await providerRepo.updateProviderUsage(
      provider.slug,
      Date.now() - startTotal,
      0,
      false
    )
  }

  const fallbackResult = localFallback(prompt, workflowSlug)
  const fallbackLatency = Date.now() - startTotal

  await providerRepo.logAiCall({
    providerSlug: "local-engine",
    modelName: null,
    promptTokens: estimateTokens(prompt),
    completionTokens: estimateTokens(fallbackResult.content),
    totalTokens: estimateTokens(prompt) + estimateTokens(fallbackResult.content),
    latencyMs: fallbackLatency,
    cost: 0,
    success: true,
    error: null,
    workflowSlug,
  })

  return {
    ...fallbackResult,
    latencyMs: fallbackLatency,
  }
}

function localFallback(prompt: string, workflowSlug: string): ProviderResult {
  const content = localEngine.generateFallback(prompt, workflowSlug)
  return {
    success: true,
    content,
    provider: "local-engine",
    model: "fallback",
  }
}

async function resolveProvider(workflowSlug: string): Promise<{
  provider: ProviderConfig | null
  model: ModelConfig | null
}> {
  const workflow = await providerRepo.getWorkflowSettings(workflowSlug)
  if (!workflow) return { provider: null, model: null }

  const enabledProviders = await providerRepo.getEnabledProviders()
  if (enabledProviders.length === 0) return { provider: null, model: null }

  const preferSlug = workflow.defaultModel?.split("/")[0] ?? enabledProviders[0].slug
  const sorted = [...enabledProviders].sort((a, b) => {
    if (a.slug === preferSlug) return -1
    if (b.slug === preferSlug) return 1
    return a.priority - b.priority
  })

  for (const provider of sorted) {
    const apiKey = await providerRepo.getApiKey(provider.slug)
    if (!apiKey && provider.slug !== "ollama") continue
    const models = await providerRepo.getModels(provider.slug)
    const model = models.find((m) => m.isDefault) ?? models[0]
    if (model) return { provider, model }
  }

  return { provider: null, model: null }
}

async function testConnection(providerSlug: string): Promise<{
  success: boolean
  latencyMs: number
  error?: string
}> {
  const providers = await providerRepo.getEnabledProviders()
  const provider = providers.find((p) => p.slug === providerSlug)
  if (!provider) return { success: false, latencyMs: 0, error: "Provider not found" }

  const apiKey = await providerRepo.getApiKey(providerSlug)
  if (!apiKey && providerSlug !== "ollama")
    return { success: false, latencyMs: 0, error: "No API key configured" }

  const start = Date.now()

  try {
    const baseUrl = (provider.baseUrl ?? "").replace(/\/+$/, "")

    if (providerSlug === "ollama") {
      const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(10000) })
      return { success: res.ok, latencyMs: Date.now() - start }
    }

    if (providerSlug === "gemini") {
      const res = await fetch(`${baseUrl}/models?key=${apiKey}`, { signal: AbortSignal.timeout(10000) })
      return { success: res.ok, latencyMs: Date.now() - start }
    }

    const res = await fetch(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    })

    return { success: res.ok, latencyMs: Date.now() - start }
  } catch (err) {
    return {
      success: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Connection failed",
    }
  }
}

export const providerEngine = {
  generateText,
  resolveProvider,
  testConnection,
}
